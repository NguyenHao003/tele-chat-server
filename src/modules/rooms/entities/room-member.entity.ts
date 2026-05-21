import { User } from 'src/modules/users/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Room } from './room.entity'

@Entity('room_members')
export class RoomMember {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  roomId: string

  @Column()
  userId: string

  @ManyToOne(() => Room, (room) => room.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  joinedAt: Date
}
