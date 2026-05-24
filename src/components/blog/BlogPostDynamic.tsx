import { useState, useEffect } from "react";
import { format } from "date-fns";

interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  categories: string[];
  author: string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, "MMMM dd, yyyy");
  } catch {
    return "N/A";
  }
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, "yyyy-MM-dd");
  } catch {
    return "N/A";
  }
}

function extractOgImage(html: string): string | null {
  const match = html?.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

export default function BlogPostDynamic({ slug }: { slug: string }) {
  const [post, setPost] = useState<MediumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(
          "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@itzmedhanu"
        );
        const data = await res.json();
        if (data.status === "ok" && data.items) {
          const found = data.items.find(
            (item: any) => slugify(item.title) === slug
          );
          if (found) {
            setPost({
              title: found.title || "",
              link: found.link || "",
              pubDate: found.pubDate || "",
              content: found.content || found["content:encoded"] || "",
              contentSnippet: found.contentSnippet || "",
              categories: found.categories || [],
              author: found.author || "Dhanush Kandhan",
            });
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch {
        console.error("Medium feed fetch failed");
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 bg-zinc-800 rounded" />
            <div className="h-4 w-px bg-zinc-700" />
            <div className="h-4 w-32 bg-zinc-800 rounded" />
          </div>
          <div className="h-8 w-3/4 bg-zinc-800 rounded" />
          <div className="h-4 w-full bg-zinc-800 rounded" />
          <div className="h-4 w-5/6 bg-zinc-800 rounded" />
          <div className="h-4 w-4/6 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="p-8 border border-dashed border-zinc-800 rounded-lg text-center space-y-4">
          <p className="font-mono text-xxxs uppercase tracking-widest text-zinc-500">
            // Post not found or failed to load
          </p>
          <p className="text-sm text-zinc-400">
            This post may not be available yet. Try refreshing or visit Medium directly.
          </p>
          {slug && (
            <a
              href={`https://itzmedhanu.medium.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-zinc-100 text-black font-mono text-xxxs uppercase tracking-widest hover:bg-white transition-colors rounded"
            >
              Read on Medium ↗
            </a>
          )}
          <a
            href="/blog"
            className="block mt-4 font-mono text-xxs uppercase tracking-widest text-emerald-500 hover:underline"
          >
            ← Back to Blog
          </a>
        </div>
      </div>
    );
  }

  const ogImage = extractOgImage(post.content);

  return (
    <article className="max-w-2xl mx-auto py-8">
      <header className="mb-12 space-y-4">
        <div className="flex items-center gap-4">
          <a
            href="/blog"
            className="font-mono text-[10px] uppercase tracking-widest text-emerald-500 hover:underline no-underline"
          >
            ← Back to Blog
          </a>
          <span className="text-zinc-800">/</span>
          <time
            dateTime={post.pubDate}
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500"
          >
            {formatDateLong(post.pubDate)}
          </time>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 leading-tight no-underline">
          {post.title}
        </h1>

        <div className="flex flex-wrap gap-2 pt-2">
          {post.categories?.map((category) => (
            <span
              key={category}
              className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-mono uppercase tracking-wider text-zinc-400"
            >
              {category}
            </span>
          ))}
        </div>
      </header>

      <div
        className="prose prose-invert prose-zinc max-w-none
          prose-headings:text-zinc-100 prose-headings:font-bold
          prose-p:text-zinc-400 prose-p:leading-relaxed
          prose-a:text-emerald-500 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-zinc-200
          prose-code:text-emerald-400 prose-code:bg-zinc-900 prose-code:px-1 prose-code:rounded
          prose-img:rounded-xl prose-img:border prose-img:border-zinc-800
          font-mono text-sm leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: `<style>
            .prose figure { margin-top: 2rem; margin-bottom: 2rem; }
            .prose figcaption { text-align: center; font-size: 0.75rem; color: #71717a; font-family: monospace; margin-top: 0.5rem; }
            .prose blockquote { border-left-width: 2px; border-color: #10b981; padding-left: 1rem; padding-top: 0.25rem; padding-bottom: 0.25rem; font-style: italic; color: #d4d4d8; background-color: rgba(24, 24, 27, 0.3); border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem; }
            .prose img { margin-left: auto; margin-right: auto; }
            .prose iframe { border-radius: 0.75rem; border-width: 1px; border-color: #27272a; margin-top: 2rem; margin-bottom: 2rem; }
            .prose pre { background: rgba(24, 24, 27, 0.5); border: 1px solid #27272a; border-radius: 0.75rem; padding: 1rem; overflow-x: auto; }
            .prose a { color: #10b981; }
            .prose h1, .prose h2, .prose h3, .prose h4 { color: #f4f4f5; font-weight: 700; }
          </style>${post.content}`,
        }}
      />

      <footer className="mt-16 pt-8 border-t border-zinc-900">
        <div className="flex justify-between items-center">
          <p className="text-xxs font-mono text-zinc-500 uppercase tracking-widest">
            Originally published on{" "}
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 underline hover:no-underline"
            >
              Medium
            </a>
          </p>
          <a
            href="/blog"
            className="text-xxs font-mono text-zinc-500 uppercase tracking-widest hover:text-zinc-100 transition-colors"
          >
            View all posts →
          </a>
        </div>
      </footer>
    </article>
  );
}