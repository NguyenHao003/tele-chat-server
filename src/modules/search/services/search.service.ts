import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseQueryDto } from 'src/common/dtos/base-query.dto'
import { Message } from 'src/modules/messages/entities/message.entity'
import { RoomMember } from 'src/modules/rooms/entities/room-member.entity'
import { Room, RoomType } from 'src/modules/rooms/entities/room.entity'
import { User } from 'src/modules/users/entities/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(RoomMember)
    private readonly roomMemberRepository: Repository<RoomMember>
  ) {}

  async searchConversations(userId: string, query: BaseQueryDto) {
    const { keyword, page, pageSize } = query

    const rooms = await this.roomRepository
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
      .where('(room.name LIKE :keyword OR user.username LIKE :keyword)', {
        keyword: `%${keyword || ''}%`
      })
      .select([
        'room.id',
        'room.name',
        'room.type',
        'room.avatar',
        'room.createdAt',
        'member.id',
        'member.userId',
        'user.id',
        'user.username',
        'user.avatar',
        'user.isOnline',
        'lastMessage.id',
        'lastMessage.content',
        'lastMessage.createdAt',
        'lastMessage.type'
      ])
      .orderBy('lastMessage.createdAt', 'DESC', 'NULLS LAST')
      .getMany()

    const roomItems = rooms.map((room) => {
      const otherMember = room.members.find(
        (member) => member.userId !== userId
      )

      const isDirect = room.type === RoomType.DIRECT

      return {
        type: 'room',
        hasRoom: true,
        roomId: room.id,
        roomType: room.type,
        title: isDirect ? otherMember?.user?.username : room.name,
        avatar: isDirect ? otherMember?.user?.avatar : room.avatar,
        targetUser: isDirect
          ? {
              id: otherMember?.user?.id,
              username: otherMember?.user?.username,
              avatar: otherMember?.user?.avatar,
              isOnline: otherMember?.user?.isOnline
            }
          : null,
        lastMessage: room['lastMessage'] || null
      }
    })

    // Keyword trống không tìm users
    const normalizedKeyword = keyword?.trim()
    if (!normalizedKeyword) {
      return {
        keyword,
        mode: 'recent',
        items: roomItems
      }
    }

    const existingDirectUserIds = roomItems
      .filter(
        (item) => item.roomType === RoomType.DIRECT && item.targetUser?.id
      )
      .map((item) => item.targetUser.id)

    const userQuery = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId })
      .andWhere('user.username LIKE :keyword', {
        keyword: `%${keyword || ''}%`
      })
      .select(['user.id', 'user.username', 'user.avatar', 'user.isOnline'])

    if (existingDirectUserIds.length > 0) {
      userQuery.andWhere('user.id NOT IN (:...existingDirectUserIds)', {
        existingDirectUserIds
      })
    }

    const users = await userQuery.getMany()

    const userItems = users.map((user) => ({
      type: 'user',
      hasRoom: false,
      userId: user.id,
      title: user.username,
      avatar: user.avatar,
      targetUser: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        isOnline: user.isOnline
      },
      lastMessage: null
    }))

    return {
      keyword,
      items: [...roomItems, ...userItems]
    }
  }
}
