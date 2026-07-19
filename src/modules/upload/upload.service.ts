import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class UploadService {
    private s3Client: S3Client;
    private bucketName: string;
    private publicUrl: string;

    constructor(
        private configService: ConfigService,
        @InjectRepository(FileEntity)
        private readonly fileRepository: Repository<FileEntity>,
    ) {
        this.bucketName = this.configService.get<string>('R2_BUCKET_NAME');
        this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL');
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: this.configService.get<string>('R2_ENDPOINT'),
            forcePathStyle: true,
            requestChecksumCalculation: 'WHEN_REQUIRED',
            responseChecksumValidation: 'WHEN_REQUIRED',
            credentials: {
                accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
            },
        });
    }

    private getBucketConfig(folder: string) {
        // Both avatars and files folders are stored in the configured R2_BUCKET_NAME.
        // The bucket is public if R2_PUBLIC_URL is configured.
        return {
            bucket: this.bucketName,
            isPublic: !!this.publicUrl,
        };
    }

    async uploadFile(file: Express.Multer.File, folder?: string) {
        const ext = path.extname(file.originalname);
        const uniqueName = `${folder || 'default'}/${Date.now()}${ext}`;

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: uniqueName,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3Client.send(command);

            return `${this.publicUrl}/${uniqueName}`;
        } catch (error) {
            throw new BadRequestException(`Failed to upload file to R2: ${error.message}`);
        }
    }

    async getPresignedUrl(
        fileName: string,
        mimeType: string,
        size: number,
        folder: string,
        userId?: string,
    ) {
        const ext = path.extname(fileName);
        const baseName = path.basename(fileName, ext).replace(/\s+/g, '_');
        const uniqueName = `${folder}/${Date.now()}_${baseName}${ext}`;

        const { bucket, isPublic } = this.getBucketConfig(folder);

        try {
            // Save initial file record with used: false
            const fileRecord = this.fileRepository.create({
                fileName,
                mimeType,
                size,
                folder,
                bucket,
                key: uniqueName,
                used: false,
                isPublic,
                userId,
            });
            const savedFile = await this.fileRepository.save(fileRecord);

            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: uniqueName,
                ContentType: mimeType,
            });

            const uploadUrl = await getSignedUrl(this.s3Client, command, {
                expiresIn: 60 * 5,
            });

            return {
                uploadUrl,
                fileId: savedFile.id,
            };
        } catch (error) {
            throw new BadRequestException(`Failed to get presigned URL: ${error.message}`);
        }
    }

    async confirmUpload(fileId: string, userId: string) {
        const fileRecord = await this.fileRepository.findOne({
            where: { id: fileId },
        });

        if (!fileRecord) {
            throw new BadRequestException('File not found');
        }

        if (fileRecord.userId && fileRecord.userId !== userId) {
            throw new BadRequestException('Unauthorized to confirm this file upload');
        }

        if (fileRecord.used) {
            throw new BadRequestException('File has already been confirmed and used');
        }

        // Update the file status to used
        fileRecord.used = true;
        await this.fileRepository.save(fileRecord);

        // Return publicUrl if the bucket/folder is public
        if (fileRecord.isPublic) {
            return {
                publicUrl: `${this.publicUrl}/${fileRecord.key}`,
            };
        }

        return {
            publicUrl: null,
        };
    }

    async getPrivateFileUrl(fileKey: string) {
        try {
            const fileRecord = await this.fileRepository.findOne({
                where: { key: fileKey },
            });
            const bucket = fileRecord ? fileRecord.bucket : this.bucketName;

            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: fileKey,
            });
            const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 60 * 5 });
            return presignedUrl;
        } catch (error) {
            throw new BadRequestException(`Failed to get private file URL: ${error.message}`);
        }
    }

    async deleteFile(fileKeyOrUrl: string) {
        let key = fileKeyOrUrl;
        if (fileKeyOrUrl.startsWith('http://') || fileKeyOrUrl.startsWith('https://')) {
            key = fileKeyOrUrl.replace(`${this.publicUrl}/`, '');
        }

        try {
            const fileRecord = await this.fileRepository.findOne({
                where: { key: key },
            });
            const bucket = fileRecord ? fileRecord.bucket : this.bucketName;

            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            await this.s3Client.send(command);

            if (fileRecord) {
                await this.fileRepository.remove(fileRecord);
            }

            return true;
        } catch (error) {
            throw new BadRequestException(`Failed to delete file from R2: ${error.message}`);
        }
    }
}
