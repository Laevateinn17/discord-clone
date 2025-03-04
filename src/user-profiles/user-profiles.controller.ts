import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Req, Res, Headers } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { MessagePattern } from '@nestjs/microservices';
import { UpdateStatusDTO } from "src/users/dto/update-status.dto";
import { UpdateUsernameDTO } from "src/users/dto/update-username.dto";
import { Response } from "express";

@Controller('user-profiles')
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) { }

  @Post()
  async create(@Req() request: Request, @Body(new ValidationPipe({ transform: true })) createUserProfileDto: CreateUserProfileDto, @Res() res: Response) {
    const result = await this.userProfilesService.create(createUserProfileDto);
    const {status} = result;

    return res.status(status).json(result);
  }

  @Patch('username')
  async updateUsername(@Headers('X-User-Id') id: string, @Req() request: Request, @Body(new ValidationPipe({ transform: true })) dto: UpdateUsernameDTO, @Res() res: Response) {
    const result = await this.userProfilesService.updateUsername(id, dto);
    const { status } = result;

    return res.status(status).json(result);
  }

  @Get('username/:username')
  async getByUsername(@Headers('X-User-Id') id: string, @Res() res: Response, @Param('username') username: string) {
    const result = await this.userProfilesService.getProfileByUsername(username);
    const { status } = result;

    return res.status(status).json(result);
  }


  @MessagePattern('update-status')
  async updateStatus(@Body(new ValidationPipe({ transform: true })) updateStatusDTO: UpdateStatusDTO) {
    return this.userProfilesService.updateStatus(updateStatusDTO)
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.userProfilesService.getById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.userProfilesService.remove(+id);
  }
}
