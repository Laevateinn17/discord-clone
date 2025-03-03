import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { MessagePattern } from '@nestjs/microservices';
import { UpdateStatusDTO } from "src/users/dto/update-status.dto";

@Controller('user-profiles')
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @MessagePattern('user-created')
  async create(@Body(new ValidationPipe({transform: true})) createUserProfileDto: CreateUserProfileDto) {
    return this.userProfilesService.create(createUserProfileDto);
  }

  @MessagePattern('update-status')
  async updateStatus(@Body(new ValidationPipe({ transform: true })) updateStatusDTO: UpdateStatusDTO) {
    return this.userProfilesService.updateStatus(updateStatusDTO)
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.userProfilesService.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserProfileDto: UpdateUserProfileDto) {
    return this.userProfilesService.update(+id, updateUserProfileDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userProfilesService.remove(+id);
  // }
}
