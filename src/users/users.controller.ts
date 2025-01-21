import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ValidationPipe, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { Result } from 'src/interfaces/result.interface';
import { UserResponseDTO } from './dto/user-response.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async create(@Body(new ValidationPipe({transform: true})) userData: CreateUserDTO, @Res() res: Response) {
    const result = await this.usersService.create(userData);
    const {status} = result

    return res.status(status).json(result)
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
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
