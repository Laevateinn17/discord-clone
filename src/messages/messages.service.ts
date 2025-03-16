import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Result } from "src/interfaces/result.interface";
import { MessageResponseDTO } from "./dto/message-response.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "./entities/message.entity";
import { mapper } from "src/mappings/mappers";
import { createMap } from "@automapper/core";
import { StorageService } from "src/storage/storage.service";
import { Attachment } from "./entities/attachment.entity";
import { AttachmentResponseDTO } from "./dto/attachment-response.dto";
import { MessageMention } from "./entities/message-mention.entity";
import { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class MessagesService {

  constructor(
    @InjectRepository(Message) private readonly messagesRepository: Repository<Message>,
    @InjectRepository(Attachment) private readonly attachmentsRepository: Repository<Attachment>,
    @InjectRepository(MessageMention) private readonly messageMentionsRepository: Repository<MessageMention>,
    private readonly storageService: StorageService,
    private readonly channelsService: HttpService,
  ) { }

  async create(dto: CreateMessageDto): Promise<Result<MessageResponseDTO>> {
    if (!dto.channelId || dto.channelId.length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: 'Invalid channel id'
      };
    }

    if (!dto.content || (dto.content.trim().length === 0 && dto.attachments.length === 0)) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: 'Content cannot be empty'
      };
    }

    const channelResponse = await this.getChannelDetail(dto.senderId, dto.channelId);

    if (channelResponse.status !== HttpStatus.OK) {
      return channelResponse;
    }
    const message = mapper.map(dto, CreateMessageDto, Message);
    try {
      await this.messagesRepository.save(message);
      if (dto.mentions) {
        const mentions: MessageMention[] = dto.mentions.map(m => ({ message: message, userId: m } as MessageMention));

        await this.messageMentionsRepository.save(mentions);
        message.mentions = mentions;
      }
    } catch (error) {
      console.error(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        message: 'An unknown error occurred when saving message'
      };
    }



    const attachments: Attachment[] = [];

    if (dto.attachments) {
      try {
        const promises = dto.attachments.map(async (att) => {
          const response = await this.storageService.uploadFile(`attachments/${message.id}`, att);
          if (response.status !== HttpStatus.OK) throw Error();
          attachments.push({ id: undefined, url: response.data, message: message, type: att.mimetype });
        })

        await Promise.all(promises);
        await this.attachmentsRepository.save(attachments);
        message.attachments = attachments;
      } catch (error) {
        await this.messagesRepository.delete(message);

        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: null,
          message: 'Error uploading file'
        };
      }
    }

    const data = mapper.map(message, Message, MessageResponseDTO);
    if (dto.attachments) data.attachments = message.attachments.map(att => mapper.map(att, Attachment, AttachmentResponseDTO));
    if (dto.mentions) data.mentions = message.mentions.map(m => m.userId);

    return {
      status: HttpStatus.CREATED,
      data: data,
      message: 'Message saved successfully'
    }
  }

  findAll() {
    return `This action returns all messages`;
  }

  async getChannelMessages(userId: string, channelId: string): Promise<Result<MessageResponseDTO[]>> {
    if (!channelId || channelId.length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: 'Invalid channel id'
      };
    }

    const channelResponse = await this.getChannelDetail(userId, channelId);

    if (channelResponse.status !== HttpStatus.OK) {
      return channelResponse;
    }

    const messages = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.attachments', 'attachment')
      .leftJoinAndSelect('message.mentions', 'mention')
      .where('message.channelId = :channelId', {channelId: channelId})
      .getMany()

    const data: MessageResponseDTO[] = messages.map(m => {
      const message = mapper.map(m, Message, MessageResponseDTO);
      message.attachments = m.attachments.map(at => mapper.map(at, Attachment, AttachmentResponseDTO));
      message.mentions = m.mentions.map(mm => mm.userId);

      return message;
    })

    return {
      status: HttpStatus.OK,
      data: data,
      message: 'Messages retrieved successfully'
    };
  }

  private async getChannelDetail(userId: string, channelId: string): Promise<Result<any>> {
    let recipientResponse: AxiosResponse<any, any>;
    try {
      const url = `http://${process.env.GUILD_SERVICE_HOST}:${process.env.GUILD_SERVICE_PORT}/channels/${channelId}`;
      recipientResponse = (await firstValueFrom(this.channelsService.get(url, { headers: { 'X-User-Id': userId } }))).data;
      if (recipientResponse.status !== HttpStatus.OK) {
        return {
          status: HttpStatus.BAD_REQUEST,
          data: null,
          message: "Failed retrieving channel data"
        };
      }
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        data: null,
        message: "Failed retrieving channel data"
      };
    }

    return {
      status: HttpStatus.OK,
      data: recipientResponse.data,
      message: 'Channel retrieved successfully'
    };
  }
  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }

  onModuleInit() {
    createMap(mapper, CreateMessageDto, Message);
    createMap(mapper, Message, MessageResponseDTO);
    createMap(mapper, Attachment, AttachmentResponseDTO);
  }
}
