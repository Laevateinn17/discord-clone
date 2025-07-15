import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateChannelDTO } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CreateDMChannelDTO } from "./dto/create-dm-channel.dto";
import { Result } from "src/interfaces/result.interface";
import { ChannelResponseDTO } from "./dto/channel-response.dto";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";
import { Not, Repository } from "typeorm";
import { Channel } from "./entities/channel.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelRecipient } from "./entities/channel-recipient.entity";
import { mapper } from "src/mappings/mappers";
import { createMap } from "@automapper/core";
import { ChannelType } from "./enums/channel-type.enum";
import { response } from "express";
import { UserProfileResponseDTO } from "src/user-profiles/dto/user-profile-response.dto";
import { UserProfile } from "aws-sdk/clients/opsworks";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";
import { GATEWAY_QUEUE, USER_TYPING_EVENT } from "src/constants/events";
import { Payload } from "src/interfaces/payload.dto";
import { UserTypingDTO } from "src/interfaces/user-typing.dto";

@Injectable()
export class ChannelsService {
  private gatewayMQ: ClientProxy;

  constructor(
    private readonly usersService: HttpService,
    @InjectRepository(Channel) private readonly channelsRepository: Repository<Channel>,
    @InjectRepository(ChannelRecipient) private readonly channelRecipientRepository: Repository<ChannelRecipient>,
  ) {
    this.gatewayMQ = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${process.env.RMQ_HOST}:${process.env.RMQ_PORT}`],
        queue: GATEWAY_QUEUE,
        queueOptions: { durable: true }
      }
    });
  }

  async create(dto: CreateChannelDTO): Promise<Result<ChannelResponseDTO>> {
    if (!dto.guildId || dto.guildId.length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: 'Invalid guild id'
      };
    }

    const channel = mapper.map(dto, CreateChannelDTO, Channel);
    channel
    try {
      await this.channelsRepository.save(channel);
    } catch (error) {
      console.error(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        message: 'An unknown error occurred when creating channel'
      };
    }

    return {
      status: HttpStatus.CREATED,
      data: mapper.map(channel, Channel, ChannelResponseDTO),
      message: 'Channel created successfully'
    };
  }

  async createDMChannel(userId: string, dto: CreateDMChannelDTO): Promise<Result<ChannelResponseDTO>> {
    if (!dto.recipientId || dto.recipientId.length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: "Recipient is empty"
      };
    }

    let existingChannel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.recipients', 'channel_recipient')
      .where('channel_recipient.user_id IN (:...recipients) AND channel.type = :channelType', { recipients: [userId, dto.recipientId], channelType: ChannelType.DM })
      .having('COUNT(DISTINCT channel_recipient.user_id) = 2')
      .groupBy('channel.id')
      .select('channel.id').getOne();

    if (existingChannel) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: "Channel already exists"
      }
    }


    let recipientResponse: Result<any>;

    try {
      const url = `http://${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_PORT}/user-profiles/${dto.recipientId}`;
      recipientResponse = (await firstValueFrom(this.usersService.get(url))).data;
      if (recipientResponse.status !== HttpStatus.OK) {
        return {
          status: HttpStatus.BAD_REQUEST,
          data: null,
          message: "Failed retrieving recipient data"
        };
      }
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: "Failed retrieving recipient data"
      };
    }

    const channel = mapper.map(dto, CreateDMChannelDTO, Channel);
    channel.type = ChannelType.DM;

    try {
      await this.channelsRepository.save(channel);
      const recipients: ChannelRecipient[] = [{ channelId: channel.id, userId: userId }, { channelId: channel.id, userId: dto.recipientId }];
      await this.channelRecipientRepository.save(recipients);

      channel.recipients = recipients;
    } catch (error) {
      console.error(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        message: "Failed saving channel data"
      };
    }

    const responseDTO = mapper.map(channel, Channel, ChannelResponseDTO);
    responseDTO.recipients = [recipientResponse.data];

    return {
      status: HttpStatus.CREATED,
      data: responseDTO,
      message: ""
    };

  }

  async getDMChannels(userId: string): Promise<Result<ChannelResponseDTO[]>> {
    let channels: Channel[] = [];

    try {
      channels = await this.channelsRepository
        .createQueryBuilder('channel')
        .innerJoin('channel.recipients', 'channel_recipient')
        .where('channel_recipient.user_id = :userId AND channel.type = :channelType', { userId: userId, channelType: ChannelType.DM })
        .select('channel').getMany();
    } catch (error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        message: "Failed retrieving DMs"
      };
    }

    const dto: ChannelResponseDTO[] = channels.map(channel => mapper.map(channel, Channel, ChannelResponseDTO));

    for (const channel of dto) {
      const recipients = await this.channelRecipientRepository.findBy({ channelId: channel.id });
      channel.recipients = await Promise.all(recipients.map(async r => {
        const response = await this.getRecipientDetail(r.userId);
        if (response.status !== HttpStatus.OK) {
          return undefined;
        }
        return response.data!;
      }));
    }

    return {
      status: HttpStatus.OK,
      data: dto,
      message: 'DM Channels retrieved successfully'
    };
  }

  async getGuildChannels(guildId: string): Promise<Result<ChannelResponseDTO[]>> {
    if (!guildId || guildId.length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: 'Invalid guild id'
      };
    }

    const channels = await this.channelsRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.parent', 'channel')
      .where('channel.guildId = :guildId', { guildId: guildId })
      .getMany();

    const data = channels.map(ch => mapper.map(ch, Channel, ChannelResponseDTO));

    return {
      status: HttpStatus.OK,
      data: data,
      message: 'Channels retrieved successfully'
    };
  }

  async getChannelDetail(userId: string, channelId: string): Promise<Result<ChannelResponseDTO>> {
    if (!channelId || channelId.length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: 'Invalid channel id'
      };
    }

    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.recipients', 'recipients')
      .where('channel.id = :channelId', { channelId: channelId })
      .getOne();

    if (!channel) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: 'Channel not found'
      };
    }

    if (!channel.recipients.find(r => r.userId === userId)) {
      return {
        status: HttpStatus.FORBIDDEN,
        data: null,
        message: 'User is not part of this channel'
      };
    }

    const data = mapper.map(channel, Channel, ChannelResponseDTO);
    data.recipients = await Promise.all(channel.recipients.map(async r => (await this.getRecipientDetail(r.userId)).data));

    return {
      status: HttpStatus.OK,
      data: data,
      message: 'Channel retrieved successfully'
    };
  }

  private async getRecipientDetail(userId: string): Promise<Result<UserProfileResponseDTO>> {
    let recipientResponse: AxiosResponse<UserProfileResponseDTO, any>;
    try {
      const url = `http://${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_PORT}/user-profiles/${userId}`;
      recipientResponse = (await firstValueFrom(this.usersService.get(url))).data;
      if (recipientResponse.status !== HttpStatus.OK) {
        return {
          status: HttpStatus.BAD_REQUEST,
          data: null,
          message: 'Failed retrieving recipient data'
        };
      }
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: 'Failed retrieving recipient data'
      };
    }

    return {
      status: HttpStatus.OK,
      data: recipientResponse.data,
      message: 'Recipient data retrieved successfully'
    }
  }

  async broadcastUserTyping(userId: string, channelId: string): Promise<Result<null>> {
    const recipients = await this.channelRecipientRepository.findBy({ channelId: channelId });
    const dto: UserTypingDTO = {
      userId: userId,
      channelId: channelId
    };

    try {
      this.gatewayMQ.emit(USER_TYPING_EVENT, { recipients: recipients.filter(r => r.userId != userId).map(r => r.userId), data: dto } as Payload<UserTypingDTO>)
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        message: 'An error occurred while broadcasting typing status'
      };
    }

    return {
      status: HttpStatus.NO_CONTENT,
      data: null,
      message: ''
    };
  }

  onModuleInit() {
    createMap(mapper, CreateDMChannelDTO, Channel);
    createMap(mapper, CreateChannelDTO, Channel);
    createMap(mapper, Channel, ChannelResponseDTO);
  }
}
