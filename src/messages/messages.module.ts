import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ChannelMessageController, MessagesController } from './messages.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./entities/message.entity";
import { StorageModule } from "src/storage/storage.module";
import { Attachment } from "./entities/attachment.entity";
import { MessageMention } from "./entities/message-mention.entity";
import { HttpModule } from "@nestjs/axios";

@Module({
  controllers: [MessagesController, ChannelMessageController],
  providers: [MessagesService],
  imports: [TypeOrmModule.forFeature([Message, Attachment, MessageMention]), StorageModule, HttpModule]
})
export class MessagesModule {}
