import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common'
import { RoomsService } from '../services/rooms.service'
import { CreateRoomDto } from '../dto/create-room.dto'
import { UpdateRoomDto } from '../dto/update-room.dto'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { User } from 'src/modules/users/entities/user.entity'
import { ApiResponse } from 'src/common/responses/api.response'
import {
  AddRoomMembersDto,
  RemoveRoomMembersDto
} from '../dto/add-room-members.dto'

import { ApiTags } from '@nestjs/swagger'

@ApiTags('Rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createRoomDto: CreateRoomDto
  ) {
    const data = await this.roomsService.create(user.id, createRoomDto)
    return new ApiResponse(data, 'Create room successfully')
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    const data = await this.roomsService.findRoomsByUserId(user.id)
    return new ApiResponse(data, 'Get all rooms successfully')
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.roomsService.findOne(id)
    return new ApiResponse(data, 'Get room successfully')
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto
  ) {
    const data = await this.roomsService.update(user.id, id, updateRoomDto)
    return new ApiResponse(data, 'Update room successfully')
  }

  @Post(':id/members')
  async addRoomMembers(
    @CurrentUser() user: User,
    @Param('id') roomId: string,
    @Body() addRoomMembersDto: AddRoomMembersDto
  ) {
    const data = await this.roomsService.addRoomMembers(
      user.id,
      roomId,
      addRoomMembersDto
    )
    return new ApiResponse(data, 'Add room members successfully')
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.roomsService.remove(id)
    return new ApiResponse(data, 'Delete room successfully')
  }

  @Delete(':id/members')
  async removeRoomMembers(
    @CurrentUser() user: User,
    @Param('id') roomId: string,
    @Body() removeRoomMembersDto: RemoveRoomMembersDto
  ) {
    const data = await this.roomsService.removeRoomMembers(
      user.id,
      roomId,
      removeRoomMembersDto
    )
    return new ApiResponse(data, 'Remove member successfully')
  }
}
