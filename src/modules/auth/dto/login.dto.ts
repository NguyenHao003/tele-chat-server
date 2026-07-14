import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: 'Địa chỉ email người dùng', example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string
}
