import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { Repository } from 'typeorm'
import { QueryUserDto } from '../entities/query-user.dto'

@Injectable()
export class UserQueryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  createQueryList(query: QueryUserDto) {
    const queryBuilder = this.userRepository.createQueryBuilder('user')

    if (query.keyword) {
      queryBuilder.andWhere('user.username LIKE :keyword', {
        keyword: `%${query.keyword}%`
      })
    }

    const skip = (query.page - 1) * query.pageSize
    queryBuilder.skip(skip).take(query.pageSize)

    return queryBuilder
  }
}
