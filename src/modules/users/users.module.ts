import { Module } from '@nestjs/common'
import { UsersController } from './controllers/users.controller'
import { UsersService } from './services/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UserQueryService } from './services/user-query.service'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UserQueryService],
  exports: [UsersService]
})
export class UsersModule {}
