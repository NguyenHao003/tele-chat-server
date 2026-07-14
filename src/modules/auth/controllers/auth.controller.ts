import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from '../services/auth.service'
import { LoginDto } from '../dto/login.dto'
import { ApiResponse } from 'src/common/responses/api.response'
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto'

import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @ApiOkResponse({ description: 'Đăng nhập thành công và trả về Access Token' })
  async login(@Body() loginDto: LoginDto) {
    const accessToken = await this.authService.login(loginDto)

    return new ApiResponse({ accessToken }, 'Login successfully')
  }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản người dùng mới' })
  @ApiCreatedResponse({ description: 'Đăng ký tài khoản thành công và trả về thông tin user' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto)

    return new ApiResponse(user, 'Register successfully')
  }
}
