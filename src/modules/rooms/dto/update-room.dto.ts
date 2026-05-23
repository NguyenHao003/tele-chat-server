import { PartialType } from '@nestjs/mapped-types'
import { CreateRoomDto } from './create-room.dto'
import { IsOptional, IsString } from 'class-validator'

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  avatar?: string
}
