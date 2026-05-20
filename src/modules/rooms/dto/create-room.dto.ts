import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'
import { RoomType } from '../entities/room.entity'

export class CreateRoomDto {
  @IsEnum(RoomType)
  type: RoomType

  @IsString()
  @IsOptional()
  name?: string

  @IsArray()
  @IsNotEmpty({ message: 'Must provide member to create a room.' })
  userIds: string[]
}
