import { Module } from '@nestjs/common';
import { RelationshipsController } from "./relationships.controller";
import { WsModule } from "src/ws/ws.module";

@Module({
    imports: [WsModule],
    controllers: [RelationshipsController]
})
export class RelationshipsModule {}
