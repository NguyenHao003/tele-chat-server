import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from '../services/auth.service'
import { LoginDto } from '../dto/login.dto'
import { ApiResponse } from 'src/common/responses/api.response'
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const accessToken = await this.authService.login(loginDto)

    return new ApiResponse({ accessToken }, 'Login successfully')
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto)

    return new ApiResponse({ user }, 'Register successfully')
  }
}
