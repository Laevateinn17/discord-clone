import { Module } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { RedisModule } from "src/redis/redis.module";

@Module({
  providers: [ConnectionsService],
  exports: [ConnectionsService],
  imports: [RedisModule]
})
export class ConnectionsModule {}
