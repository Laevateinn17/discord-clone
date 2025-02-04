// import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ValidationPipe, Res } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDTO } from './dto/create-user.dto';
// import { Result } from 'src/interfaces/result.interface';
// import { UserResponseDTO } from './dto/user-response.dto';
// import { Response } from 'express';
// import { UpdateUsernameDTO } from './dto/update-username.dto';
// import { UpdatePasswordDTO } from './dto/upate-password.dto';
// import { LoginDTO } from './dto/login.dto';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Get() 
//   async getAll() {
//     return 'test'
//   }

//   @Post('create')
//   async create(@Body(new ValidationPipe({transform: true})) userDTO: CreateUserDTO, @Res() res: Response) {
//     const result = await this.usersService.create(userDTO);
//     const {status} = result;

//     return res.status(status).json(result);
//   }

//   @Post('login')
//   async login(@Body(new ValidationPipe({transform: true})) loginDTO: LoginDTO, @Res() res: Response) {
//     const result = await this.usersService.login(loginDTO);
//     const {status} = result;

//     return res.status(status).json(result);
//   }

//   @Get(':id')
//   async findOne(@Param('id') id: string, @Res() res: Response) {
//     const result = await this.usersService.findOne(id);
//     const {status} = result;

//     return res.status(status).json(result);
//   }

//   @Patch(':id/username')
//   async updateUsername(@Param('id') id: string, @Body(new ValidationPipe({transform: true})) dto: UpdateUsernameDTO, @Res() res: Response) {
//     const result = await this.usersService.updateUsername(id, dto);
//     const {status} = result;

//     return res.status(status).json(result);
//   }

//   @Patch(':id/password')
//   async updatePassword(@Param('id') id: string, @Body(new ValidationPipe({transform: true})) dto: UpdatePasswordDTO, @Res() res: Response) {
//     const result = await this.usersService.updatePassword(id, dto);
//     const {status} = result;

//     return res.status(status).json(result);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.usersService.remove(+id);
//   }
// }
