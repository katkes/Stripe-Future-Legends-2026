import { env } from '../../config/env.js';
import { AppError } from '../../core/errors/app-error.js';

type OcrSpaceResponse = { IsErroredOnProcessing?: boolean; ErrorMessage?: string | string[]; ParsedResults?: Array<{ ParsedText?: string }> };

export async function extractTextWithOcrSpace(file: Express.Multer.File) {
  if (!env.ocrSpaceApiKey) throw new AppError(503, 'OCR_SPACE_API_KEY is not configured. Add it to backend/.env after registering with OCR.space.');
  const form = new FormData();
  const bytes = file.buffer.buffer.slice(file.buffer.byteOffset, file.buffer.byteOffset + file.buffer.byteLength) as ArrayBuffer;
  form.append('file', new Blob([bytes], { type: file.mimetype }), file.originalname);
  form.append('language', 'eng'); form.append('isTable', 'true'); form.append('detectOrientation', 'true'); form.append('scale', 'true'); form.append('OCREngine', '2');
  const result = await fetch('https://api.ocr.space/parse/image', { method: 'POST', headers: { apikey: env.ocrSpaceApiKey }, body: form });
  if (!result.ok) throw new AppError(502, 'OCR.space could not process this image.');
  const payload = await result.json() as OcrSpaceResponse;
  if (payload.IsErroredOnProcessing) throw new AppError(422, Array.isArray(payload.ErrorMessage) ? payload.ErrorMessage.join(' ') : payload.ErrorMessage || 'OCR could not read this image.');
  return payload.ParsedResults?.map((page) => page.ParsedText ?? '').join('\n').trim() ?? '';
}
