import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface DiagnosticIssue {
  type: 'error' | 'warning' | 'success';
  title: string;
  detail: string;
}

export const SEODiagnosticBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [issues, setIssues] = useState<DiagnosticIssue[]>([]);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const runAudit = () => {
    if (typeof document === 'undefined') return;

    const list: DiagnosticIssue[] = [];

    // 1. Check Title
    const title = document.title;
    if (!title) {
      list.push({ type: 'error', title: 'Missing Title Tag', detail: 'The <title> tag is completely empty.' });
    } else if (title.length < 25) {
      list.push({ type: 'warning', title: 'Short Title', detail: `Title is only ${title.length} characters (recommended 30-60).` });
    } else if (title.length > 70) {
      list.push({ type: 'warning', title: 'Long Title', detail: `Title is ${title.length} characters (may truncate on mobile SERPs).` });
    } else {
      list.push({ type: 'success', title: 'Title Tag Optimal', detail: `Length: ${title.length} characters.` });
    }

    // 2. Check Meta Description
    const descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const desc = descMeta?.content || '';
    if (!desc) {
      list.push({ type: 'error', title: 'Missing Meta Description', detail: 'No <meta name="description"> tag found.' });
    } else if (desc.length < 70) {
      list.push({ type: 'warning', title: 'Short Meta Description', detail: `Description is ${desc.length} chars (recommended 120-160).` });
    } else if (desc.length > 175) {
      list.push({ type: 'warning', title: 'Long Meta Description', detail: `Description is ${desc.length} chars (may be truncated).` });
    } else {
      list.push({ type: 'success', title: 'Meta Description Optimal', detail: `Length: ${desc.length} characters.` });
    }

    // 3. Check H1 Heading Structure
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length === 0) {
      list.push({ type: 'error', title: 'Missing H1 Heading', detail: 'Zero <h1> elements found on this page.' });
    } else if (h1Elements.length > 1) {
      list.push({ type: 'warning', title: 'Multiple H1 Headings', detail: `Found ${h1Elements.length} <h1> elements (single unique <h1> recommended).` });
    } else {
      list.push({ type: 'success', title: 'Unique H1 Heading Present', detail: `Found 1 unique <h1>: "${h1Elements[0].textContent?.slice(0, 40)}..."` });
    }

    // 4. Check Canonical Link
    const canonicalLinks = document.querySelectorAll('link[rel="canonical"]');
    if (canonicalLinks.length === 0) {
      list.push({ type: 'error', title: 'Missing Canonical URL', detail: 'No <link rel="canonical"> tag detected.' });
    } else if (canonicalLinks.length > 1) {
      list.push({ type: 'warning', title: 'Duplicate Canonical Tags', detail: `Found ${canonicalLinks.length} canonical link tags.` });
    } else {
      const href = (canonicalLinks[0] as HTMLLinkElement).href;
      if (href.includes('localhost') || href.includes('run.app')) {
        list.push({ type: 'error', title: 'Invalid Canonical Domain', detail: `Canonical contains preview/dev host: ${href}` });
      } else {
        list.push({ type: 'success', title: 'Canonical Tag Present', detail: href });
      }
    }

    // 5. Check Open Graph & Twitter Cards
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!ogTitle || !ogDesc || !twitterCard) {
      list.push({ type: 'warning', title: 'Incomplete Social Metadata', detail: 'One or more Open Graph / Twitter tags are missing.' });
    } else {
      list.push({ type: 'success', title: 'Social Cards Configured', detail: 'og:title, og:description & twitter:card validated.' });
    }

    // 6. Check Images Alt Text
    const images = Array.from(document.querySelectorAll('img'));
    const missingAlt = images.filter((img) => !img.hasAttribute('alt'));
    if (missingAlt.length > 0) {
      list.push({ type: 'warning', title: 'Missing Image Alt Text', detail: `${missingAlt.length} images without alt attribute.` });
    } else {
      list.push({ type: 'success', title: 'Image Alt Tags Complete', detail: `All ${images.length} images have alt attributes.` });
    }

    // 7. Check JSON-LD Structured Data
    const jsonLdScripts = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'));
    if (jsonLdScripts.length === 0) {
      list.push({ type: 'warning', title: 'No JSON-LD Script Injected', detail: 'Structured data script not found in <head>.' });
    } else {
      let isValid = false;
      let typesFound: string[] = [];
      for (const script of jsonLdScripts) {
        try {
          const parsed = JSON.parse(script.textContent || '{}');
          if (parsed['@context'] && (parsed['@context'].includes('schema.org') || parsed['@context'] === 'https://schema.org')) {
            isValid = true;
            if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
              typesFound.push(...parsed['@graph'].map((g: any) => g['@type'] || 'Item'));
            } else if (Array.isArray(parsed)) {
              typesFound.push(...parsed.map((g: any) => g['@type'] || 'Item'));
            } else if (parsed['@type']) {
              typesFound.push(parsed['@type']);
            }
          }
        } catch {
          // ignore malformed parse attempt if another script is valid
        }
      }

      if (isValid) {
        list.push({
          type: 'success',
          title: 'JSON-LD Structured Data Valid',
          detail: `Schema.org types: ${[...new Set(typesFound)].join(', ') || 'Valid Schema'}`,
        });
      } else {
        list.push({ type: 'error', title: 'Malformed JSON-LD Schema', detail: 'Syntax error or missing @context in structured data script.' });
      }
    }

    // 8. Check Robots tag for private pages
    const path = window.location.pathname;
    const robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const isPrivate = ['/dashboard', '/settings', '/profile', '/admin', '/mistakes', '/timetable', '/radar'].some(
      (p) => path.startsWith(p)
    );
    if (isPrivate && (!robotsMeta || !robotsMeta.content.includes('noindex'))) {
      list.push({
        type: 'error',
        title: 'Private Page Not Protected',
        detail: 'This private user route lacks a "noindex" robots directive!',
      });
    } else if (isPrivate) {
      list.push({
        type: 'success',
        title: 'Private Route Protected',
        detail: 'Robots meta correctly contains noindex.',
      });
    }

    setIssues(list);
    setLastCheck(new Date());
  };

  useEffect(() => {
    // Initial audit after DOM stabilizes
    const timer = setTimeout(runAudit, 800);
    return () => clearTimeout(timer);
  }, []);

  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;

  return (
    <div className="fixed bottom-3 right-3 z-50 font-sans text-xs">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden max-w-sm sm:max-w-md backdrop-blur-md">
        {/* Bar Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer gap-3"
          title="Toggle SEO Health Diagnostic Audit"
        >
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>SEO Diagnostic</span>
            {errorCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold text-[10px] border border-rose-500/30">
                {errorCount} errors
              </span>
            ) : warningCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30">
                {warningCount} warnings
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">
                All Passed
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {/* Expandable Audit Log */}
        {isOpen && (
          <div className="p-3 border-t border-slate-800 space-y-2 max-h-80 overflow-y-auto">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
              <span>Audited at {lastCheck.toLocaleTimeString()}</span>
              <button
                onClick={runAudit}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-run</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border text-[11px] flex items-start gap-2 ${
                    issue.type === 'error'
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      : issue.type === 'warning'
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                      : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  }`}
                >
                  {issue.type === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  ) : issue.type === 'warning' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold leading-tight">{issue.title}</p>
                    <p className="opacity-80 text-[10px] break-all">{issue.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
