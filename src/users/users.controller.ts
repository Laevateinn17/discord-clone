import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Headers, ValidationPipe, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from "express";
import { UpdateStatusDTO } from "./dto/update-status.dto";
import { UserProfilesService } from "src/user-profiles/user-profiles.service";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";
import { UserProfileResponseDTO } from "src/user-profiles/dto/user-profile-response.dto";
import { Result } from "src/interfaces/result.interface";

@Controller('users')
export class UsersController {
  private userProfilesMQ: ClientProxy
  constructor(
    private readonly usersService: UsersService,
  ) {
    this.userProfilesMQ = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${process.env.RMQ_HOST}:${process.env.RMQ_PORT}`],
        queue: 'user-queue',
        queueOptions: { durable: true }
      }
    });
  }

  @Get("current")
  async getCurrentUser(@Headers('X-User-Id') id: string, @Res() res: Response) {
    const result = await this.usersService.getById(id);
    const { status } = result;

    return res.status(status).json(result);
  }

  @Post("update-status")
  async updateStatus(@Headers('X-User-Id') id: string, @Body(new ValidationPipe({ transform: true })) updateStatusDTO: UpdateStatusDTO, @Res() res: Response) {
    updateStatusDTO.id = id;
    this.userProfilesMQ.emit('update-status', updateStatusDTO);
    // const result = await this.userProfilesService.updateStatus(id, updateStatusDTO);
    // const { status } = result;

    return res.status(HttpStatus.ACCEPTED).send();
  }

  @Get('username/:username')
  async getByUsername(@Headers('X-User-Id') id: string, @Res() res: Response, @Param('username') username: string) {
    const result = await this.usersService.getProfileByUsername(username);
    const { status } = result;

    return res.status(status).json(result);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
