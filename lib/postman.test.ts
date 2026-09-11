import { describe, expect, it } from "vitest";
import {
  buildPostmanCollection,
  flattenPostmanCollection,
  parsePostmanAuth,
  parsePostmanCollection,
  postmanUrlToString,
  prepareRequest,
  substituteVariables,
  type PcCollection,
} from "@/lib/postman";

describe("substituteVariables", () => {
  it("replaces known variables and leaves unknown placeholders intact", () => {
    expect(substituteVariables("https://{{host}}/v1/{{id}}", { host: "api.example.com", id: "42" })).toBe(
      "https://api.example.com/v1/42"
    );
    expect(substituteVariables("{{missing}}", {})).toBe("{{missing}}");
  });
});

describe("postmanUrlToString", () => {
  it("prefers raw over host/path reconstruction", () => {
    expect(postmanUrlToString({ raw: "https://a.b/c" })).toBe("https://a.b/c");
  });
  it("reconstructs from host and path arrays when raw is absent", () => {
    expect(postmanUrlToString({ host: ["api", "github", "com"], path: ["repos", "v1"] })).toBe(
      "https://api.github.com/repos/v1"
    );
  });
  it("adds query params and honors disabled flags when reconstructing", () => {
    const url = postmanUrlToString({
      host: ["x", "dev"],
      path: ["search"],
      query: [
        { key: "a", value: "1" },
        { key: "b", value: "2", disabled: true },
      ],
    });
    expect(url).toBe("https://x.dev/search?a=1");
  });
  it("keeps raw URLs intact (query included in raw)", () => {
    expect(postmanUrlToString({ raw: "https://x.dev?a=1" })).toBe("https://x.dev?a=1");
  });
  it("handles plain strings and undefined", () => {
    expect(postmanUrlToString("https://plain.example")).toBe("https://plain.example");
    expect(postmanUrlToString(undefined)).toBe("");
  });
});

describe("parsePostmanAuth", () => {
  it("parses bearer, basic and apikey configs", () => {
    expect(parsePostmanAuth({ type: "bearer", bearer: [{ token: "abc" }] })).toEqual({ type: "bearer", token: "abc" });
    expect(parsePostmanAuth({ type: "basic", basic: [{ username: "u", password: "p" }] })).toEqual({
      type: "basic",
      username: "u",
      password: "p",
    });
    expect(parsePostmanAuth({ type: "apikey", apikey: [{ key: "k", value: "v", in: "query" }] })).toEqual({
      type: "apikey",
      key: "k",
      value: "v",
      in: "query",
    });
  });
  it("falls back to none for missing or empty configs", () => {
    expect(parsePostmanAuth(undefined)).toEqual({ type: "none" });
    expect(parsePostmanAuth({ type: "noauth" })).toEqual({ type: "none" });
    expect(parsePostmanAuth({ type: "bearer" })).toEqual({ type: "none" });
  });
});

describe("flattenPostmanCollection", () => {
  const sample: PcCollection = {
    info: { name: "Sample", schema: "" },
    variable: [{ key: "base", value: "https://api.example.com" }],
    item: [
      {
        name: "Folder",
        item: [
          {
            name: "Get user",
            request: {
              method: "GET",
              url: { raw: "{{base}}/users/{{userId}}" },
              header: [{ key: "Accept", value: "application/json", disabled: true }],
            },
          },
          {
            name: "Create user",
            request: {
              method: "POST",
              url: { raw: "{{base}}/users" },
              body: { mode: "urlencoded", urlencoded: [{ key: "name", value: "Ada Lovelace" }] },
            },
          },
        ],
      },
    ],
  };

  it("walks nested folders with prefixed names", () => {
    const flat = flattenPostmanCollection(sample, {});
    expect(flat.map((f) => f.name)).toEqual(["Folder / Get user", "Folder / Create user"]);
  });

  it("substitutes collection and URL variables", () => {
    const withUrlVar: PcCollection = {
      ...sample,
      item: [
        {
          name: "X",
          request: {
            method: "GET",
            url: { raw: "{{base}}/y", variable: [{ key: "base", value: "https://override.dev" }] },
          },
        },
      ],
    };
    const flat = flattenPostmanCollection(withUrlVar, {
      base: "https://api.example.com",
    });
    expect(flat[0].url).toBe("https://override.dev/y");
  });

  it("skips disabled headers and encodes urlencoded bodies", () => {
    const flat = flattenPostmanCollection(sample, {});
    const [getUser, createUser] = flat;
    expect(getUser.headers).toEqual([]);
    expect(createUser.body).toBe("name=Ada%20Lovelace");
    expect(createUser.bodyMode).toBe("urlencoded");
  });

  it("rejects invalid collection JSON", () => {
    expect(parsePostmanCollection("not json")).toBeNull();
    expect(parsePostmanCollection('{"info":{}}')).toBeNull();
    expect(parsePostmanCollection(JSON.stringify(sample))).not.toBeNull();
  });
});

describe("buildPostmanCollection round-trip", () => {
  it("produces a v2.1 collection preserving method, url, headers and auth", () => {
    const flat = flattenPostmanCollection(
      {
        info: { name: "Src" },
        item: [
          {
            name: "Auth check",
            request: {
              method: "GET",
              url: { raw: "https://api.example.com/me" },
              auth: { type: "bearer", bearer: [{ token: "tok-123" }] },
            },
          },
        ],
      },
      {}
    );
    const built = buildPostmanCollection("Exported", flat);
    expect(built.info?.schema).toContain("v2.1.0");
    expect(built.info?._postman_id).toBeDefined();
    const req = (built.item?.[0]?.request as { method?: string; auth?: unknown }) ?? {};
    expect(req.method).toBe("GET");
    expect(JSON.stringify(built)).toContain("tok-123");
    expect(JSON.stringify(built)).toContain("raw");
  });
});

describe("prepareRequest", () => {
  it("merges query params into the URL", () => {
    const { url } = prepareRequest({
      id: "1",
      name: "r",
      method: "GET",
      url: "https://api.example.com/search",
      query: [{ key: "q", value: "dev kit" }],
      headers: [],
      body: "",
      bodyMode: "raw",
      auth: { type: "none" },
    });
    expect(url).toContain("q=dev+kit");
  });

  it("applies bearer auth and skips body for GET", () => {
    const { init } = prepareRequest({
      id: "1",
      name: "r",
      method: "GET",
      url: "https://api.example.com/me",
      query: [],
      headers: [],
      body: "IGNORED",
      bodyMode: "raw",
      auth: { type: "bearer", token: "tok" },
    });
    expect((init.headers as Record<string, string>)["Authorization"]).toBe("Bearer tok");
    expect(init.body).toBeUndefined();
  });

  it("adds basic auth and sets Content-Type for raw JSON body", () => {
    const { init } = prepareRequest({
      id: "1",
      name: "r",
      method: "POST",
      url: "https://api.example.com/items",
      query: [],
      headers: [],
      body: '{"a":1}',
      bodyMode: "raw",
      auth: { type: "basic", username: "u", password: "p" },
    });
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe(`Basic ${btoa("u:p")}`);
    expect(headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe('{"a":1}');
  });

  it("moves api-key auth into the query string when configured", () => {
    const { url } = prepareRequest({
      id: "1",
      name: "r",
      method: "GET",
      url: "https://api.example.com/x",
      query: [],
      headers: [],
      body: "",
      bodyMode: "raw",
      auth: { type: "apikey", key: "api_key", value: "secret", in: "query" },
    });
    expect(url).toContain("api_key=secret");
  });
});