export class ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T

  constructor(data: T, message = 'Success', statusCode = 200) {
    this.success = statusCode >= 200 && statusCode < 300
    this.statusCode = statusCode
    this.message = message
    this.data = data
  }
}
