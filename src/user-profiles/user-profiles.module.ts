import { Module } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { StorageService } from "src/storage/storage.service";
import { StorageModule } from "src/storage/storage.module";

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile]), StorageModule],
  controllers: [UserProfilesController],
  providers: [UserProfilesService],
  exports: [UserProfilesService]
})
export class UserProfilesModule {}
