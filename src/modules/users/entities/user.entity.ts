import { Exclude } from 'class-transformer'
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Message } from 'src/modules/messages/entities/message.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  username: string

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  hashPassword: string

  @Column({ type: 'varchar', nullable: true })
  avatar: string

  @Column({ type: 'boolean', default: false })
  isOnline: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[]
}
