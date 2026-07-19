import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  fileName: string

  @Column({ type: 'varchar', length: 255 })
  mimeType: string

  @Column({ type: 'bigint' })
  size: number

  @Column({ type: 'varchar', length: 255 })
  folder: string

  @Column({ type: 'varchar', length: 255 })
  bucket: string

  @Column({ type: 'varchar', length: 500 })
  key: string

  @Column({ type: 'boolean', default: false })
  used: boolean

  @Column({ type: 'boolean', default: false })
  isPublic: boolean

  @Column({ type: 'uuid', nullable: true })
  userId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
