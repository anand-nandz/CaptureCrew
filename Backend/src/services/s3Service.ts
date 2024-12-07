import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv'
dotenv.config()

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BUCKET_REGION: string;
            ACCESS_KEY: string;
            SECRET_ACCESS_KEY: string;
            BUCKET_NAME: string;
        }
    }
}

export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    constructor() {
        this.bucketName = process.env.BUCKET_NAME;
        this.region = process.env.BUCKET_REGION;
        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY,
                secretAccessKey: process.env.SECRET_ACCESS_KEY
            }
        });
        
    }

    async getFile(folderPath:string , fileName: string | undefined) :  Promise<string> {
        try {
            
            const getObjectparams = {
                Bucket : this.bucketName,
                Key :`${folderPath}${fileName}`
            }
            
            const getCommand = new GetObjectCommand(getObjectparams)           
            const url = await getSignedUrl(this.s3Client, getCommand, {expiresIn : 604800 })                     
            return url

        } catch (error) {
            throw new Error('Failed to generate signedUrl')
        }
    }

    async uploadToS3(
        folderPath: string,
        file: Express.Multer.File
    ): Promise<string> {
        
        const imageBuffer : Buffer = file.buffer;
        const fileName : string = file.originalname;
        const contentType : string = file.mimetype;        

        const uniqueFileName = `${uuidv4()}-${fileName}`;

        try {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: `${folderPath}${uniqueFileName}`,
                Body: imageBuffer,
                ContentType: contentType,
            }));

            return `${uniqueFileName}`;
        } catch (error) {
            console.error('Error uploading to S3:', error);
            throw new Error('Failed to upload file to S3');
        }
    }

    async deleteFromS3(key: string): Promise<void> {
        try {
            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            }));
            
        } catch (error) {
            console.error('Error deleting from S3:', error);
            throw new Error('Failed to delete file from S3');
        }
    }


}

export const s3Service = new S3Service();