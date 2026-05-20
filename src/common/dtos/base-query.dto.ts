import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min
} from 'class-validator'
import { OrderDirection } from '../enums/common.enum'

export abstract class BaseQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  keyword?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 20

  get skip(): number {
    return (this.page - 1) * this.pageSize
  }

  get limit(): number {
    return this.pageSize
  }
  @IsOptional()
  @IsString()
  sortField: string = 'createdAt'

  @IsOptional()
  @IsString()
  @IsEnum(OrderDirection)
  sortOrder: OrderDirection = OrderDirection.ASC

  @IsOptional()
  @IsDate()
  @Transform(({ value }: { value: string | undefined }) =>
    value ? new Date(value) : undefined
  )
  createdAt?: Date

  @IsOptional()
  @IsDate()
  @Transform(({ value }: { value: string | undefined }) =>
    value ? new Date(value) : undefined
  )
  updatedAt?: Date
}
