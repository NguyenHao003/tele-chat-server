import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PresignedUrlDto {
  @ApiProperty({ description: 'Tên tệp tin gốc', example: 'photo.jpg' })
  @IsString()
  @IsNotEmpty()
  fileName: string; // Tên file, ví dụ: "photo.jpg"

  @ApiProperty({ description: 'Định dạng MIME của tệp tin', example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty()
  fileType: string; // Định dạng MIME, ví dụ: "image/jpeg"

  @ApiProperty({ description: 'Thư mục lưu trữ trên Cloudflare R2', example: 'chat-attachments', required: false })
  @IsString()
  @IsOptional()   
  folder?: string;
}
