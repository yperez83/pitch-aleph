import "server-only";
import { connection } from "next/server";
import { notFound } from "next/navigation";

export interface PublicArticle {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  tags: string[];
  articleDate: string;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  coverUrl: string | null;
  socialImageUrl: string | null;
}

export interface ArticlePage {
  items: PublicArticle[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ArticleQuery {
  q?: string;
  tag?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PublicDocument<T = unknown> {
  key: string;
  title: string;
  tags: string[];
  value: T;
}

export const websiteUrl = process.env.WEBSITE_URL || "https://www.pitchaleph.com";
const cmsUrl = process.env.POSTPARTICLE_URL || "https://postparticle.vercel.app";
const project = process.env.POSTPARTICLE_PROJECT || "pitchaleph";
const organizationId = process.env.POSTPARTICLE_ORGANIZATION_ID || "df3d1b36-32b4-4960-bdbf-966ebac0396b";

export class ContentError extends Error {
  constructor(public status: number, message?: string) {
    super(message || `Postparticle returned ${status}`);
    this.name = "ContentError";
  }
}

async function get<T>(path: string): Promise<T> {
  // Fetch at request time so static builds do not depend on a reachable CMS instance.
  await connection();

  if (!organizationId) {
    throw new Error("POSTPARTICLE_ORGANIZATION_ID must be configured.");
  }

  const normalizedCmsUrl = cmsUrl.startsWith("http") ? cmsUrl : `https://${cmsUrl}`;
  const url = new URL(
    `/api/v1/projects/${encodeURIComponent(project)}/${path}`,
    normalizedCmsUrl,
  );
  url.searchParams.set("organizationId", organizationId);

  // Default server-side revalidation interval: 60 seconds (with fallback to cached response)
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new ContentError(response.status, `Postparticle API error: HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getArticles(query: ArticleQuery = {}): Promise<ArticlePage> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const queryString = params.toString();
  return get<ArticlePage>(`articles${queryString ? `?${queryString}` : ""}`);
}

export async function getArticle(slug: string): Promise<PublicArticle> {
  try {
    return await get<PublicArticle>(`articles/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ContentError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function getDocument<T = unknown>(key: string): Promise<PublicDocument<T>> {
  try {
    return await get<PublicDocument<T>>(`documents/${encodeURIComponent(key)}`);
  } catch (error) {
    if (error instanceof ContentError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
