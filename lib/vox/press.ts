export type VoxPressPost = {
  title: string;
  url: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getVoxPressPosts(url: string, limit = 4): Promise<VoxPressPost[]> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const posts: VoxPressPost[] = [];
    const articleMatches = html.match(/<article[\s\S]*?<\/article>/gi) ?? [];

    for (const article of articleMatches) {
      const match = article.match(/<h[1-4][^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);

      if (!match) {
        continue;
      }

      const [, postUrl, title] = match;
      const cleanTitle = decodeHtml(title);

      if (cleanTitle && postUrl && !posts.some((post) => post.url === postUrl)) {
        posts.push({
          title: cleanTitle,
          url: postUrl
        });
      }

      if (posts.length >= limit) {
        break;
      }
    }

    return posts;
  } catch {
    return [];
  }
}
