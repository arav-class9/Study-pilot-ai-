import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker to use jsdelivr matching the exact version of pdfjs-dist
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  lines: string[];
  imageDataUrl?: string;
  isScanned?: boolean;
}

export interface PDFExtractionProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
  statusText: string;
}

/**
 * Extracts page-by-page text, high-res image renders, and performs OCR fallback
 * for scanned PDFs using pdfjs-dist and Gemini vision API.
 */
export async function extractPDFPages(
  fileOrBuffer: File | ArrayBuffer,
  onProgress?: (progress: PDFExtractionProgress) => void,
  options?: { classLevel?: string; subject?: string }
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
        statusText: `Extracting authentic text & page render from Page ${pageNum} of ${totalPages}...`,
      });
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items into lines based on vertical position (transform[5])
    const lineMap: Map<number, { text: string; x: number }[]> = new Map();

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim().length > 0) {
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
      lineItems.sort((a, b) => a.x - b.x);
      const lineText = lineItems.map((i) => i.text).join(' ').trim();
      if (lineText.length > 0) {
        lines.push(lineText);
      }
    }

    let fullPageText = lines.join('\n');
    let imageDataUrl: string | undefined = undefined;

    // Render page to canvas for high-fidelity visual reader and OCR
    try {
      if (typeof document !== 'undefined') {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
          imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
      }
    } catch (renderErr) {
      console.warn(`Canvas render error for page ${pageNum}:`, renderErr);
    }

    // Scanned page detection: If text is sparse (< 30 characters) and we have an image, run OCR
    const isScanned = fullPageText.trim().length < 30;
    if (isScanned && imageDataUrl) {
      if (onProgress) {
        onProgress({
          currentPage: pageNum,
          totalPages,
          percent: Math.round((pageNum / totalPages) * 100),
          statusText: `Scanned page detected on Page ${pageNum}. Running AI OCR extraction...`,
        });
      }
      try {
        const ocrRes = await fetch('/api/ai/ncert-page-ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageDataUrl,
            classLevel: options?.classLevel || '10',
            subject: options?.subject || 'Science',
          }),
        });
        if (ocrRes.ok) {
          const ocrJson = await ocrRes.json();
          if (ocrJson.data?.rawExtractedText) {
            fullPageText = ocrJson.data.rawExtractedText;
            lines.length = 0;
            lines.push(...(ocrJson.data.paragraphs || fullPageText.split('\n')));
          }
        }
      } catch (ocrErr) {
        console.warn(`OCR fallback failed for page ${pageNum}:`, ocrErr);
      }
    }

    extractedPages.push({
      pageNumber: pageNum,
      text: fullPageText,
      lines,
      imageDataUrl,
      isScanned,
    });
  }

  return extractedPages;
}
