import {
  BadRequestException,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { CreateMessageDto } from './dto/create-message.dto'
import { UpdateMessageDto } from './dto/update-message.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Room, RoomType } from '../rooms/entities/room.entity'
import { RoomMember } from '../rooms/entities/room-member.entity'
import { Repository } from 'typeorm'
import { Message } from './entities/message.entity'
import { BaseQueryDto } from 'src/common/dtos/base-query.dto'
import { PaginationResponse } from 'src/common/responses/api.pagination'

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly memberRepository: Repository<RoomMember>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>
  ) {}

  async create(senderId: string, createMessageDto: CreateMessageDto) {
    const { content, type, roomId, receiverId } = createMessageDto

    if (!roomId && !receiverId) {
      throw new BadRequestException('Room or receiver is required.')
    }

    if (roomId && receiverId) {
      throw new BadRequestException(
        'Provide either roomId or receiverId, not both.'
      )
    }

    let targetRoomId = roomId

    if (roomId) {
      // BẢO MẬT: Kiểm tra xem ông user này có thực sự là thành viên của phòng này không
      const isMember = await this.memberRepository.findOne({
        where: { roomId: targetRoomId, userId: senderId }
      })

      if (!isMember) {
        throw new ForbiddenException('You are not a member of this room.')
      }
    }

    if (receiverId) {
      if (receiverId === senderId) {
        throw new BadRequestException('Cannot send message to yourself.')
      }

      const existingRoom = await this.roomRepository
        .createQueryBuilder('room')
        .innerJoin(
          'room.members',
          'senderMember',
          'senderMember.userId = :senderId',
          { senderId }
        )
        .innerJoin(
          'room.members',
          'receiverMember',
          'receiverMember.userId = :receiverId',
          { receiverId }
        )
        .where('room.type = :type', { type: RoomType.DIRECT })
        .getOne()

      if (existingRoom) {
        targetRoomId = existingRoom.id
      } else {
        const newRoom = await this.roomRepository.manager.transaction(
          async (manager) => {
            const room = manager.create(Room, {
              type: RoomType.DIRECT
            })
            const savedRoom = await manager.save(room)

            const members = [
              manager.create(RoomMember, {
                userId: senderId,
                roomId: savedRoom.id
              }),
              manager.create(RoomMember, {
                userId: receiverId,
                roomId: savedRoom.id
              })
            ]

            await manager.save(RoomMember, members)
            return savedRoom
          }
        )
        targetRoomId = newRoom.id
      }
    }

    if (!targetRoomId) {
      throw new BadRequestException('Cannot determine target room.')
    }

    const newMessage = this.messageRepository.create({
      roomId: targetRoomId,
      senderId,
      content,
      type
    })

    const saveMessage = await this.messageRepository.save(newMessage)

    return await this.messageRepository.findOne({
      where: { id: saveMessage.id },
      relations: ['sender'],
      select: {
        sender: {
          id: true,
          username: true,
          avatar: true,
          email: true,
          isOnline: true
        }
      }
    })
  }

  findAll() {
    return `This action returns all messages`
  }

  async findMemberIdsByRoomId(roomId: string) {
    const members = await this.memberRepository.find({
      where: { roomId },
      select: {
        userId: true
      }
    })

    return members.map((member) => member.userId)
  }

  async findMessagesInRoom(
    roomId: string,
    userId: string,
    query: BaseQueryDto
  ) {
    const { page, pageSize } = query

    const isMember = await this.memberRepository.findOne({
      where: { roomId, userId }
    })

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room.')
    }

    const skip = (page - 1) * pageSize
    const [items, total] = await this.messageRepository.findAndCount({
      where: { roomId },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
      select: {
        sender: {
          id: true,
          username: true,
          avatar: true,
          email: true,
          isOnline: true
        }
      },
      skip,
      take: pageSize
    })

    items.reverse()

    return new PaginationResponse({
      items,
      metadata: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`
  }

  async remove(id: string) {
    const result = await this.messageRepository.delete({ id })

    if (result.affected === 0) {
      throw new BadRequestException('Message not found')
    }

    return {
      removedCount: result.affected
    }
  }
}
