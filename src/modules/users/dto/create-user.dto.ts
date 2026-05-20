import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class CreateUserDto {
  @IsString()
  @MaxLength(255)
  username?: string

  @IsEmail()
  @MaxLength(255)
  email: string

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password: string

  @IsOptional()
  @IsString()
  avatar?: string
}
