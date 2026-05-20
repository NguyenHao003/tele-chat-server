import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { RoomMember } from './room-member.entity'
import { Message } from 'src/modules/messages/entities/message.entity'

export enum RoomType {
  DIRECT = 'direct', // Chat 1-1
  GROUP = 'group' // Chat nhóm
}

@Entity('rooms')
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

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[]
}
