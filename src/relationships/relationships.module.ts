import { Module } from '@nestjs/common';
import { RelationshipsService } from './relationships.service';
import { RelationshipsController } from './relationships.controller';
import { UsersModule } from "src/users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Relationship } from "./entities/relationship.entity";

@Module({
  controllers: [RelationshipsController],
  providers: [RelationshipsService],
  imports: [UsersModule, TypeOrmModule.forFeature([Relationship])]
})
export class RelationshipsModule {}
