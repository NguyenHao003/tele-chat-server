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

      const exsistingRoom = await this.roomRepository
        .createQueryBuilder('room')
        .innerJoin('room.members', 'm1')
        .innerJoin('room.members', 'm2')
        .where('room.type =:type', { type: RoomType.DIRECT })
        .andWhere('m1.userId =:user1', { user1: allMemberIds[0] })
        .andWhere('m2.userId =:user2', { user2: allMemberIds[1] })
        .getOne()

      if (exsistingRoom) {
        throw new BadRequestException('Direct chat already exists.')
      }
    }

    if (type === RoomType.GROUP && !name) {
      throw new BadRequestException('Group chat must have a name.')
    }

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
  }

  findAll() {
    return `This action returns all rooms`
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
