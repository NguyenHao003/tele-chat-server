import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';


@Injectable()
export class UploadService {

    private s3Client: S3Client
    private bucketName: string
    private publicUrl: string

    constructor(
        private configService: ConfigService,
    ) {
        this.bucketName = this.configService.get<string>('R2_BUCKET_NAME')
        this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL')
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: this.configService.get<string>('R2_ENDPOINT'),
            credentials: {
                accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
            },
        });
    }

    async uploadFile(file: Express.Multer.File, folder?: string) {
        const ext = path.extname(file.originalname)
        const uniqueName = `${folder}/${Date.now()}${ext}`

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: uniqueName,
                Body: file.buffer,
                ContentType: file.mimetype,
            })

            await this.s3Client.send(command)

            return `${this.publicUrl}/${uniqueName}`
        } catch (error) {
            throw new BadRequestException(`Failed to upload file to R2: ${error.message}`);
        }
    }

    async getPresignedUrl(fileName:string, fileType:string, folder:string) {
        const ext = path.extname(fileName)
        const uniqueName = `${folder}/${Date.now()}${ext}`

       try {

            const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: uniqueName,
            ContentType: fileType,
        })

        const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 60 * 5 })

        return {
            presignedUrl,
            fileUrl: `${this.publicUrl}/${uniqueName}`
        }
       } catch (error) {
           throw new BadRequestException(`Failed to get presigned URL: ${error.message}`);
       }
        
    }

    async getPrivateFileUrl (fileKey: string) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            })
            const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 60 * 5 })
            return presignedUrl
        } catch (error) {
            throw new BadRequestException(`Failed to get private file URL: ${error.message}`);
        }
    }

   async deleteFile(fileKeyOrUrl: string) {
    let key = fileKeyOrUrl;
    // Kiểm tra xem đầu vào là URL hay Key
    if (fileKeyOrUrl.startsWith('http://') || fileKeyOrUrl.startsWith('https://')) {
      key = fileKeyOrUrl.replace(`${this.publicUrl}/`, '');
    }
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      throw new BadRequestException(`Failed to delete file from R2: ${error.message}`);
    }
  }

}


