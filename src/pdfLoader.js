/* PDF読み込み・テキスト抽出 */

let pdfjsLib = null;

export async function initPDF() {
  if (!pdfjsLib) {
    pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) throw new Error('PDF.js が読み込まれていません');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  }
  return pdfjsLib;
}

export async function extractTextFromPDF(file) {
  try {
    const lib = await initPDF();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument(arrayBuffer).promise;

    let fullText = '';
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(' ');
      fullText += text + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`PDFファイルが読み込めません: ${error.message}`);
  }
}

export async function loadPDFFile(inputElement) {
  const file = inputElement.files?.[0];
  if (!file) return null;

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('PDFファイルを選択してください');
  }

  return await extractTextFromPDF(file);
}
