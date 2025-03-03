import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserProfilesService } from "src/user-profiles/user-profiles.service";
import { UserProfilesModule } from "src/user-profiles/user-profiles.module";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [UserProfilesModule, HttpModule],
  exports: [UsersService]
})
export class UsersModule {}
