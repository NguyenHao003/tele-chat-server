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
import { QueryUserDto } from '../entities/query-user.dto'
import { UserQueryService } from './user-query.service'
import {
  Metadata,
  PaginationResponse
} from 'src/common/responses/api.pagination'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userQueryService: UserQueryService
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
      hashPassword
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
      updateData.hashPassword = await bcrypt.hash(newPassword, salt)
    }

    const updatedUser = this.userRepository.merge(user, updateData)

    return await this.userRepository.save(updatedUser)
  }

  async updateStatus(id: string, isOnline: boolean) {
    return await this.userRepository.update(id, { isOnline })
  }

  async findAll(query: QueryUserDto) {
    const { page, pageSize } = query
    const queryList = this.userQueryService.createQueryList(query)
    const [items, totalItems] = await queryList.getManyAndCount()

    return new PaginationResponse({
      items,
      metadata: {
        page,
        pageSize,
        totalItems
      }
    })
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

  async updateOnlineStatus(id: string, isOnline: boolean) {
    await this.userRepository.update(id, { isOnline })
  }
}
