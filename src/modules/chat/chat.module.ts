import { Module } from '@nestjs/common'
import { ChatGateway } from './chat/chat.gateway'
import { AuthModule } from '../auth/auth.module'
import { MessagesModule } from '../messages/messages.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [AuthModule, MessagesModule, UsersModule],
  providers: [ChatGateway]
})
export class ChatModule {}
