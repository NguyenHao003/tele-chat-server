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
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { User } from '../entities/user.entity'

import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: QueryUserDto) {
    const data = await this.usersService.findAll(query)
    return new ApiResponse(data, 'Users retrieved successfully')
  }

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại của người dùng đang đăng nhập' })
  async getMe(@CurrentUser() user: User) {
    return new ApiResponse(user, 'User profile retrieved successfully')
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id)
    return new ApiResponse(user, 'User retrieved successfully')
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto)

    return new ApiResponse({ data: user }, 'Update user successfully')
  }
}
