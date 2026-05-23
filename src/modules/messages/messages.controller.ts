import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common'
import { MessagesService } from './messages.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { UpdateMessageDto } from './dto/update-message.dto'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { User } from '../users/entities/user.entity'
import { BaseQueryDto } from 'src/common/dtos/base-query.dto'
import { ApiResponse } from 'src/common/responses/api.response'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createMessageDto: CreateMessageDto
  ) {
    const result = await this.messagesService.create(user.id, createMessageDto)

    return new ApiResponse(result, 'Message created successfully')
  }

  @Get()
  findAll() {
    return this.messagesService.findAll()
  }

  @Get('/room/:roomId')
  findMessagesInRoom(
    @Param('roomId') roomId: string,
    @CurrentUser() user: User,
    @Query() query: BaseQueryDto
  ) {
    return this.messagesService.findMessagesInRoom(roomId, user.id, query)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    const result = this.messagesService.update(+id, updateMessageDto)

    return new ApiResponse(result, 'Message updated successfully')
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const result = this.messagesService.remove(id)

    return new ApiResponse(result, 'Message deleted successfully')
  }
}
