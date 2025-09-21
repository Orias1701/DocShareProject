// src/lib/pdfjs.js
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

// Dùng shared workerPort (ổn định với Vite)
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

export { pdfjsLib };
