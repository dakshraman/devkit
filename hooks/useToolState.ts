"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function useToolIO<TInput, TOutput>(
  initialInput: TInput,
  transform: (input: TInput) => TOutput,
) {
  const [input, setInput] = useState<TInput>(initialInput);
  const [output, setOutput] = useState<TOutput | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = useCallback(() => {
    setLoading(true);
    setError("");
    try {
      setOutput(transform(input));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
      setOutput(null);
    } finally {
      setLoading(false);
    }
  }, [input, transform]);

  return { input, setInput, output, setOutput, error, setError, loading, run };
}

export function usePersistedState<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

export function useDebouncedState<T>(initial: T, delay = 300) {
  const [value, setValue] = useState<T>(initial);
  const debounced = useDebounce(value, delay);
  return { value, setValue, debounced };
}

export function useAsyncAction<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<void>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeRef = useRef(true);

  useEffect(() => {
    return () => { activeRef.current = false; };
  }, []);

  const execute = useCallback(async (...args: TArgs) => {
    setLoading(true);
    setError("");
    try {
      await fn(...args);
    } catch (err) {
      if (activeRef.current) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    } finally {
      if (activeRef.current) setLoading(false);
    }
  }, [fn]);

  return { loading, error, setError, execute };
}
