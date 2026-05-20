import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { UsersService } from '../services/users.service'
import { UpdateUserDto } from '../dto/update-user.dto'
import { ApiResponse } from 'src/common/responses/api.response'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto)

    return new ApiResponse({ data: user }, 'Update user successfully')
  }
}
