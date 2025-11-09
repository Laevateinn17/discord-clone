import { Module } from '@nestjs/common';
import { SubscriptionsService } from "./subscriptions.service";
import { RedisModule } from "src/redis/redis.module";

@Module({
    providers: [SubscriptionsService],
    exports: [SubscriptionsService],
    imports: [RedisModule]
})
export class SubscriptionsModule { }
