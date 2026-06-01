import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator'
import {
  DEFAULT_CODE,
  DEFAULT_DESCRIPTION,
  DEFAULT_LENGTH
} from 'src/common/constants/default.constant'

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(DEFAULT_LENGTH)
  name: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(DEFAULT_LENGTH)
  code: string = DEFAULT_CODE

  @IsBoolean()
  status: boolean = true

  @IsString()
  @IsOptional()
  description: string = DEFAULT_DESCRIPTION
}
