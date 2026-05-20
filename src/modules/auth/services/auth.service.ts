import { Body, Injectable, Post, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/modules/users/services/users.service'
import { LoginDto } from '../dto/login.dto'
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto
    const user = await this.userService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Email not found')
    }

    const isMatch = await bcrypt.compare(password, user.hash_password)

    if (!isMatch) {
      throw new UnauthorizedException('Password not match')
    }

    const payload = {
      sub: user.id,
      email: user.email
    }

    const token = this.jwtService.sign(payload)

    return token
  }

  async register(createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto)
  }
}
