import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Relationship } from "./entities/relationship.entity";
import { Relation, Repository } from "typeorm";
import { UserProfilesService } from "src/user-profiles/user-profiles.service";
import { Result } from "src/interfaces/result.interface";
import { UsersService } from "src/users/users.service";
import { RelationshipType } from "./enums/relationship-type.enum";
import { stat } from "fs";
import { RelationshipResponseDTO } from "./dto/relationship-response.dto";

@Injectable()
export class RelationshipsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Relationship) private readonly relationshipRepository: Repository<Relationship>,

  ) { }
  async create(senderId: string, dto: CreateRelationshipDto): Promise<Result<null>> {
    const userProfileResponse = await this.usersService.getProfileByUsername(dto.username);

    if (userProfileResponse.status != HttpStatus.OK) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "User does not exist",
        data: null
      };
    }

    const recipient = userProfileResponse.data;

    if (recipient.id === senderId) { // user tries to add himself
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Invalid request",
        data: null
      };
    }
    const relationship: Relationship = new Relationship();
    relationship.user1Id = senderId;
    relationship.user2Id = recipient.id;
    relationship.type = RelationshipType.Pending;

    try {
      await this.relationshipRepository.save(relationship);
    } catch (error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "An unknown error occurred",
        data: null
      };
    }

    return {
      status: HttpStatus.NO_CONTENT,
      message: "Request sent successfully",
      data: null
    };
  }

  async findAll(userId: string): Promise<Result<RelationshipResponseDTO[]>> {
    if (!userId || userId.length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Invalid user id",
        data: null
      };
    }

    const relationships: Relationship[] = await this.relationshipRepository.find({where: [{user1Id: userId}, {user2Id: userId}]});
    const relationshipsDTO: RelationshipResponseDTO[] = relationships.map((relationship) => {
      return {
        id: relationship.id,
        type: relationship.type,
        userId: relationship.user1Id !== userId ? relationship.user1Id : relationship.user2Id,
        createdAt: relationship.createdAt,
        updatedAt: relationship.updatedAt
      };
    })

    return {
      status: HttpStatus.OK,
      message: "Relationships retrieved successfully",
      data: relationshipsDTO
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} relationship`;
  }

  async update(id: string, dto: UpdateRelationshipDto): Promise<Result<null>> {
    if (!id || id.length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Invalid id",
        data: null
      };
    }

    if (!dto) {
      dto = { type: RelationshipType.Friends };
    }

    const relationship: Relationship = await this.relationshipRepository.findOneBy({ id: id });

    if (!relationship) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Invalid id",
        data: null
      };
    }

    if (dto.type === RelationshipType.Blocked) {
      return this.blockUser(relationship);
    }
    else if (dto.type === RelationshipType.Friends) {
      return this.acceptRequest(relationship);
    }
    else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Invalid request",
        data: null
      };
    }
  }

  private async blockUser(relationship: Relationship): Promise<Result<null>> {
    if (relationship.type !== RelationshipType.Friends) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Cannot block this user",
        data: null
      }
    }

    relationship.type = RelationshipType.Blocked;
    await this.relationshipRepository.save(relationship);

    return {
      status: HttpStatus.NO_CONTENT,
      message: "User blocked successfully",
      data: null
    };
  }

  private async acceptRequest(relationship: Relationship): Promise<Result<null>> {
    if (relationship.type !== RelationshipType.Pending && relationship.type !== RelationshipType.Blocked) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Cannot befriend this user",
        data: null
      }
    }

    relationship.type = RelationshipType.Friends;
    await this.relationshipRepository.save(relationship);

    return {
      status: HttpStatus.NO_CONTENT,
      message: "Friend request accepted successfully",
      data: null
    };
  }


  remove(id: number) {
    return `This action removes a #${id} relationship`;
  }
}
