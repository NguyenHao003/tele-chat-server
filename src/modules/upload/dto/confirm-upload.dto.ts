import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmUploadDto {
  @ApiProperty({ description: 'ID của file đã lưu trong database', example: 'd3b07384-d113-4ec2-a5d6-c035028aa022' })
  @IsUUID()
  @IsNotEmpty()
  fileId: string;
}
