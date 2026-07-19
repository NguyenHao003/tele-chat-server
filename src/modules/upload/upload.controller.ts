import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Delete, Query, Get } from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/responses/api.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { PresignedUrlDto } from './dto/presined-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload ảnh đại diện trực tiếp lên hệ thống R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Tệp hình ảnh avatar (.png, .jpg, .jpeg)',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Đã tải ảnh đại diện lên thành công' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const url = await this.uploadService.uploadFile(file, 'avatars');
    return new ApiResponse({ url }, 'Avatar uploaded successfully');
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Lấy liên kết Presigned URL để client tự upload trực tiếp lên R2' })
  @ApiCreatedResponse({ description: 'Khởi tạo Presigned URL thành công' })
  async getPresignedUrl(
    @Body() presignedUrlDto: PresignedUrlDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.uploadService.getPresignedUrl(
      presignedUrlDto.fileName,
      presignedUrlDto.mimeType,
      presignedUrlDto.size,
      presignedUrlDto.folder,
      userId,
    );
    return new ApiResponse(data, 'Presigned URL generated successfully');
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Xác nhận tải tệp lên thành công và cập nhật trạng thái sử dụng' })
  @ApiCreatedResponse({ description: 'Xác nhận trạng thái upload file thành công' })
  async confirmUpload(
    @Body() confirmUploadDto: ConfirmUploadDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.uploadService.confirmUpload(
      confirmUploadDto.fileId,
      userId,
    );
    return new ApiResponse(data, 'File upload confirmed successfully');
  }

  @Delete()
  @ApiOperation({ summary: 'Xóa file khỏi Cloudflare R2' })
  async deleteFile(@Query('fileUrl') fileUrl: string) {
    if (!fileUrl) {
      throw new BadRequestException('fileUrl query parameter is required');
    }
    const result = await this.uploadService.deleteFile(fileUrl);
    return new ApiResponse(result, 'File deleted successfully');
  }

  @Get('private-url')
  @ApiOperation({ summary: 'Lấy liên kết đọc (GET) cho file private' })
  async getPrivateUrl(@Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('key query parameter is required');
    }
    const data = await this.uploadService.getPrivateFileUrl(key);
    return new ApiResponse(data, 'Private read URL generated successfully');
  }
}
