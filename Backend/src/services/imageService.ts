
import sharp from 'sharp';
import { CustomError } from '../error/customError';

export class ImageService {
    private readonly COMPRESSION_QUALITY = 80;
    private readonly MAX_WIDTH = 1920;
    private readonly THUMBNAIL_WIDTH = 300;
    private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png','image/jpg', 'image/webp'];

    async validateImage(file: Express.Multer.File): Promise<void> {
        if (!file) {
            throw new CustomError('No file provided', 400);
        }

        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new CustomError(
                `Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
                400
            );
        }

        if (file.size > this.MAX_FILE_SIZE) {
            throw new CustomError(
                `File too large. Maximum size: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
                400
            );
        }
    }

    async compressImage(file: Express.Multer.File): Promise<Buffer> {
        try {
            const metadata = await sharp(file.buffer).metadata();
            
            // Only resize if the image is larger than MAX_WIDTH
            const pipeline = sharp(file.buffer);
            if (metadata.width && metadata.width > this.MAX_WIDTH) {
                pipeline.resize(this.MAX_WIDTH, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
            }

            return await pipeline
                .jpeg({ quality: this.COMPRESSION_QUALITY })
                .withMetadata() // Preserve metadata
                .rotate() // Auto-rotate based on EXIF
                .toBuffer();
        } catch (error) {
            console.error('Error compressing image:', error);
            throw new CustomError('Failed to compress image', 500);
        }
    }

    async createThumbnail(file: Express.Multer.File): Promise<Buffer> {
        try {
            return await sharp(file.buffer)
                .resize(this.THUMBNAIL_WIDTH, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: this.COMPRESSION_QUALITY })
                .toBuffer();
        } catch (error) {
            console.error('Error creating thumbnail:', error);
            throw new CustomError('Failed to create thumbnail', 500);
        }
    }

    getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
        return sharp(buffer).metadata().then(metadata => ({
            width: metadata.width || 0,
            height: metadata.height || 0
        }));
    }

    async getImageMetadata(buffer: Buffer): Promise<sharp.Metadata> {
        try {
            return await sharp(buffer).metadata();
        } catch (error) {
            console.error('Error getting image metadata:', error);
            throw new CustomError('Failed to get image metadata', 500);
        }
    }
}