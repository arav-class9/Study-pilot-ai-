import { DoubtSolution } from '../types';

/**
 * Escapes special LaTeX characters in regular text paragraphs
 * while preserving intentional math delimiters ($ or $$) if present.
 */
function escapeLatexText(text: string): string {
  if (!text) return '';

  // If text contains existing LaTeX math delimiters, handle segments
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\))/g);

  return parts
    .map((part, index) => {
      // Odd indices are matched math blocks
      if (index % 2 === 1) {
        return part;
      }

      // Escape special characters in standard text
      return part
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/([&%$#_{}])/g, '\\$1')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
    })
    .join('');
}

/**
 * Formats a mathematical or scientific formula string into standard LaTeX math mode if needed.
 */
function formatLatexEquation(expr: string): string {
  if (!expr) return '';
  const trimmed = expr.trim();

  // If already enclosed in math delimiters, return as-is
  if (
    (trimmed.startsWith('$') && trimmed.endsWith('$')) ||
    (trimmed.startsWith('\\[') && trimmed.endsWith('\\]'))
  ) {
    return trimmed;
  }

  // Convert basic textual operators to LaTeX math symbols if needed
  let mathStr = trimmed
    .replace(/\s*\*\s*/g, ' \\times ')
    .replace(/\s*\+\/-\s*/g, ' \\pm ')
    .replace(/<=/g, ' \\le ')
    .replace(/>=/g, ' \\ge ')
    .replace(/!=/g, ' \\ne ')
    .replace(/\btheta\b/gi, '\\theta')
    .replace(/\balpha\b/gi, '\\alpha')
    .replace(/\bbeta\b/gi, '\\beta')
    .replace(/\blambda\b/gi, '\\lambda')
    .replace(/\bmu\b/gi, '\\mu')
    .replace(/\bpi\b/gi, '\\pi')
    .replace(/\bomega\b/gi, '\\omega')
    .replace(/\bDelta\b/g, '\\Delta')
    .replace(/\bsqrt\(([^)]+)\)/g, '\\sqrt{$1}');

  return mathStr;
}

/**
 * Converts a DoubtSolution object into a clean, complete LaTeX snippet for student notes.
 */
export function formatDoubtSolutionAsLaTeX(
  solution: DoubtSolution,
  options?: {
    subject?: string;
    classLevel?: string;
  }
): string {
  const subject = solution.detectedSubject || options?.subject || 'Academic Studies';
  const topic = solution.detectedTopic || solution.concept;
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const lines: string[] = [];

  // Header Comments & Metadata
  lines.push(`% ==========================================================`);
  lines.push(`% StudyPilot AI Tutor - Solved Doubt & Notes`);
  lines.push(`% Subject: ${subject} | Topic: ${topic}`);
  lines.push(`% Date: ${dateStr}`);
  lines.push(`% ==========================================================`);
  lines.push(``);

  // Section Title
  lines.push(`\\section*{${escapeLatexText(solution.concept)}}`);
  lines.push(`\\textbf{Subject:} ${escapeLatexText(subject)} \\quad `);
  if (options?.classLevel) {
    lines.push(`\\textbf{Class:} Class ${escapeLatexText(options.classLevel)} \\quad `);
  }
  lines.push(`\\textbf{Date:} ${dateStr}\\\\`);
  lines.push(`\\rule{\\linewidth}{0.4pt}`);
  lines.push(``);

  // Problem / Question Statement
  lines.push(`\\subsection*{Problem Statement}`);
  lines.push(`\\begin{quote}`);
  lines.push(`\\textbf{Question:} ${escapeLatexText(solution.question)}`);
  lines.push(`\\end{quote}`);
  lines.push(``);

  // Core Concept & Intuition
  lines.push(`\\subsection*{Core Concept \\& Academic Intuition}`);
  lines.push(escapeLatexText(solution.conceptExplanation));
  lines.push(``);

  // Numerical Breakdown (if available)
  if (solution.numericalBreakdown) {
    const nb = solution.numericalBreakdown;
    lines.push(`\\subsection*{Numerical Parameters \\& Formula Breakdown}`);
    lines.push(`\\begin{itemize}`);

    if (nb.given && nb.given.length > 0) {
      lines.push(`  \\item \\textbf{Given Data:}`);
      lines.push(`  \\begin{itemize}`);
      nb.given.forEach((g) => {
        lines.push(`    \\item ${escapeLatexText(g)}`);
      });
      lines.push(`  \\end{itemize}`);
    }

    if (nb.formula) {
      lines.push(`  \\item \\textbf{Governing Formula:}`);
      lines.push(`  \\[`);
      lines.push(`    ${formatLatexEquation(nb.formula)}`);
      lines.push(`  \\]`);
    }

    if (nb.substitution) {
      lines.push(`  \\item \\textbf{Substitution of Values:}`);
      lines.push(`  \\[`);
      lines.push(`    ${formatLatexEquation(nb.substitution)}`);
      lines.push(`  \\]`);
    }

    if (nb.calculation) {
      lines.push(`  \\item \\textbf{Step Calculation:}`);
      lines.push(`  \\[`);
      lines.push(`    ${formatLatexEquation(nb.calculation)}`);
      lines.push(`  \\]`);
    }

    if (nb.answer) {
      lines.push(
        `  \\item \\textbf{Calculated Result:} $${formatLatexEquation(nb.answer)}${
          nb.unit ? ` \\text{ ${escapeLatexText(nb.unit)}}` : ''
        }`
      );
    }

    lines.push(`\\end{itemize}`);
    lines.push(``);
  }

  // Step-by-Step Solution
  lines.push(`\\subsection*{Step-by-Step Pedagogical Derivation}`);
  lines.push(`\\begin{enumerate}`);
  solution.stepByStep.forEach((step) => {
    lines.push(`  \\item \\textbf{${escapeLatexText(step.title)}}`);
    lines.push(`  \\\\[3pt]`);
    lines.push(`  ${escapeLatexText(step.explanation)}`);

    if (step.calculation) {
      lines.push(`  \\[`);
      lines.push(`    ${formatLatexEquation(step.calculation)}`);
      lines.push(`  \\]`);
    }

    if (step.whyItWorks) {
      lines.push(`  \\\\[2pt]`);
      lines.push(`  \\textit{\\small Why this works: ${escapeLatexText(step.whyItWorks)}}`);
    }
    lines.push(``);
  });
  lines.push(`\\end{enumerate}`);
  lines.push(``);

  // Final Answer Box
  lines.push(`\\subsection*{Final Verified Answer}`);
  lines.push(`\\begin{center}`);
  lines.push(`\\fbox{`);
  lines.push(`  \\parbox{0.85\\linewidth}{`);
  lines.push(`    \\centering`);
  lines.push(`    \\textbf{Final Answer:}\\\\`);
  lines.push(`    \\Large $${formatLatexEquation(solution.finalAnswer)}$`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(`\\end{center}`);
  lines.push(``);

  // Common Misconceptions / Mistakes
  if (solution.commonMistakes && solution.commonMistakes.length > 0) {
    lines.push(`\\subsection*{Common Student Pitfalls \\& Exam Traps}`);
    lines.push(`\\begin{itemize}`);
    solution.commonMistakes.forEach((mistake) => {
      lines.push(`  \\item ${escapeLatexText(mistake)}`);
    });
    lines.push(`\\end{itemize}`);
    lines.push(``);
  }

  // Similar Practice Question
  if (solution.similarPracticeQuestion?.question) {
    lines.push(`\\subsection*{Reinforcement Practice Drill}`);
    lines.push(`\\textbf{Drill Question:} ${escapeLatexText(solution.similarPracticeQuestion.question)}\\\\`);
    if (solution.similarPracticeQuestion.hint) {
      lines.push(`\\textit{\\small Hint: ${escapeLatexText(solution.similarPracticeQuestion.hint)}}\\\\`);
    }
    if (solution.similarPracticeQuestion.answer) {
      lines.push(`\\textbf{\\small Practice Answer:} $${formatLatexEquation(solution.similarPracticeQuestion.answer)}$`);
    }
    lines.push(``);
  }

  // NCERT Textbook Citations
  if (solution.citations && solution.citations.length > 0) {
    lines.push(`\\subsection*{NCERT Curriculum Citations}`);
    lines.push(`\\begin{itemize}`);
    solution.citations.forEach((cite) => {
      lines.push(
        `  \\item \\textbf{${escapeLatexText(cite.bookTitle || 'NCERT Textbook')}} ` +
          `(Page ${cite.pageNumber}${cite.chapterName ? `, \\textit{${escapeLatexText(cite.chapterName)}}` : ''})`
      );
      if (cite.exactQuote) {
        lines.push(`  \\begin{quote}`);
        lines.push(`    \\small\\textit{\`\`${escapeLatexText(cite.exactQuote)}''}`);
        lines.push(`  \\end{quote}`);
      }
    });
    lines.push(`\\end{itemize}`);
    lines.push(``);
  }

  return lines.join('\n');
}
