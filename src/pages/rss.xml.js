import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const workerUrl = (import.meta.env.PUBLIC_MEDIUM_WORKER_URL || "").replace(/\/+$/, "");
	if (!workerUrl) {
		return new Response("", { status: 404 });
	}

	const res = await fetch(`${workerUrl}/api/blog`);
	if (!res.ok) {
		return new Response("", { status: 404 });
	}

	const posts = await res.json();

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.contentSnippet,
			pubDate: post.pubDate,
			link: post.link,
			categories: post.categories,
		})),
	});
}
