import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ description: 'Tên hiển thị người dùng', example: 'Nguyen Van A', required: false })
  @IsString()
  @MaxLength(255)
  username?: string

  @ApiProperty({ description: 'Địa chỉ email người dùng', example: 'user@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string

  @ApiProperty({ description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)', example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password: string

  @ApiProperty({ description: 'Đường dẫn hình ảnh đại diện', example: 'https://pub-xxxxxx.r2.dev/avatars/1721002392.png', required: false })
  @IsOptional()
  @IsString()
  avatar?: string
}
