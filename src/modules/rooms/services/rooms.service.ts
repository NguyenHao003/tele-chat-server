import {
  BadRequestException,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { CreateRoomDto } from '../dto/create-room.dto'
import { UpdateRoomDto } from '../dto/update-room.dto'
import { Room, RoomType } from '../entities/room.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { RoomMember } from '../entities/room-member.entity'
import {
  AddRoomMembersDto,
  RemoveRoomMembersDto
} from '../dto/add-room-members.dto'

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

      const otherUserId = allMemberIds.find((id) => id !== userId)

      const existingRoom = await this.roomRepository
        .createQueryBuilder('room')
        .innerJoin('room.members', 'm1', 'm1.userId = :userId', { userId })
        .innerJoin('room.members', 'm2', 'm2.userId = :otherUserId', {
          otherUserId
        })
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

  async findRoomsByUserId(userId: string) {
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
      .leftJoinAndMapOne(
        'room.lastMessage',
        'room.messages',
        'lastMessage',
        'lastMessage.id = (SELECT m.id FROM messages m WHERE m."roomId" = room.id ORDER BY m."createdAt" DESC LIMIT 1)'
      )
      .select([
        'room.id',
        'room.name',
        'room.type',
        'room.createdAt',
        'member.id',
        'user.id',
        'user.username',
        'user.avatar',
        'lastMessage.id',
        'lastMessage.content',
        'lastMessage.createdAt',
        'lastMessage.type'
      ])
      .orderBy('lastMessage.createdAt', 'DESC', 'NULLS LAST')
      .getMany()
  }

  findOne(id: number) {
    return `This action returns a #${id} room`
  }

  async update(userId: string, roomId: string, updateRoomDto: UpdateRoomDto) {
    const { name, avatar } = updateRoomDto

    if (name === undefined && avatar === undefined) {
      throw new BadRequestException('No room information provided.')
    }

    const room = await this.roomRepository.findOneBy({ id: roomId })

    if (!room) {
      throw new BadRequestException('Room not found')
    }

    if (room.type !== RoomType.GROUP) {
      throw new BadRequestException('Only group rooms can be updated.')
    }

    const isMember = await this.memberRepository.findOne({
      where: { roomId: roomId, userId }
    })

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room.')
    }

    if (name !== undefined) {
      const trimmedName = name.trim()

      if (!trimmedName) {
        throw new BadRequestException('Group room name is required.')
      }

      room.name = trimmedName
    }

    if (avatar !== undefined) {
      room.avatar = avatar
    }

    return await this.roomRepository.save(room)
  }

  async addRoomMembers(
    userId: string,
    roomId: string,
    addRoomMembersDto: AddRoomMembersDto
  ) {
    const { memberIds } = addRoomMembersDto

    const room = await this.roomRepository.findOneBy({ id: roomId })

    if (!room) {
      throw new BadRequestException('Room not found')
    }

    if (room.type !== RoomType.GROUP) {
      throw new BadRequestException('Only group rooms can be added members.')
    }

    const currentMember = await this.memberRepository.findOne({
      where: { roomId, userId }
    })

    if (!currentMember) {
      throw new ForbiddenException('You are not a member of this room.')
    }

    const uniqueMemberIds = Array.from(new Set(memberIds))

    if (!uniqueMemberIds.length) {
      throw new BadRequestException('Must provide members to add.')
    }

    return await this.roomRepository.manager.transaction(async (manager) => {
      const membersData = uniqueMemberIds.map((memberId) => {
        return this.memberRepository.create({
          room: room,
          user: { id: memberId }
        })
      })

      await this.memberRepository.save(membersData)
      return room
    })
  }

  async remove(id: string) {
    const existingRoom = await this.roomRepository.findOneBy({ id })
    if (!existingRoom) {
      throw new BadRequestException('Room not found')
    }

    return await this.roomRepository.delete(id)
  }

  async removeRoomMembers(
    userId: string,
    roomId: string,
    removeRoomMembersDto: RemoveRoomMembersDto
  ) {
    const { memberIds } = removeRoomMembersDto

    const room = await this.roomRepository.findOneBy({ id: roomId })

    if (!room) {
      throw new BadRequestException('Room not found')
    }

    if (room.type !== RoomType.GROUP) {
      throw new BadRequestException('Only group rooms can be removed members.')
    }

    const currentMember = await this.memberRepository.findOne({
      where: { roomId, userId }
    })

    if (!currentMember) {
      throw new ForbiddenException('You are not a member of this room.')
    }

    const uniqueMemberIds = Array.from(new Set(memberIds))

    if (!uniqueMemberIds.length) {
      throw new BadRequestException('Must provide members to remove.')
    }

    const result = await this.memberRepository.delete({
      roomId,
      userId: In(uniqueMemberIds)
    })

    return {
      removedCount: result.affected ?? 0
    }
  }
}
