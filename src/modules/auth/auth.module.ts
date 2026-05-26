import { Module } from '@nestjs/common'
import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'
import { UsersModule } from '../users/users.module'
import { JwtModule, JwtSignOptions } from '@nestjs/jwt'
import { JwtStrategy } from './stragtegies/jwt.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { WsJwtGuard } from './guards/ws-jwt.guard'

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ??
            '7d') as JwtSignOptions['expiresIn']
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, WsJwtGuard],
  exports: [JwtModule, WsJwtGuard]
})
export class AuthModule {}
