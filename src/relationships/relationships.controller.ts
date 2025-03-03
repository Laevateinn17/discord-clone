import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Res, ValidationPipe, Put } from '@nestjs/common';
import { RelationshipsService } from './relationships.service';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';
import { Response } from "express";

@Controller('relationships')
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) { }

  @Post()
  async create(@Headers('X-User-Id') senderId: string, @Body(new ValidationPipe({ transform: true })) createDTO: CreateRelationshipDto, @Res() res: Response) {
    const result = await this.relationshipsService.create(senderId, createDTO);
    const { status } = result;

    return res.status(status).json(result);
  }

  @Get()
  async findAll(@Headers('X-User-Id') userId: string, @Res() res: Response) {
    const result = await this.relationshipsService.findAll(userId);
    const { status } = result;

    return res.status(status).json(result);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.relationshipsService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(new ValidationPipe({ transform: true })) updateRelationshipDto: UpdateRelationshipDto, @Res() res: Response) {
    const result = await this.relationshipsService.update(id, updateRelationshipDto);
    const { status } = result;

    return res.status(status).json(result);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.relationshipsService.remove(+id);
  }
}
