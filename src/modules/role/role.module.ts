import { Module } from '@nestjs/common'
import { RoleController } from './role.controller'
import { RoleService } from './services/role.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './entities/role.entity'
import { Permission } from '../permission/entities/permission.entity'
import { RolePermissions } from './entities/role-permissions.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermissions])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService]
})
export class RoleModule {}
