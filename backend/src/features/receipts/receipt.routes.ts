import { Router } from 'express';
import multer from 'multer';
import { assertDatabaseConnected } from '../../config/database.js';
import { AppError } from '../../core/errors/app-error.js';
import { requireAuth } from '../auth/require-auth.js';
import { User } from '../auth/user.model.js';
import { freshnessFromText } from '../pantry/freshness.service.js';
import { extractTextWithOcrSpace } from './ocr-space.service.js';

export const receiptRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1_000_000 }, fileFilter: (_request, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) });

receiptRouter.post('/analyze', requireAuth, upload.single('image'), async (request, response, next) => {
  try {
    assertDatabaseConnected();
    if (!request.file) throw new AppError(400, 'Upload a PNG, JPEG, or WebP image under 1 MB in the image field.');
    const itemName = String(request.body.itemName || 'Unidentified grocery item').trim();
    const storageMethod = ['refrigerated', 'frozen', 'pantry'].includes(request.body.storageMethod) ? request.body.storageMethod : 'refrigerated';
    const extractedText = await extractTextWithOcrSpace(request.file);
    const { category, freshness } = freshnessFromText(extractedText, itemName, storageMethod);
    const user = await User.findById(request.auth!.userId);
    if (!user) throw new AppError(404, 'User not found.');
    user.pantryItems.push({ name: itemName, category, storageMethod, extractedText, freshness });
    await user.save();
    const pantryItem = user.pantryItems[user.pantryItems.length - 1];
    response.status(201).json({ pantryItem, extractedText });
  } catch (error) { next(error); }
});
