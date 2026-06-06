import { UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { WsJwtGuard } from 'src/modules/auth/guards/ws-jwt.guard'
import { MessageType } from 'src/modules/messages/entities/message.entity'
import { MessagesService } from 'src/modules/messages/messages.service'
import { UsersService } from 'src/modules/users/services/users.service'

@WebSocketGateway({
  cors: { origin: '*' }
  // namespace: '/chat'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly onlineUsers = new Map<string, Set<string>>()

  constructor(
    private readonly messageService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token || (client.handshake.query?.token as string)

      if (!token) {
        client.disconnect()
        return
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET')
      })

      const user = await this.usersService.findByEmail(payload.email)

      if (!user) {
        client.disconnect()
        return
      }

      client.data.user = user
      client.join(`user:${user.id}`)

      const sockets = this.onlineUsers.get(user.id) || new Set<string>()
      const wasOffline = sockets.size === 0

      sockets.add(client.id)
      this.onlineUsers.set(user.id, sockets)

      if (wasOffline) {
        await this.usersService.updateStatus(user.id, true)
        await this.notifyContacts(user.id, true)
      }

      console.log('Connected:', client.id, 'user:', user.id)
    } catch {
      client.disconnect()
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.user?.id

    if (!userId) return

    const normalizedUserId = String(userId)
    const sockets = this.onlineUsers.get(normalizedUserId)

    if (!sockets) return

    sockets.delete(client.id)

    if (sockets.size === 0) {
      this.onlineUsers.delete(normalizedUserId)
      await this.usersService.updateStatus(normalizedUserId, false)
      await this.notifyContacts(normalizedUserId, false)
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const user = client.data.user
    client.join(`user:${user.id}`)
    client.join(data.roomId)
    client.emit('joinedRoom', { roomId: data.roomId })
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; type: MessageType }
  ) {
    const user = client.data.user

    const message = await this.messageService.create(user.id, {
      content: data.content,
      type: data.type,
      roomId: data.roomId
    })

    this.server.to(data.roomId).emit('messageCreated', message)

    const memberIds = await this.messageService.findMemberIdsByRoomId(
      data.roomId
    )

    for (const memberId of memberIds) {
      this.server.to(`user:${memberId}`).emit('roomUpdated', message)
    }
  }

  // Gửi tin nhắn trực tiếp cho user (tự tạo room nếu chưa có)
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendDirectMessage')
  async handleSendDirectMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { receiverId: string; content: string; type: MessageType }
  ) {
    const user = client.data.user

    const message = await this.messageService.create(user.id, {
      receiverId: data.receiverId,
      content: data.content,
      type: data.type
    })

    // Emit cho người gửi
    client.emit('newMessage', message)

    // Emit cho người nhận nếu đang online
    // (sau này sẽ xử lý qua Redis, tạm thời dùng cách này)
    this.server.to(`user:${data.receiverId}`).emit('newMessage', message)
  }

  private async notifyContacts(userId: string, isOnline: boolean) {
    const contactIds = await this.messageService.findContactIdsByUserId(userId)

    for (const contactId of contactIds) {
      this.server.to(`user:${contactId}`).emit('contactUpdated', {
        userId,
        isOnline,
        lastSeenAt: isOnline ? null : new Date().toISOString()
      })
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('getContactStatuses')
  async handleGetContactStatuses(@ConnectedSocket() client: Socket) {
    const userId = String(client.data.user.id)

    const contactIds = await this.messageService.findContactIdsByUserId(userId)

    const statuses = contactIds.map((contactId) => ({
      userId: contactId,
      isOnline: this.onlineUsers.has(String(contactId))
    }))

    client.emit('contactStatuses', statuses)
  }
}
