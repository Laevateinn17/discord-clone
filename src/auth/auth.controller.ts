import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto/register-user.dto';
import { Request, Response } from 'express';
import { LoginDTO } from './dto/login.dto';
import { UpdateUsernameDTO } from './dto/update-username.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('register')
  async register(@Body(new ValidationPipe({transform: true})) userData: RegisterUserDTO, @Res() res: Response) {
    const result = await this.authService.register(userData);
    const {status} = result

    return res.status(status).json(result)
  }

  @Post('login')
  async login(@Body(new ValidationPipe({transform: true})) loginDTO: LoginDTO, @Res() res: Response) {
    const result = await this.authService.login(loginDTO);
    const {status} = result;

    return res.status(status).json(result);
  }


  @UseGuards(AuthGuard)
  @Patch('update-username')
  async updateUsername(@Req() request: Request, @Body(new ValidationPipe({transform: true})) dto: UpdateUsernameDTO, @Res() res: Response) {
    const id = request['userId'];
    const result = await this.authService.updateUsername(id, dto);
    const {status} = result;

    return res.status(status).json(result);
  }

  @UseGuards(AuthGuard)
  @Patch('update-password')
  async updatePassword(@Req() request: Request, @Body(new ValidationPipe({transform: true})) dto: UpdatePasswordDTO, @Res() res: Response) {
    const id = request['userId'];
    const result = await this.authService.updatePassword(id, dto);
    const {status} = result;

    return res.status(status).json(result);
  }

  @UseGuards(AuthGuard)
  @Get('verify')
  async verifyToken(@Req() request: Request) {
    const id = request['userId'];
    return id;
  }

  @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refreshToken(@Req() request: Request, @Res() res: Response) {
    const id = request['userId'];
    const result = await this.authService.refreshToken(id);
    const {status} = result;

    return res.status(status).json(result);
  }
}
