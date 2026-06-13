import Parser from "rss-parser";
import sanitizeHtml from "sanitize-html";

interface MediumFeedItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  categories: string[];
  author: string;
  ogImage: string | null;
}

const parser = new Parser();

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractOgImage(content: string): string | null {
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "h1", "h2", "h3", "h4", "h5", "h6",
    "figure", "figcaption", "iframe", "video", "source",
    "span", "div", "hr", "br",
  ]),
  allowedAttributes: {
    "*": ["style", "class", "id"],
    "a": ["href", "target", "rel"],
    "img": ["src", "alt", "width", "height", "loading"],
    "iframe": ["src", "title", "width", "height", "allowfullscreen", "frameborder"],
    "video": ["src", "controls", "width", "height"],
    "source": ["src", "type"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "data"],
  transformTags: {
    "a": (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  },
};

async function fetchMediumFeed(feedUrl: string): Promise<MediumFeedItem[]> {
  const feed = await parser.parseURL(feedUrl);

  return feed.items.map((item) => {
    const rawContent = item["content:encoded"] || item.content || "";
    const ogImage = extractOgImage(rawContent);
    const sanitized = sanitizeHtml(rawContent, sanitizeOptions);

    return {
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || "",
      content: sanitized,
      contentSnippet: item.contentSnippet?.slice(0, 300) || "",
      categories: item.categories || [],
      author: item.creator || item.author || "Dhanush Kandhan",
      ogImage,
    };
  });
}

function errorResponse(message: string, status: number = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=600",
    },
  });
}

export default {
  async fetch(request: Request, env: { MEDIUM_FEED_URL?: string }): Promise<Response> {
    const feedUrl = env.MEDIUM_FEED_URL || "https://medium.com/feed/@itzmedhanu";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "");

    try {
      const posts = await fetchMediumFeed(feedUrl);

      // GET /api/blog — return all posts
      if (pathname === "/api/blog") {
        return jsonResponse(posts);
      }

      // GET /api/blog/:slug — return single post
      const singleMatch = pathname.match(/^\/api\/blog\/(.+)$/);
      if (singleMatch) {
        const slug = singleMatch[1];
        const post = posts.find((p) => slugify(p.title) === slug);
        if (!post) {
          return errorResponse("Post not found", 404);
        }
        return jsonResponse(post);
      }

      return errorResponse("Not found", 404);
    } catch (err) {
      console.error("Failed to fetch Medium feed:", err);
      return errorResponse("Failed to fetch blog posts");
    }
  },
};
