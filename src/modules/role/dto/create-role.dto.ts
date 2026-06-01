import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  code: string

  @IsString()
  @IsOptional()
  description: string

  @IsBoolean()
  status: boolean
}
