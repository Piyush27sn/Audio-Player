import { parseFile } from 'music-metadata';
import path from 'path';

export const extractCoverArt = async (filePath) => {
  try {
    const resolvedPath = path.resolve(filePath);
    const metadata = await parseFile(resolvedPath);
    const picture = metadata.common?.picture?.[0];

    if (!picture?.data?.length) {
      return null;
    }

    const mimeType = picture.format || 'image/jpeg';
    const base64 = Buffer.from(picture.data).toString('base64');

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Failed to extract cover art:', error);
    return null;
  }
};
