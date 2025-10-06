import { forwardRef, Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Invite } from "./entities/invite.entity";
import { GuildsModule } from "src/guilds/guilds.module";

@Module({
  controllers: [InvitesController],
  providers: [InvitesService],
  imports: [TypeOrmModule.forFeature([Invite]), forwardRef(() => GuildsModule)],
  exports: [InvitesService]
})
export class InvitesModule {}

