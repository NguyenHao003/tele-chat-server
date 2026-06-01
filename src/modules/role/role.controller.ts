import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query
} from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { RoleService } from './services/role.service'
import { BaseQueryDto } from 'src/common/dtos/base-query.dto'
import { ApiResponse } from 'src/common/responses/api.response'

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto)
  }

  @Get()
  async findAll(@Query() query: BaseQueryDto) {
    const data = await this.roleService.findAll(query)

    return new ApiResponse(data, 'Roles retrieved successfully')
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.roleService.findOne(id)

    return new ApiResponse(data, 'Role retrieved successfully')
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const data = await this.roleService.update(id, updateRoleDto)

    return new ApiResponse(data, 'Update role successfully')
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.roleService.remove(id)

    return new ApiResponse(data, 'Remove role successfully')
  }
}
