import { XMLParser } from "fast-xml-parser";
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
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

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (name) => name === "item" || name === "category",
});

async function fetchMediumFeed(feedUrl: string): Promise<MediumFeedItem[]> {
  const res = await fetch(feedUrl);
  const xml = await res.text();
  const parsed = xmlParser.parse(xml);

  const items = parsed?.rss?.channel?.item || [];

  return items.map((item: Record<string, unknown>) => {
    const rawContent: string = item["content:encoded"] || item["content"] || "";
    const ogImage = extractOgImage(rawContent);
    const sanitized = sanitizeHtml(rawContent, sanitizeOptions);
    const title = item["title"] || "";
    const categories: string[] = item["category"]
      ? (Array.isArray(item["category"]) ? item["category"] : [item["category"]])
      : [];

    let author = "";
    if (item["dc:creator"]) {
      author = typeof item["dc:creator"] === "object"
        ? (item["dc:creator"] as Record<string, unknown>)["#text"] || ""
        : String(item["dc:creator"]);
    }

    const plainText = stripHtml(rawContent);

    return {
      title: String(title),
      link: String(item["link"] || ""),
      pubDate: String(item["pubDate"] || ""),
      content: sanitized,
      contentSnippet: plainText.slice(0, 300),
      categories,
      author: author || "Dhanush Kandhan",
      ogImage,
    };
  });
}

function errorResponse(message: string, status: number = 500, origin?: string): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify({ error: message }), { status, headers });
}

function jsonResponse(data: unknown, origin?: string): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=600",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(data), { headers });
}

export default {
  async fetch(request: Request, env: { MEDIUM_FEED_URL?: string; ALLOWED_ORIGIN?: string }): Promise<Response> {
    const feedUrl = env.MEDIUM_FEED_URL || "https://medium.com/feed/@itzmedhanu";
    const allowedOrigins = (env.ALLOWED_ORIGIN || "https://dhanu.letretro.com")
      .split(",")
      .map((s) => s.trim().replace(/\/+$/, ""));

    const origin = request.headers.get("Origin");
    const originMatch = origin ? allowedOrigins.includes(origin.replace(/\/+$/, "")) : false;
    if (origin && !originMatch) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const corsOrigin = originMatch ? origin : allowedOrigins[0];

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
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
        return jsonResponse(posts, corsOrigin);
      }

      // GET /api/blog/:slug — return single post
      const singleMatch = pathname.match(/^\/api\/blog\/(.+)$/);
      if (singleMatch) {
        const slug = singleMatch[1];
        const post = posts.find((p) => slugify(p.title) === slug);
        if (!post) {
          return errorResponse("Post not found", 404, corsOrigin);
        }
        return jsonResponse(post, corsOrigin);
      }

      return errorResponse("Not found", 404, corsOrigin);
    } catch (err) {
      console.error("Failed to fetch Medium feed:", err);
      return errorResponse("Failed to fetch blog posts", 500, corsOrigin);
    }
  },
};
