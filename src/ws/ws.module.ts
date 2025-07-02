import { Module } from '@nestjs/common';
import { WsGateway } from "./ws.gateway";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { WsController } from './ws.controller';
import { HttpModule } from "@nestjs/axios";

@Module({
    providers: [WsGateway],
    controllers: [WsController],
    exports: [WsGateway],
})
export class WsModule {
 }
