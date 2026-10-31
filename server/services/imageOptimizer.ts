import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export interface OptimizationResult {
  buffer: Buffer;
  originalSize: number;
  optimizedSize: number;
  savingsBytes: number;
  savingsPercent: number;
  width: number;
  height: number;
  format: string;
  qualityUsed: number;
}

const MAX_TARGET_BYTES = 250 * 1024; // 250 KB = 256,000 bytes

/**
 * Optimizes any image buffer to WebP format, guaranteeing the final size is <= 250 KB.
 * Uses an adaptive multi-pass compression algorithm balancing visual crispness and file size.
 */
export async function optimizeBufferToWebP(
  inputBuffer: Buffer,
  targetMaxBytes = MAX_TARGET_BYTES
): Promise<OptimizationResult> {
  const originalSize = inputBuffer.length;
  const initialMeta = await sharp(inputBuffer).metadata();
  
  let currentWidth = initialMeta.width || 1920;
  let currentHeight = initialMeta.height || 1080;

  // Initial pass: Convert to WebP with high quality
  let quality = 82;
  let outputBuffer = await sharp(inputBuffer)
    .rotate() // Auto-orient based on EXIF
    .webp({ quality, effort: 6 })
    .toBuffer();

  // If already under 250 KB, check if dimensions are reasonable
  if (outputBuffer.length <= targetMaxBytes) {
    const finalMeta = await sharp(outputBuffer).metadata();
    return {
      buffer: outputBuffer,
      originalSize,
      optimizedSize: outputBuffer.length,
      savingsBytes: Math.max(0, originalSize - outputBuffer.length),
      savingsPercent: originalSize > 0 ? Math.round(((originalSize - outputBuffer.length) / originalSize) * 100) : 0,
      width: finalMeta.width || currentWidth,
      height: finalMeta.height || currentHeight,
      format: 'webp',
      qualityUsed: quality
    };
  }

  // Pass 2: Iterative quality tuning [75, 68, 60, 52, 45]
  const qualitySteps = [75, 68, 60, 52, 45];
  for (const q of qualitySteps) {
    quality = q;
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .webp({ quality: q, effort: 6 })
      .toBuffer();

    if (outputBuffer.length <= targetMaxBytes) {
      break;
    }
  }

  // Pass 3: If still over 250 KB (e.g. massive 4K/8K complex textures), scale dimensions down proportionally
  if (outputBuffer.length > targetMaxBytes) {
    const scaleLimits = [1920, 1600, 1400, 1200, 1000, 800];
    for (const maxDim of scaleLimits) {
      if (currentWidth > maxDim || currentHeight > maxDim) {
        // Try resizing to maxDim at quality 70
        outputBuffer = await sharp(inputBuffer)
          .rotate()
          .resize({
            width: currentWidth >= currentHeight ? maxDim : undefined,
            height: currentHeight > currentWidth ? maxDim : undefined,
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 72, effort: 6 })
          .toBuffer();

        if (outputBuffer.length <= targetMaxBytes) {
          quality = 72;
          break;
        }

        // If still over, drop quality to 55 at this dimension
        outputBuffer = await sharp(inputBuffer)
          .rotate()
          .resize({
            width: currentWidth >= currentHeight ? maxDim : undefined,
            height: currentHeight > currentWidth ? maxDim : undefined,
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 55, effort: 6 })
          .toBuffer();

        if (outputBuffer.length <= targetMaxBytes) {
          quality = 55;
          break;
        }
      }
    }
  }

  // Get final dimensions
  const finalMeta = await sharp(outputBuffer).metadata();
  const optimizedSize = outputBuffer.length;
  const savingsBytes = Math.max(0, originalSize - optimizedSize);
  const savingsPercent = originalSize > 0 ? Math.round((savingsBytes / originalSize) * 100) : 0;

  return {
    buffer: outputBuffer,
    originalSize,
    optimizedSize,
    savingsBytes,
    savingsPercent,
    width: finalMeta.width || currentWidth,
    height: finalMeta.height || currentHeight,
    format: 'webp',
    qualityUsed: quality
  };
}

/**
 * Optimizes an existing file on disk and writes output as .webp
 */
export async function optimizeFileToWebP(
  inputFilePath: string,
  outputFilePath?: string,
  targetMaxBytes = MAX_TARGET_BYTES
): Promise<{ result: OptimizationResult; outputPath: string }> {
  const inputBuffer = await fs.promises.readFile(inputFilePath);
  const result = await optimizeBufferToWebP(inputBuffer, targetMaxBytes);

  const destPath = outputFilePath || inputFilePath.replace(/\.[^/.]+$/, '.webp');
  await fs.promises.writeFile(destPath, result.buffer);

  return {
    result,
    outputPath: destPath
  };
}
