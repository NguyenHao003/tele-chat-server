import { BadRequestException, Injectable } from '@nestjs/common'
import { CreatePermissionDto } from '../dto/create-permission.dto'
import { UpdatePermissionDto } from '../dto/update-permission.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Permission } from '../entities/permission.entity'
import { Repository, Not } from 'typeorm'
import { BaseQueryDto } from 'src/common/dtos/base-query.dto'
import { PaginationResponse } from 'src/common/responses/api.pagination'

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}
  async create(createPermissionDto: CreatePermissionDto) {
    const { code } = createPermissionDto
    const normalizedCode = code.toUpperCase().trim()

    const existingPermission = await this.permissionRepository.findOne({
      where: { code: normalizedCode }
    })

    if (existingPermission) {
      throw new BadRequestException('Permission code already exists')
    }

    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      code: normalizedCode
    })
    return await this.permissionRepository.save(permission)
  }

  async findAll(query: BaseQueryDto) {
    const { keyword, page, pageSize } = query
    const queryBuilder =
      this.permissionRepository.createQueryBuilder('permission')

    if (keyword) {
      queryBuilder.andWhere('permission.name LIKE :keyword', {
        keyword: `%${keyword}%`
      })
    }

    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)

    const [items, totalItems] = await queryBuilder.getManyAndCount()

    return new PaginationResponse({
      items,
      metadata: {
        page,
        pageSize,
        totalItems
      }
    })
  }

  async findOne(id: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id }
    })

    if (!permission) {
      throw new BadRequestException('Permission not found')
    }

    return permission
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.findOne(id)

    if (updatePermissionDto.code !== undefined) {
      const normalizedCode = updatePermissionDto.code.toUpperCase().trim()

      const existingPermission = await this.permissionRepository.findOne({
        where: {
          code: normalizedCode,
          id: Not(id)
        }
      })

      if (existingPermission) {
        throw new BadRequestException('Permission code already exists')
      }

      updatePermissionDto.code = normalizedCode
    }

    const updatedPermission = this.permissionRepository.merge(
      permission,
      updatePermissionDto
    )

    return await this.permissionRepository.save(updatedPermission)
  }

  async remove(id: string) {
    const permission = await this.findOne(id)
    return await this.permissionRepository.remove(permission)
  }
}
