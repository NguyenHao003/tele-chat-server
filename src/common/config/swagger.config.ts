import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Tele Chat API')
    .setDescription('The Tele Chat API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  // Exclude auth routes from global bearer security
  if (document.paths) {
    Object.keys(document.paths).forEach((path) => {
      if (path.startsWith('/api/auth') || path.startsWith('/auth')) {
        const methods = document.paths[path]
        Object.keys(methods).forEach((method) => {
          methods[method].security = []
        })
      }
    })
  }

  SwaggerModule.setup('swagger', app, document)
}
