import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { Not, Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from '../dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email, username } = createUserDto

    const user = await this.userRepository.findOne({
      where: { email }
    })

    if (user) {
      throw new BadRequestException('User already exists')
    }

    const salt = await bcrypt.genSalt()
    const hashPassword = await bcrypt.hash(password, salt)

    const newUser = this.userRepository.create({
      email,
      username,
      hash_password: hashPassword
    })

    return await this.userRepository.save(newUser)
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { username, email, avatar, newPassword } = updateUserDto

    const user = await this.findById(id)

    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: {
          email,
          id: Not(id)
        }
      })

      if (existingUser) {
        throw new BadRequestException('Email already exists')
      }
    }

    const updateData: Partial<User> = {}

    if (username !== undefined) {
      updateData.username = username
    }

    if (email !== undefined) {
      updateData.email = email
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt()
      updateData.hash_password = await bcrypt.hash(newPassword, salt)
    }

    const updatedUser = this.userRepository.merge(user, updateData)

    return await this.userRepository.save(updatedUser)
  }

  async findAll() {
    return await this.userRepository.find()
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }
}
