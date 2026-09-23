import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types/seo';

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (url: string) => void;
}

export const SEOBreadcrumbs: React.FC<SEOBreadcrumbsProps> = ({
  items,
  className = '',
  onNavigate,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(url);
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`py-2 text-xs text-slate-600 dark:text-slate-400 ${className}`}
    >
      <ol
        className="flex flex-wrap items-center gap-1 sm:gap-1.5"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li
          className="flex items-center gap-1.5"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <a
            href="/"
            onClick={(e) => handleClick(e, '/')}
            className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            itemProp="item"
          >
            <Home className="w-3.5 h-3.5" />
            <span itemProp="name">Home</span>
          </a>
          <meta itemProp="position" content="1" />
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const position = index + 2;

          return (
            <li
              key={item.url + index}
              className="flex items-center gap-1.5"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {isLast ? (
                <span
                  className="font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-sm"
                  aria-current="page"
                  itemProp="name"
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.url}
                  onClick={(e) => handleClick(e, item.url)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-xs"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </a>
              )}
              <meta itemProp="position" content={String(position)} />
              {!isLast && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
