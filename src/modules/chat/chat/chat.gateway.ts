import { UseGuards } from '@nestjs/common'
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

@WebSocketGateway({
  cors: { origin: '*' }
  // namespace: '/chat'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private readonly messageService: MessagesService) {}

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Connected:', client.id)
  }
  handleDisconnect(client: Socket) {
    console.log('Disconnect:', client.id)
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
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
}
