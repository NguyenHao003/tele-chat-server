import { User } from 'src/modules/users/entities/user.entity'
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Room } from './room.entity'

@Entity('room_members')
export class RoomMember {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Room, (room) => room.members, { onDelete: 'CASCADE' })
  room: Room

  @ManyToOne(() => User)
  user: User // Thành viên trong phòng

  @CreateDateColumn()
  joinedAt: Date
}
