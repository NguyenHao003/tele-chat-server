import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Socket } from 'socket.io'
import { UsersService } from 'src/modules/users/services/users.service'

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient()

    const token =
      client.handshake.auth.token || (client.handshake.query?.token as string)

    if (!token) {
      console.log('WS: No token')
      throw new UnauthorizedException('Unauthorized (No token)')
    }

    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET')
    })

    const user = await this.userService.findByEmail(payload.email)

    if (!user) {
      console.log('WS: User not found')
      throw new UnauthorizedException('Unauthorized (User not found)')
    }

    client.data.user = user

    return true
  }
}
