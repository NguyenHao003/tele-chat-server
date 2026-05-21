import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator'
import { MessageType } from '../entities/message.entity'

export class CreateMessageDto {
  @IsUUID()
  @IsOptional()
  roomId?: string

  @IsUUID()
  @IsOptional()
  receiverId?: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsEnum(MessageType)
  @IsOptional()
  type: MessageType = MessageType.TEXT
}
