import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker to use the CDN matching the exact version of pdfjs-dist
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  lines: string[];
}

export interface PDFExtractionProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
  statusText: string;
}

/**
 * Extracts page-by-page text from a PDF File or ArrayBuffer using pdfjs-dist
 */
export async function extractPDFPages(
  fileOrBuffer: File | ArrayBuffer,
  onProgress?: (progress: PDFExtractionProgress) => void
): Promise<ExtractedPage[]> {
  let arrayBuffer: ArrayBuffer;
  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const extractedPages: ExtractedPage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) {
      onProgress({
        currentPage: pageNum,
        totalPages,
        percent: Math.round((pageNum / totalPages) * 100),
        statusText: `Extracting authentic text from Page ${pageNum} of ${totalPages}...`,
      });
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items into lines based on vertical position (transform[5])
    const lineMap: Map<number, { text: string; x: number }[]> = new Map();

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim().length > 0) {
        // Round y coordinate to group into same line
        const y = Math.round(item.transform[5]);
        const x = item.transform[4];
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)!.push({ text: item.str, x });
      }
    }

    // Sort lines by y descending (top to bottom of page)
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const lines: string[] = [];

    for (const y of sortedY) {
      const lineItems = lineMap.get(y)!;
      // Sort items in line by x ascending (left to right)
      lineItems.sort((a, b) => a.x - b.x);
      const lineText = lineItems.map((i) => i.text).join(' ').trim();
      if (lineText.length > 0) {
        lines.push(lineText);
      }
    }

    const fullPageText = lines.join('\n');
    extractedPages.push({
      pageNumber: pageNum,
      text: fullPageText,
      lines,
    });
  }

  return extractedPages;
}
