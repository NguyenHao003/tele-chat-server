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

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() createRoomDto: CreateRoomDto) {
    const data = await this.roomsService.create(user.id, createRoomDto)
    return new ApiResponse(data)
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    const data = await this.roomsService.findAll(user.id)
    return new ApiResponse(data)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.roomsService.findOne(+id)
    return new ApiResponse(data)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    const data = await this.roomsService.update(+id, updateRoomDto)
    return new ApiResponse(data)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.roomsService.remove(+id)
    return new ApiResponse(data)
  }
}
