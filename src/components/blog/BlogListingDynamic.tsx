import { useMediumFeed } from "../../hooks/useMediumFeed";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
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

export default function BlogListingDynamic() {
  const { posts, loading, error } = useMediumFeed();

  if (loading) {
    return (
      <div className="mt-12 space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="block p-4 -mx-4 rounded-lg animate-pulse"
          >
            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <div className="flex items-center gap-4 shrink-0 md:w-40">
                <span className="font-mono text-xxxs text-zinc-700">
                  [{toHexId(i)}]
                </span>
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                <div className="h-3 w-1/2 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="mt-12 space-y-4">
        <div className="p-6 border border-dashed border-zinc-800 rounded text-center">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            No posts found. Check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-1">
      {posts.map((post, idx) => (
        <a
          key={post.link}
          href={`/blog/${slugify(post.title)}`}
          className="plain group relative block p-4 -mx-4 rounded-lg transition-all hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 overflow-hidden no-underline"
        >
          <span className="absolute inset-0 bg-white/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out -z-10" />

          <div className="flex flex-col md:flex-row md:items-baseline gap-4">
            <div className="flex items-center gap-4 shrink-0 md:w-40">
              <span className="font-mono text-xxxs text-zinc-600">
                [{toHexId(idx)}]
              </span>
              {post.pubDate && (
                <time
                  dateTime={post.pubDate}
                  className="font-mono text-xxxs uppercase tracking-widest text-zinc-500"
                >
                  {formatDate(post.pubDate)}
                </time>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors flex items-center gap-2 no-underline">
                {post.title}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500 font-mono text-xs hidden md:inline">
                  ←
                </span>
              </h2>

              {post.contentSnippet && (
                <p className="text-[11px] font-mono leading-relaxed text-zinc-500 line-clamp-2">
                  {post.contentSnippet}
                </p>
              )}

              <div className="pt-1 flex items-center gap-4">
                <span className="font-mono text-xxxs uppercase tracking-widest text-zinc-700">
                  Type: Post
                </span>
                <span className="font-mono text-xxxs uppercase tracking-widest text-zinc-700">
                  Status: Published
                </span>
              </div>
            </div>
          </div>
        </a>
      ))}

      <div className="mt-20 text-center group">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Want to read more?{" "}
          <a
            href="https://itzmedhanu.medium.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8 hover:decoration-emerald-500 transition-all duration-300 inline-flex items-center gap-2"
          >
            Catch me on Medium and subscribe
            <span className="text-xs transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </p>
      </div>
    </div>
  );
}