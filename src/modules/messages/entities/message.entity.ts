import { Room } from 'src/modules/rooms/entities/room.entity'
import { User } from 'src/modules/users/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE'
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  roomId: string

  @Column()
  senderId: string

  @Column()
  content: string

  @Column()
  type: MessageType

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Room, (room) => room.messages)
  @JoinColumn({ name: 'roomId' })
  room: Room

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'senderId' })
  user: User
}
