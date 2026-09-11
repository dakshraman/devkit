"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Shell, Panel, InfoTile } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

type GitHubProfile = {
  avatar_url?: string;
  name?: string | null;
  login?: string;
  bio?: string | null;
  followers?: number;
  following?: number;
  public_repos?: number;
};

type GitHubRepo = {
  id: number;
  name: string;
  description?: string | null;
  language?: string | null;
};

export default function GitHubTool({ tool }: { tool: Tool }) {
  const schema = z.object({ username: z.string().min(1) });
  const { register, handleSubmit } = useForm<{ username: string }>({ resolver: zodResolver(schema), defaultValues: { username: "vercel" } });
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadProfile = async (username: string) => {
    setLoading(true);
    setError("");
    try {
      const [userRes, repoRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`),
        axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars`),
      ]);
      setProfile(userRes.data);
      setRepos(repoRes.data.slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GitHub profile");
      setProfile(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = handleSubmit(async ({ username }) => {
    await loadProfile(username);
  });
  useEffect(() => {
    let active = true;
    axios
      .get<GitHubProfile>("https://api.github.com/users/vercel")
      .then((userRes) =>
        Promise.all([
          userRes,
          axios.get<GitHubRepo[]>("https://api.github.com/users/vercel/repos?per_page=100&sort=stars"),
        ])
      )
      .then(([userRes, repoRes]) => {
        if (!active) return;
        setProfile(userRes.data);
        setRepos(repoRes.data.slice(0, 8));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load GitHub profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <Shell tool={tool}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Panel title="GitHub profile" description="Public API only. No auth required.">
          <div className="flex gap-2">
            <Input {...register("username")} placeholder="GitHub username" />
            <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Analyze"}</Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {profile ? (
            <div className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr]">
              <div className="space-y-4">
                <Image src={profile.avatar_url ?? "/vercel.svg"} alt="Avatar" width={128} height={128} className="rounded-2xl" />
                <div>
                  <h3 className="text-lg font-semibold">{profile.name ?? profile.login ?? "GitHub user"}</h3>
                  <p className="text-sm text-muted-foreground">{profile.bio ?? "No bio"}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <InfoTile label="Followers" value={String(profile.followers ?? 0)} />
                  <InfoTile label="Following" value={String(profile.following ?? 0)} />
                  <InfoTile label="Repos" value={String(profile.public_repos ?? 0)} />
                </div>
              </div>
              <div className="space-y-3">
                {repos.map((repo) => (
                  <div key={repo.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{repo.name}</div>
                      <Badge variant="outline">{repo.language ?? "n/a"}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{repo.description ?? "No description."}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : <Skeleton className="h-64" />}
        </Panel>
      </form>
    </Shell>
  );
}
