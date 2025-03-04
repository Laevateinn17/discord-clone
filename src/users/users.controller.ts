import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Headers, ValidationPipe, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from "express";
import { UpdateStatusDTO } from "./dto/update-status.dto";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";
import { StorageService } from "src/storage/storage.service";

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
