import { PartialType } from '@nestjs/mapped-types'
import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class AddRoomMembersDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Must provide member IDs' })
  memberIds: string[]
}

export class RemoveRoomMembersDto extends PartialType(AddRoomMembersDto) {}
