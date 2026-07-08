import sharp from "sharp";
import smartcrop from "smartcrop-sharp";

const DEFAULT_FOCAL_POINT = { x: 0.5, y: 0.5 };

// Ponto focal calculado sobre a imagem original, pensado para caber em recortes 16:9
// (aspect-video) sem cortar a parte mais relevante da imagem.
export async function computeFocalPoint(buffer: Buffer): Promise<{ x: number; y: number }> {
  try {
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;
    if (!width || !height) return DEFAULT_FOCAL_POINT;

    const result = await smartcrop.crop(buffer, { width: 1280, height: 720 });
    const crop = result.topCrop;

    const x = (crop.x + crop.width / 2) / width;
    const y = (crop.y + crop.height / 2) / height;

    return {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };
  } catch (err) {
    console.error("[smart-crop] falha ao calcular ponto focal:", err);
    return DEFAULT_FOCAL_POINT;
  }
}
