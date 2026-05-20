import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateRoomDto } from '../dto/create-room.dto'
import { UpdateRoomDto } from '../dto/update-room.dto'
import { Room, RoomType } from '../entities/room.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RoomMember } from '../entities/room-member.entity'

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly memberRepository: Repository<RoomMember>
  ) {}

  async create(userId: string, createRoomDto: CreateRoomDto) {
    const { type, name, memberIds } = createRoomDto

    const allMemberIds = Array.from(new Set([userId, ...memberIds]))

    if (type === RoomType.DIRECT) {
      if (allMemberIds.length !== 2) {
        throw new BadRequestException(
          'Direct chat must have exactly 2 members (the user and one other).'
        )
      }

      const existingRoom = await this.roomRepository
        .createQueryBuilder('room')
        .innerJoin('room.members', 'm1')
        .innerJoin('room.members', 'm2')
        .where('room.type =:type', { type: RoomType.DIRECT })
        .where('room.type = :type', { type: RoomType.DIRECT })
        .getOne()

      if (existingRoom) {
        throw new BadRequestException('Direct chat already exists.')
      }
    }

    if (type === RoomType.GROUP && !name) {
      throw new BadRequestException('Group chat must have a name.')
    }

    return await this.roomRepository.manager.transaction(async (manager) => {
      const newRoom = this.roomRepository.create({ type, name })
      const savedRoom = await this.roomRepository.save(newRoom)

      const membersData = allMemberIds.map((memberId) => {
        return this.memberRepository.create({
          room: savedRoom,
          user: { id: memberId }
        })
      })

      await this.memberRepository.save(membersData)
      return savedRoom
    })
  }

  async findAll(userId: string) {
    return await this.roomRepository
      .createQueryBuilder('room')
      .innerJoin(
        'room.members',
        'currentMember',
        'currentMember.userId = :userId',
        { userId }
      )
      .leftJoinAndSelect('room.members', 'member')
      .leftJoinAndSelect('member.user', 'user')
      // .leftJoinAndSelect(
      //   'room.messages',
      //   'lastMessage',
      //   'lastMessage.id = (SELECT m.id FROM message m WHERE m.roomId = room.id ORDER BY m.createdAt DESC LIMIT 1)'
      // )
      .select([
        'room.id',
        'room.name',
        'room.type',
        'room.createdAt',
        'member.id',
        'user.id',
        'user.username',
        'user.avatar'
        // 'lastMessage.id',
        // 'lastMessage.content',
        // 'lastMessage.createdAt'
      ])
      // .orderBy('lastMessage.createdAt', 'DESC', 'NULLS LAST')
      .getMany()
  }

  findOne(id: number) {
    return `This action returns a #${id} room`
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`
  }

  remove(id: number) {
    return `This action removes a #${id} room`
  }
}
