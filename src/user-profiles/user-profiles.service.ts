import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfile } from './entities/user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from 'src/interfaces/result.interface';
import { mapper } from 'src/mappings/mappers';
import { createMap } from '@automapper/core';
import { UserProfileResponseDTO } from './dto/user-profile-response.dto';
import { UserStatus } from "./enums/user-status.enum";
import { UpdateStatusDTO } from "src/users/dto/update-status.dto";

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>
  ) { }

  async create(dto: CreateUserProfileDto): Promise<Result<CreateUserProfileDto>> {
    const validationMessage = dto.validate();
    if (validationMessage) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: validationMessage,
        data: null,
      };
    }

    let userProfile = mapper.map(dto, CreateUserProfileDto, UserProfile);
    await this.userProfileRepository.save(userProfile)
    console.log(`User profile ${userProfile.displayName} is saved`);
  }

  async getById(id: string): Promise<Result<UserProfileResponseDTO>> {
    if (!id || id.length == 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: "Invalid request",
      };
    }

    try {
      const userProfile: UserProfile = await this.userProfileRepository.findOne({ where: { id: id } });

      if (!userProfile) {
        return {
          status: HttpStatus.BAD_REQUEST,
          data: null,
          message: "User not found",
        };
      }

      return {
        status: HttpStatus.OK,
        data: mapper.map(userProfile, UserProfile, UserProfileResponseDTO),
        message: "User profile retrieved successfully"
      };

    } catch (error) {
      console.log(error)
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: "An unknown error occurred",
      };
    }
  }

  async updateStatus(dto: UpdateStatusDTO): Promise<Result<null>> {
    const userResponse = await this.getById(dto.id);

    if (userResponse.status != HttpStatus.OK) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: userResponse.message,
        data: null
      };
    }

    try {
      const userProfile = mapper.map(userResponse.data, UserProfileResponseDTO, UserProfile);
      userProfile.status = dto.status;
      await this.userProfileRepository.save(userProfile);

      return {
        status: HttpStatus.OK,
        message: "Status updated successfully",
        data: null
      };
    } catch (error) {
      console.log(error)
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: "An error occurred when updating user status",
      };
    }

  }

  findOne(id: number) {
    return `This action returns a #${id} userProfile`;
  }

  update(id: number, updateUserProfileDto: UpdateUserProfileDto) {
    return `This action updates a #${id} userProfile`;
  }

  onModuleInit() {
    createMap(mapper, CreateUserProfileDto, UserProfile);
    createMap(mapper, UserProfile, UserProfileResponseDTO);
    createMap(mapper, UserProfileResponseDTO, UserProfile);
  }

}
