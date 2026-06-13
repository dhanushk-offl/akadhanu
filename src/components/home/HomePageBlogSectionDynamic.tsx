import { useMediumFeed } from "../../hooks/useMediumFeed";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "N/A";
  }
}

function toHexId(index: number): string {
  return "0x" + (index + 1).toString(16).toUpperCase().padStart(2, "0");
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function HomePageBlogSectionDynamic() {
  const { posts, loading, error } = useMediumFeed();

  if (loading) {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-baseline gap-4 p-2 pr-8 -mx-2 rounded animate-pulse">
            <span className="font-mono text-xxxs text-zinc-700 w-8">
              [0x{(i + 1).toString(16).toUpperCase().padStart(2, "0")}]
            </span>
            <div className="flex-1 h-4 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <div className="p-4 border border-dashed border-zinc-800 rounded text-center">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            System Log Empty
          </p>
        </div>
        <div className="pt-6">
          <a
            className="group inline-flex items-center gap-2 font-mono text-xxs uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors"
            href="/blog"
          >
            <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
              &gt;
            </span>
            [View Archive]
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {posts.slice(0, 5).map((post, index) => (
        <a
          key={post.link}
          href={`/blog/${slugify(post.title)}`}
          className="group relative flex items-baseline gap-4 p-2 pr-8 -mx-2 rounded hover:bg-zinc-900/50 transition-colors no-underline"
        >
          <span className="font-mono text-xxxs text-zinc-600 w-8">
            [{toHexId(index)}]
          </span>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
            <h3 className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors no-underline">
              {post.title}
            </h3>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block h-px w-8 bg-zinc-800" />
              <time
                dateTime={post.pubDate}
                className="font-mono text-xxxs text-zinc-500 whitespace-nowrap"
              >
                {formatDate(post.pubDate)}
              </time>
            </div>
          </div>

          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500 font-mono text-xs absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block">
            ←
          </span>
        </a>
      ))}

      <div className="pt-6">
        <a
          className="group inline-flex items-center gap-2 font-mono text-xxs uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors"
          href="/blog"
        >
          <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
            &gt;
          </span>
          [View Archive]
        </a>
      </div>
    </div>
  );
}