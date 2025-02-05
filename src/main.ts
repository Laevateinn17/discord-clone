import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      queue: 'user_queue',
      queueOptions: {
        durable: true
      }
    }
  });

  await app.startAllMicroservices();
  await app.listen(process.env.APP_PORT);
}
bootstrap();
