export interface BreadcrumbItem {
  label: string;
  url: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  keywords?: string[];
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}
