// import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { UserIdentity } from '../auth/entities/user-identity.entity';
// import { Repository } from 'typeorm';
// import { CreateUserDTO } from './dto/create-user.dto';
// import { Result } from 'src/interfaces/result.interface';
// import { UserResponseDTO } from './dto/user-response.dto';
// import { UserProfile } from 'src/user-profiles/entities/user-profile.entity';
// import * as bcrypt from 'bcrypt';
// import { mapper } from 'src/mappings/mappers';
// import { createMap } from '@automapper/core';
// import { UserProfileResponseDTO } from 'src/user-profiles/dto/user-profile-response.dto';
// import { UpdateUsernameDTO } from './dto/update-username.dto';
// import { UpdatePasswordDTO } from './dto/upate-password.dto';
// import { LoginDTO } from './dto/login.dto';

// @Injectable()
// export class UsersService implements OnModuleInit {
//   constructor(@InjectRepository(UserIdentity) private userRepository: Repository<UserIdentity>) { }

//   async create(userData: CreateUserDTO): Promise<Result<UserResponseDTO>> {
//     const basicValidationMessage = userData.validate();
//     if (basicValidationMessage) {
//       return {
//         status: HttpStatus.BAD_REQUEST,
//         message: basicValidationMessage,
//         data: null
//       };
//     }

//     let searchedUser = await this.userRepository.findOneBy({ email: userData.email });

//     if (searchedUser) {
//       return {
//         status: HttpStatus.BAD_REQUEST,
//         message: 'This email is already registered',
//         data: null
//       };
//     }

//     searchedUser = await this.userRepository.findOneBy({ username: userData.username });

//     if (searchedUser) {
//       return {
//         status: HttpStatus.BAD_REQUEST,
//         message: 'This username is already used',
//         data: null
//       };
//     }

//     const user: UserIdentity = mapper.map(userData, CreateUserDTO, UserIdentity);
//     user.profile = mapper.map(userData, CreateUserDTO, UserProfile);

//     const salt = await bcrypt.genSalt();

//     user.password = await bcrypt.hash(user.password, salt);

//     await this.userRepository.save(user);
//     delete user.password;
//     return {
//       status: HttpStatus.CREATED,
//       data: mapper.map(user, UserIdentity, UserResponseDTO),
//       message: 'Account created successfully',
//     };
//   }

//   async login(loginDTO: LoginDTO): Promise<Result<UserResponseDTO>> {
//     const validateResult = loginDTO.validate();

//     if (validateResult) {
//       return {
//         status: HttpStatus.BAD_REQUEST,
//         message: validateResult,
//         data: null
//       };
//     }

//     const user = await this.userRepository.findOne({where: [{email: loginDTO.identifier}, {username: loginDTO.identifier}]});

//     if (!user) {
//       return {
//         status: HttpStatus.BAD_REQUEST,
//         message: 'User not found',
//         data: null
//       };
//     }

//     if (!await bcrypt.compare(loginDTO.password, user.password)) {
//       return {
//         status: HttpStatus.UNAUTHORIZED,
//         message: 'Wrong password',
//         data: null
//       };
//     }

//     return {
//       status: HttpStatus.OK,
//       message: 'User logged in successfully',
//       data: mapper.map(user, UserIdentity, UserResponseDTO)
//     };
//   }

//   async findOne(id: string): Promise<Result<UserResponseDTO>> {
//     const user = await this.userRepository.findOne({ where: { id }, relations: { profile: true } });

//     if (!user) {
//       return {
//         status: HttpStatus.NOT_FOUND,
//         message: 'User not found',
//         data: null
//       };
//     }

//     return {
//       status: HttpStatus.OK,
//       message: 'User retrieved successfully',
//       data: mapper.map(user, UserIdentity, UserResponseDTO)
//     };
//   }

//   async updateUsername(id: string, dto: UpdateUsernameDTO): Promise<Result<any>> {
//     const validateResult = dto.validate();
//     if (validateResult) {
//       return {
//         status: HttpStatus.BAD_REQUEST,
//         message: validateResult,
//         data: null
//       };
//     }

//     await this.userRepository.update(id, {username: dto.username});
    
//     return {
//       status: HttpStatus.OK,
//       message: 'Username updated successfully',
//       data: null
//     };
//   }

//   async updatePassword(id: string, dto: UpdatePasswordDTO): Promise<Result<any>> {
//     const validateResult = dto.validate();

//     if (validateResult) {
//       return {
//         status: HttpStatus.BAD_REQUEST,
//         message: validateResult,
//         data: null
//       };
//     }

//     const user = await this.userRepository.findOne({where: {id}});

//     if (!await bcrypt.compare(dto.oldPassword, user.password)) {
//       return {
//         status: HttpStatus.BAD_REQUEST,
//         message: 'Old password does not match',
//         data: null
//       };
//     }

//     const salt = await bcrypt.genSalt();
//     user.password = await bcrypt.hash(dto.newPassword, salt);

//     await this.userRepository.save(user);

//     return {
//       status: HttpStatus.OK,
//       message: 'Password updated successfully',
//       data: null  
//     }
//   }

//   remove(id: number) {
//     return `This action removes a #${id} user`;
//   }

//   onModuleInit() {
//     createMap(mapper, CreateUserDTO, UserIdentity)
//     createMap(mapper, CreateUserDTO, UserProfile)
//     createMap(mapper, UserIdentity, UserResponseDTO)
//     createMap(mapper, UserProfile, UserProfileResponseDTO)
//   }

// }
