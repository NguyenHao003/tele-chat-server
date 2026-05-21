import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards
} from '@nestjs/common'
import { UsersService } from '../services/users.service'
import { UpdateUserDto } from '../dto/update-user.dto'
import { ApiResponse } from 'src/common/responses/api.response'
import { QueryUserDto } from '../entities/query-user.dto'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: QueryUserDto) {
    const data = await this.usersService.findAll(query)
    return new ApiResponse(data, 'Users retrieved successfully')
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto)

    return new ApiResponse({ data: user }, 'Update user successfully')
  }
}
