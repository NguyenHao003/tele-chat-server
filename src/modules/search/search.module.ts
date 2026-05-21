import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { SearchController } from './controllers/search.controller'
import { SearchService } from './services/search.service'
import { Room } from '../rooms/entities/room.entity'
import { Message } from '../messages/entities/message.entity'
import { RoomMember } from '../rooms/entities/room-member.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Room, Message, RoomMember])],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
