import { Injectable } from '@nestjs/common';
import { RedisService } from "src/redis/redis.service";
import { SubscribeEventDTO } from "./dto/subscribe-event.dto";

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly redisService: RedisService
    ) {}

    async subscribeEvent(event: string, targetId: string, socketId: string) {
        const client = await this.redisService.getClient();
        const key = this.getEventSubscriberKey(event, targetId);

        await client.sAdd(key, socketId);
    }

    async getEventSubscribers(event: string, targetId: string) {
        const client = await this.redisService.getClient();
        const key = this.getEventSubscriberKey(event, targetId);

        return await client.sMembers(key);
    }

    async unsubscribeEvent() {

    }

    private getEventSubscriberKey(event: string, targetId: string) {
        return `event_subscriber:${event}:${targetId}`;
    }
}
