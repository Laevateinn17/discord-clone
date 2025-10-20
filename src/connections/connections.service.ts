import { Injectable } from '@nestjs/common';
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class ConnectionsService {
    constructor(
        private readonly redisService: RedisService
    ) { }

    async addConnection(userId: string, socketId: string, gatewayNodeId: string) {
        const redisClient = await this.redisService.getClient();
        await redisClient.sAdd(this.getUserConnectionsKey(userId), socketId);
        await redisClient.set(this.getSocketNodeKey(socketId), gatewayNodeId);
    }

    async removeConnection(userId: string, socketId: string) {
        const redisClient = await this.redisService.getClient();
        await redisClient.sRem(this.getUserConnectionsKey(userId), socketId);
        await redisClient.del(this.getSocketNodeKey(socketId));
    }

    async getUserConnections(userId: string) {
        const redisClient = await this.redisService.getClient();
        const key = this.getUserConnectionsKey(userId);
        return await redisClient.sMembers(key);
    }

    async getConnectionNode(socketId: string): Promise<string> {
        const redisClient = await this.redisService.getClient();
        const key = this.getSocketNodeKey(socketId);

        return await redisClient.get(key) as string;
    }

    private getUserConnectionsKey(userId: string) {
        return `user_sockets:${userId}`;
    }

    private getSocketNodeKey(socketId: string) {
        return `socket_node:${socketId}`
    }

}
