import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateRoleDto } from '../dto/create-role.dto'
import { UpdateRoleDto } from '../dto/update-role.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Role } from '../entities/role.entity'
import { Repository } from 'typeorm'
import { BaseQueryDto } from 'src/common/dtos/base-query.dto'
import { PaginationResponse } from 'src/common/responses/api.pagination'

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this.roleRepository.findOne({
      where: { code: createRoleDto.code }
    })

    if (existingRole) {
      throw new BadRequestException('Role already exists')
    }

    const role = this.roleRepository.create(createRoleDto)

    return this.roleRepository.save(role)
  }

  async findAll(query: BaseQueryDto) {
    const { page, pageSize, keyword } = query
    const queryList = this.roleRepository.createQueryBuilder('role')

    if (keyword) {
      queryList.andWhere('role.name LIKE :keyword', { keyword: `%${keyword}%` })
    }

    const [items, totalItems] = await queryList.getManyAndCount()

    return new PaginationResponse({
      items,
      metadata: {
        page,
        pageSize,
        totalItems
      }
    })
  }

  findOne(id: string) {
    const role = this.roleRepository.findOne({
      where: { id },
      relations: {
        rolePermissions: {
          permission: true
        }
      }
    })

    if (!role) {
      throw new BadRequestException('Role not found')
    }

    return role
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: { id }
    })

    if (!role) {
      throw new BadRequestException('Role not found')
    }

    const existingRole = await this.roleRepository.findOne({
      where: { code: updateRoleDto.code }
    })

    if (existingRole) {
      throw new BadRequestException('Role already exists')
    }

    const updatedRole = this.roleRepository.merge(role, updateRoleDto)

    return this.roleRepository.save(updatedRole)
  }

  async remove(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id }
    })

    if (!role) {
      throw new BadRequestException('Role not found')
    }

    return this.roleRepository.delete(role)
  }
}
