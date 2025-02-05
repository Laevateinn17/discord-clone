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

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>
  ) {}

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

  findAll() {
    return `This action returns all userProfiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userProfile`;
  }

  update(id: number, updateUserProfileDto: UpdateUserProfileDto) {
    return `This action updates a #${id} userProfile`;
  }

  onModuleInit() {
    createMap(mapper, CreateUserProfileDto, UserProfile);
    createMap(mapper, UserProfileResponseDTO, UserProfile);
  }

}
