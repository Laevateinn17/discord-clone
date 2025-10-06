import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { GuildChannelsController, DMChannelsController, ChannelsController } from './channels.controller';
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./entities/channel.entity";
import { ChannelRecipient } from "./entities/channel-recipient.entity";
import { UserChannelState } from "./entities/user-channel-state.entity";
import { RedisModule } from "src/redis/redis.module";
import { Guild } from "src/guilds/entities/guild.entity";
import { GrpcClientModule } from "src/grpc-client/grpc-client.module";
import { InvitesModule } from "src/invites/invites.module";

@Module({
  controllers: [GuildChannelsController, DMChannelsController, ChannelsController],
  providers: [ChannelsService],
  imports: [HttpModule, RedisModule, TypeOrmModule.forFeature([Channel, ChannelRecipient, UserChannelState, Guild]), GrpcClientModule, InvitesModule],
  exports: [ChannelsService]
})
export class ChannelsModule {}
