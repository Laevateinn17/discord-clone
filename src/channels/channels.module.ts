import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { GuildChannelsController, DMChannelsController, ChannelsController } from './channels.controller';
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./entities/channel.entity";
import { ChannelRecipient } from "./entities/channel-recipient.entity";

@Module({
  controllers: [GuildChannelsController, DMChannelsController, ChannelsController],
  providers: [ChannelsService],
  imports: [HttpModule, TypeOrmModule.forFeature([Channel, ChannelRecipient])],
  exports: [ChannelsService]
})
export class ChannelsModule {}
