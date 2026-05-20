import { Module } from '@nestjs/common'
import { RoomsService } from './services/rooms.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Room } from './entities/room.entity'
import { RoomMember } from './entities/room-member.entity'
import { RoomsController } from './controllers/rooms.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomMember])],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService]
})
export class RoomsModule {}
