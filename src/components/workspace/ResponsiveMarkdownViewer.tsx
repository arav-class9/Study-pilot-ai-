import React from 'react';

interface ResponsiveMarkdownViewerProps {
  content: string;
  fontSize?: 'sm' | 'base' | 'lg';
  className?: string;
}

// Parses inline markdown: **bold**, *italic*, `code`, and plain text
export const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  // Regex to match **bold**, *italic*, and `code`
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-extrabold text-slate-900 dark:text-amber-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-amber-900 dark:text-amber-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md bg-amber-100/90 dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-mono text-[0.9em] break-all"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

export const ResponsiveMarkdownViewer: React.FC<ResponsiveMarkdownViewerProps> = ({
  content,
  fontSize = 'base',
  className = '',
}) => {
  if (!content || !content.trim()) {
    return null;
  }

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];
  let inTable = false;
  let tableBuffer: string[] = [];

  const flushCodeBlock = (key: number) => {
    if (codeBlockBuffer.length > 0) {
      const codeText = codeBlockBuffer.join('\n');
      blocks.push(
        <div key={`code-${key}`} className="my-3 w-full max-w-full overflow-hidden rounded-xl">
          <div className="bg-slate-900 text-slate-400 text-[10px] font-mono px-3 py-1 border-b border-slate-800 flex items-center justify-between">
            <span>Code / Diagram</span>
            <span className="text-[9px] text-slate-500">scroll horizontally if needed</span>
          </div>
          <pre className="p-3 bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto max-w-full whitespace-pre leading-relaxed border border-slate-800 rounded-b-xl">
            <code>{codeText}</code>
          </pre>
        </div>
      );
      codeBlockBuffer = [];
    }
  };

  const flushTable = (key: number) => {
    if (tableBuffer.length > 0) {
      const rows = tableBuffer.map((line) =>
        line
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim())
      );
      // Filter out divider lines (like |---|---|)
      const isDivider = (row: string[]) => row.every((c) => /^:?-+:?$/.test(c));
      const contentRows = rows.filter((r) => !isDivider(r));

      if (contentRows.length > 0) {
        const [headerRow, ...bodyRows] = contentRows;
        blocks.push(
          <div
            key={`table-${key}`}
            className="my-3 w-full max-w-full overflow-x-auto rounded-xl border border-amber-200 dark:border-slate-800 shadow-2xs"
          >
            <table className="w-full min-w-[320px] text-left text-xs border-collapse">
              {headerRow && (
                <thead>
                  <tr className="bg-amber-100/70 dark:bg-slate-800 border-b border-amber-200 dark:border-slate-700">
                    {headerRow.map((cell, cIdx) => (
                      <th
                        key={cIdx}
                        className="p-2.5 font-black text-slate-900 dark:text-amber-100 break-words"
                      >
                        {renderInlineMarkdown(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-amber-100 dark:divide-slate-800">
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-amber-50/40 dark:bg-slate-950/40'}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="p-2.5 text-slate-800 dark:text-slate-200 break-words [overflow-wrap:anywhere]"
                      >
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(i);
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(rawLine);
      continue;
    }

    // Markdown Table row
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableBuffer.push(line.trim());
      continue;
    } else if (inTable) {
      flushTable(i);
      inTable = false;
    }

    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      blocks.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Heading 1
    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.replace(/^#\s+/, '');
      blocks.push(
        <h2
          key={`h1-${i}`}
          className="text-lg sm:text-xl font-black text-slate-900 dark:text-amber-100 mt-5 mb-2 pb-1.5 border-b-2 border-amber-300/80 dark:border-amber-600/40 break-words [overflow-wrap:anywhere]"
        >
          {renderInlineMarkdown(headingText)}
        </h2>
      );
      continue;
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '');
      blocks.push(
        <h3
          key={`h2-${i}`}
          className="text-base sm:text-lg font-extrabold text-amber-950 dark:text-amber-200 mt-4 mb-2 flex items-center gap-2 break-words [overflow-wrap:anywhere]"
        >
          <span className="w-1.5 h-4 rounded-full bg-amber-500 shrink-0" />
          <span>{renderInlineMarkdown(headingText)}</span>
        </h3>
      );
      continue;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s+/, '');
      blocks.push(
        <h4
          key={`h3-${i}`}
          className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1.5 break-words [overflow-wrap:anywhere]"
        >
          {renderInlineMarkdown(headingText)}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.replace(/^>\s+/, '');
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2.5 pl-3.5 py-1.5 border-l-3 border-amber-500 bg-amber-100/50 dark:bg-slate-800/60 rounded-r-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic break-words [overflow-wrap:anywhere]"
        >
          {renderInlineMarkdown(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Unordered List (- or * or •)
    if (/^[-*•]\s+/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[-*•]\s+/, '');
      blocks.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1.5 ml-1 sm:ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 mt-2 shrink-0" />
          <div className="flex-1 min-w-0 text-slate-800 dark:text-slate-200 break-words [overflow-wrap:anywhere] leading-relaxed">
            {renderInlineMarkdown(bulletText)}
          </div>
        </div>
      );
      continue;
    }

    // Sub-item list (indented bullet: e.g. "   - Loose: ...")
    if (/^\s+[-*•]\s+/.test(line)) {
      const bulletText = line.trim().replace(/^[-*•]\s+/, '');
      blocks.push(
        <div key={`subbullet-${i}`} className="flex items-start gap-2 my-1 ml-4 sm:ml-6">
          <span className="w-1.5 h-1.5 rounded-xs bg-amber-400 dark:bg-amber-500 mt-2 shrink-0" />
          <div className="flex-1 min-w-0 text-slate-700 dark:text-slate-300 break-words [overflow-wrap:anywhere] leading-relaxed text-[0.95em]">
            {renderInlineMarkdown(bulletText)}
          </div>
        </div>
      );
      continue;
    }

    // Ordered List (1. 2. 3.)
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      const num = orderedMatch[1];
      const itemText = orderedMatch[2];
      blocks.push(
        <div key={`ord-${i}`} className="flex items-start gap-2.5 my-1.5 ml-1 sm:ml-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-200/80 dark:bg-slate-800 text-amber-900 dark:text-amber-300 text-[10px] font-black shrink-0 mt-0.5">
            {num}
          </span>
          <div className="flex-1 min-w-0 text-slate-800 dark:text-slate-200 break-words [overflow-wrap:anywhere] leading-relaxed">
            {renderInlineMarkdown(itemText)}
          </div>
        </div>
      );
      continue;
    }

    // High-yield or Warning Callout lines
    if (trimmed.startsWith('⚠️') || trimmed.toLowerCase().startsWith('note:') || trimmed.toLowerCase().startsWith('remember:')) {
      blocks.push(
        <div
          key={`alert-${i}`}
          className="my-2.5 p-3 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/60 text-xs sm:text-sm text-amber-950 dark:text-amber-200 break-words [overflow-wrap:anywhere]"
        >
          {renderInlineMarkdown(trimmed)}
        </div>
      );
      continue;
    }

    // Regular Paragraph
    blocks.push(
      <p
        key={`p-${i}`}
        className="my-1.5 text-slate-800 dark:text-slate-200 break-words [overflow-wrap:anywhere] leading-relaxed"
      >
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  }

  // Flush remaining buffers if file ended while in block
  if (inCodeBlock) flushCodeBlock(lines.length);
  if (inTable) flushTable(lines.length);

  const textSizeClass =
    fontSize === 'sm'
      ? 'text-xs leading-relaxed'
      : fontSize === 'lg'
      ? 'text-base sm:text-lg leading-relaxed'
      : 'text-xs sm:text-sm leading-relaxed';

  return (
    <div
      className={`w-full max-w-full min-w-0 font-sans ${textSizeClass} break-words [overflow-wrap:anywhere] ${className}`}
    >
      {blocks}
    </div>
  );
};
