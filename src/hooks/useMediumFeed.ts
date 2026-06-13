import { useState, useEffect } from "react";

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  categories: string[];
  author: string;
  ogImage: string | null;
}

const CACHE_KEY = "medium-feed-cache";
const CACHE_TTL = 10 * 60 * 1000;

interface CacheEntry {
  data: MediumPost[];
  timestamp: number;
}

function getCache(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setCache(data: MediumPost[]) {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable
  }
}

export function useMediumFeed() {
  const [posts, setPosts] = useState<MediumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const workerUrl = import.meta.env.PUBLIC_MEDIUM_WORKER_URL;
    if (!workerUrl) {
      console.error("PUBLIC_MEDIUM_WORKER_URL is not set");
      setError(true);
      setLoading(false);
      return;
    }

    const cached = getCache();
    if (cached) {
      setPosts(cached.data);
      setLoading(false);
      return;
    }

    async function fetchPosts() {
      try {
        const res = await fetch(`${workerUrl}/api/blog`);
        if (!res.ok) throw new Error(`Worker returned ${res.status}`);
        const data: MediumPost[] = await res.json();
        setPosts(data);
        setCache(data);
      } catch {
        console.error("Medium feed fetch failed");
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, loading, error };
}
