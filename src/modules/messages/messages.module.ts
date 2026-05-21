import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Room } from '../rooms/entities/room.entity';
import { RoomMember } from '../rooms/entities/room-member.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Message, Room, RoomMember])],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
