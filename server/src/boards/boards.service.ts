import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './boards.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardsService {
  private boards: CreateBoardDto[] = [];

  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) { }


}