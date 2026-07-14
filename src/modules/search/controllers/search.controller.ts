import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { SearchService } from '../services/search.service'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { User } from 'src/modules/users/entities/user.entity'
import { BaseQueryDto } from 'src/common/dtos/base-query.dto'
import { ApiResponse } from 'src/common/responses/api.response'

import { ApiTags } from '@nestjs/swagger'

@ApiTags('Search')
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('conversations')
  async searchConversations(
    @CurrentUser() user: User,
    @Query() query: BaseQueryDto
  ) {
    const result = await this.searchService.searchConversations(user.id, query)
    return new ApiResponse(result, 'success')
  }
}
