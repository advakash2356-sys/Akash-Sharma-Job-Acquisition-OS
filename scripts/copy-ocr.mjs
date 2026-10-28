// Copies the tesseract.js worker and WASM core (Apache-2.0) into dist/ocr so OCR runs from this site. Akash Sync Agent.
import { cpSync, mkdirSync } from 'node:fs';
mkdirSync('dist/ocr', { recursive: true });
cpSync('node_modules/tesseract.js/dist/worker.min.js', 'dist/ocr/worker.min.js');
for (const f of ['tesseract-core-simd-lstm.wasm.js', 'tesseract-core-lstm.wasm.js']) cpSync(`node_modules/tesseract.js-core/${f}`, `dist/ocr/${f}`);
console.log('OCR files copied to dist/ocr');
