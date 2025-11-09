import { Module } from '@nestjs/common';
import { MessagesController } from "./messages.controller";
import { WsModule } from "src/ws/ws.module";

@Module({
    imports: [WsModule],
    controllers: [MessagesController],
})
export class MessagesModule {}
