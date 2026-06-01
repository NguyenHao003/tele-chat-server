import { Module } from '@nestjs/common'
import { ChatGateway } from './chat.gateway'
import { AuthModule } from '../auth/auth.module'
import { MessagesModule } from '../messages/messages.module'
import { UsersModule } from '../users/users.module'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [AuthModule, MessagesModule, UsersModule],
  providers: [ChatGateway, JwtService, ConfigService]
})
export class ChatModule {}
