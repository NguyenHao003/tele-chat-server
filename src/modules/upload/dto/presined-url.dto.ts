import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PresignedUrlDto {
  @ApiProperty({ description: 'Tên tệp tin gốc', example: 'photo.jpg' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ description: 'Định dạng MIME của tệp tin', example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ description: 'Kích thước tệp tin (bytes)', example: 102456 })
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiProperty({ description: 'Thư mục lưu trữ trên Cloudflare R2', example: 'chat-attachments' })
  @IsString()
  @IsNotEmpty()
  folder: string;
}
