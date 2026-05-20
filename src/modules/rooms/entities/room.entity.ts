import {
  Column,
  CreateDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { RoomMember } from './room-member.entity'

export enum RoomType {
  DIRECT = 'direct', // Chat 1-1
  GROUP = 'group' // Chat nhóm
}

export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  name: string

  @Column({ nullable: true })
  avatar: string

  @Column({ type: 'enum', enum: RoomType, default: RoomType.DIRECT })
  type: RoomType

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => RoomMember, (member) => member.room, { cascade: true })
  members: RoomMember[]
}
