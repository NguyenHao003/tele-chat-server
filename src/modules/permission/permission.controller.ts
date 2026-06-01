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
import { CreatePermissionDto } from './dto/create-permission.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { PermissionService } from './services/permission.service'
import { BaseQueryDto } from 'src/common/dtos/base-query.dto'
import { ApiResponse } from 'src/common/responses/api.response'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const result = await this.permissionService.create(createPermissionDto)
    return new ApiResponse(result, 'Create success')
  }

  @Get()
  async findAll(query: BaseQueryDto) {
    const result = await this.permissionService.findAll(query)
    return new ApiResponse(result, 'Get all success')
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.permissionService.findOne(id)

    return new ApiResponse(data, 'Get permission successfully')
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ) {
    const data = await this.permissionService.update(id, updatePermissionDto)

    return new ApiResponse(data, 'Update permission successfully')
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.permissionService.remove(id)

    return new ApiResponse(data, 'Remove permission successfully')
  }
}
