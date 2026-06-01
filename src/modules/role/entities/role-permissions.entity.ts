import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Role } from './role.entity'
import { Permission } from 'src/modules/permission/entities/permission.entity'

@Entity('role_permissions')
export class RolePermissions {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  roleId: string

  @Column()
  permissionId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'roleId' })
  role: Role

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'permissionId' })
  permission: Permission
}
