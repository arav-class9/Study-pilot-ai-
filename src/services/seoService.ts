import { BreadcrumbItem, SEOMetadata, SitemapURL } from '../types/seo';
import { NCERT_SUBJECTS_CATALOG } from '../data/ncertBooksData';
import { CURRICULUM_DATA } from '../data/curriculum';

export const SITE_NAME = 'StudyPilot AI';
export const PRODUCTION_DOMAIN = 'https://studypilot-ai-8.vercel.app';
export const DEFAULT_OG_IMAGE = `${PRODUCTION_DOMAIN}/pwa-512x512.png`;
export const DEFAULT_DESCRIPTION =
  'StudyPilot AI helps students learn smarter with AI-powered explanations, NCERT learning, notes, quizzes, revision tools and personalized study support.';

export function getBaseUrl(): string {
  return PRODUCTION_DOMAIN;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates canonical URL for any path
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Normalize trailing slashes
  const normalizedPath = cleanPath.length > 1 && cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;
  return `${PRODUCTION_DOMAIN}${normalizedPath}`;
}

/**
 * Schema.org WebSite structured data
 */
export function getWebSiteSchema() {
  const base = PRODUCTION_DOMAIN;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    name: SITE_NAME,
    url: `${base}/`,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${base}/ncert?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Schema.org Educational Organization structured data
 */
export function getOrganizationSchema() {
  const base = PRODUCTION_DOMAIN;
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${base}/#organization`,
    name: SITE_NAME,
    url: `${base}/`,
    logo: `${base}/icon.svg`,
    description:
      'AI-powered adaptive learning platform for NCERT, CBSE, and school students featuring intelligent curriculum mapping, page-by-page study tools, and spaced repetition quizzes.',
  };
}

/**
 * Schema.org SoftwareApplication structured data
 */
export function getSoftwareApplicationSchema() {
  const base = PRODUCTION_DOMAIN;
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${base}/#softwareapplication`,
    name: SITE_NAME,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: `${base}/`,
    description: DEFAULT_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };
}

export const getWebApplicationSchema = getSoftwareApplicationSchema;

/**
 * Schema.org BreadcrumbList structured data
 */
export function getBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  const base = PRODUCTION_DOMAIN;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.url.startsWith('http') ? crumb.url : `${base}${crumb.url.startsWith('/') ? crumb.url : `/${crumb.url}`}`,
    })),
  };
}

/**
 * Schema.org Course / Educational Article structured data
 */
export function getEducationalContentSchema(options: {
  title: string;
  description: string;
  url: string;
  educationalLevel?: string;
  subject?: string;
  dateModified?: string;
}) {
  const base = PRODUCTION_DOMAIN;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: options.title,
    description: options.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: `${base}/`,
    },
    educationalLevel: options.educationalLevel || 'Secondary Education',
    about: options.subject,
    url: options.url.startsWith('http') ? options.url : `${base}${options.url.startsWith('/') ? options.url : `/${options.url}`}`,
    inLanguage: 'en',
    isAccessibleForFree: true,
  };
}

/**
 * Schema.org FAQPage structured data
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Update or create a <meta> tag in the document <head>
 */
function setMetaTag(name: string, content: string, isProperty = false) {
  if (typeof document === 'undefined') return;
  const attribute = isProperty ? 'property' : 'name';
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Update or create a <link rel="..."> tag in document <head>
 * Cleans up any duplicate canonical links to ensure strict canonical uniqueness
 */
function setLinkRel(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  const existingLinks = document.querySelectorAll(`link[rel="${rel}"]`);
  if (existingLinks.length > 1) {
    existingLinks.forEach((link, idx) => {
      if (idx > 0) link.remove();
    });
  }

  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/**
 * Injects or updates JSON-LD structured data in <head>
 */
function setJsonLd(data: Record<string, any> | Record<string, any>[]) {
  if (typeof document === 'undefined') return;
  let script = document.getElementById('studypilot-seo-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'studypilot-seo-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  if (data) {
    script.textContent = JSON.stringify(data);
  }
}

/**
 * Primary DOM updater for client-side SEO
 */
export function applySEOMetadata(metadata: SEOMetadata) {
  if (typeof document === 'undefined') return;

  const title = metadata.title.includes(SITE_NAME)
    ? metadata.title
    : `${metadata.title} | ${SITE_NAME}`;
  document.title = title;

  // Standard Meta
  setMetaTag('description', metadata.description);
  setMetaTag('robots', metadata.robots || 'index, follow');

  // Strict Production Canonical URL
  let canonicalUrl = metadata.canonicalUrl;
  if (!canonicalUrl || canonicalUrl.includes('localhost') || canonicalUrl.includes('run.app')) {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    canonicalUrl = getCanonicalUrl(pathname);
  }
  setLinkRel('canonical', canonicalUrl);

  // Open Graph
  setMetaTag('og:title', title, true);
  setMetaTag('og:description', metadata.description, true);
  setMetaTag('og:url', canonicalUrl, true);
  setMetaTag('og:type', metadata.ogType || 'website', true);
  setMetaTag('og:site_name', SITE_NAME, true);
  setMetaTag('og:image', metadata.ogImage ? (metadata.ogImage.startsWith('http') ? metadata.ogImage : `${PRODUCTION_DOMAIN}${metadata.ogImage}`) : `${PRODUCTION_DOMAIN}/pwa-512x512.png`, true);

  // Twitter / X Cards
  setMetaTag('twitter:card', metadata.twitterCard || 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', metadata.description);
  setMetaTag('twitter:image', metadata.ogImage ? (metadata.ogImage.startsWith('http') ? metadata.ogImage : `${PRODUCTION_DOMAIN}${metadata.ogImage}`) : `${PRODUCTION_DOMAIN}/pwa-512x512.png`);

  // JSON-LD Structured Data
  const jsonLdData = metadata.jsonLd && (Array.isArray(metadata.jsonLd) ? metadata.jsonLd.length > 0 : true)
    ? metadata.jsonLd
    : [getWebSiteSchema(), getOrganizationSchema(), getSoftwareApplicationSchema()];
  
  setJsonLd(jsonLdData);
}

/**
 * Generate all public indexable URLs for XML Sitemap
 */
export function getAllSitemapURLs(): SitemapURL[] {
  const base = getBaseUrl();
  const today = new Date().toISOString().split('T')[0];
  const urls: SitemapURL[] = [
    // Core Public Pages
    { loc: `${base}/`, lastmod: today, changefreq: 'daily', priority: 1.0 },
    { loc: `${base}/about`, lastmod: today, changefreq: 'weekly', priority: 0.8 },
    { loc: `${base}/features`, lastmod: today, changefreq: 'weekly', priority: 0.8 },
    
    // Core AI Capability Landing Pages
    { loc: `${base}/ai-study-assistant`, lastmod: today, changefreq: 'weekly', priority: 0.95 },
    { loc: `${base}/ai-notes-generator`, lastmod: today, changefreq: 'weekly', priority: 0.95 },
    { loc: `${base}/ai-notes`, lastmod: today, changefreq: 'weekly', priority: 0.90 },
    { loc: `${base}/ai-quiz-generator`, lastmod: today, changefreq: 'weekly', priority: 0.95 },
    { loc: `${base}/ai-flashcards`, lastmod: today, changefreq: 'weekly', priority: 0.95 },
    { loc: `${base}/ai-study-planner`, lastmod: today, changefreq: 'weekly', priority: 0.95 },
    { loc: `${base}/ai-question-solver`, lastmod: today, changefreq: 'weekly', priority: 0.95 },
    
    // NCERT Hub
    { loc: `${base}/ncert`, lastmod: today, changefreq: 'daily', priority: 0.95 },
  ];

  // NCERT Classes (6 to 12)
  const classes = ['6', '7', '8', '9', '10', '11', '12'];
  for (const cls of classes) {
    urls.push({
      loc: `${base}/ncert/class-${cls}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.90,
    });
  }

  // Class 9 Specific Subjects requested by user
  const class9Subjects = ['science', 'maths', 'math', 'social-science', 'english', 'hindi'];
  for (const subj of class9Subjects) {
    urls.push({
      loc: `${base}/ncert/class-9/${subj}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.90,
    });
  }

  // NCERT Subjects and Chapters from Catalog
  for (const subject of NCERT_SUBJECTS_CATALOG) {
    for (const cls of subject.classes) {
      urls.push({
        loc: `${base}/ncert/class-${cls}/${subject.id}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.85,
      });
    }

    for (const chapter of subject.chapters) {
      const chSlug = slugify(chapter.title);
      urls.push({
        loc: `${base}/ncert/class-${chapter.classLevel}/${chapter.subjectId}/${chSlug}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.80,
      });
    }
  }

  // Curated High-Yield Educational Topics
  const highYieldTopics = [
    { slug: 'newtons-laws-of-motion', name: "Newton's Laws of Motion" },
    { slug: 'chemical-reactions-and-equations', name: 'Chemical Reactions and Equations' },
    { slug: 'matter-in-our-surroundings', name: 'Matter in Our Surroundings' },
    { slug: 'the-fundamental-unit-of-life', name: 'The Fundamental Unit of Life' },
    { slug: 'quadratic-equations', name: 'Quadratic Equations' },
    { slug: 'acids-bases-and-salts', name: 'Acids, Bases and Salts' },
    { slug: 'work-and-energy', name: 'Work and Energy' },
    { slug: 'electricity-and-circuits', name: 'Electricity and Circuits' },
    { slug: 'light-reflection-and-refraction', name: 'Light - Reflection and Refraction' },
    { slug: 'photosynthesis-and-respiration', name: 'Photosynthesis and Cellular Respiration' },
  ];

  for (const topic of highYieldTopics) {
    urls.push({
      loc: `${base}/topic/${topic.slug}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.85,
    });
  }

  return urls;
}

/**
 * Generates raw XML sitemap text
 */
export function generateSitemapXML(): string {
  const urls = getAllSitemapURLs();
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const item of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${item.loc}</loc>\n`;
    if (item.lastmod) xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
    if (item.changefreq) xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    if (item.priority !== undefined) xml += `    <priority>${item.priority.toFixed(2)}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';
  return xml;
}

/**
 * Generates raw robots.txt text
 */
export function generateRobotsTxt(): string {
  const base = getBaseUrl();
  return `# StudyPilot AI - Search Engine Crawling Directives
User-agent: *
Allow: /
Allow: /about
Allow: /features
Allow: /ai-study-assistant
Allow: /ai-notes-generator
Allow: /ai-notes
Allow: /ai-quiz-generator
Allow: /ai-flashcards
Allow: /ai-study-planner
Allow: /ai-question-solver
Allow: /ncert
Allow: /ncert/*
Allow: /class/*
Allow: /topic/*

# Protect Private Dashboards, Authentication, and User Data
Disallow: /dashboard
Disallow: /workspace
Disallow: /auth
Disallow: /login
Disallow: /signup
Disallow: /settings
Disallow: /profile
Disallow: /admin
Disallow: /parent
Disallow: /teacher
Disallow: /progress
Disallow: /mistakes
Disallow: /timetable
Disallow: /radar
Disallow: /api/
Disallow: /search

# Dynamic XML Sitemap
Sitemap: ${base}/sitemap.xml
`;
}
