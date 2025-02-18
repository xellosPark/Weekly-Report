import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BoardDto } from './dto/create-board.dto';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './boards.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  private boards: BoardDto[] = [];

  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async createBoard(boardDto: BoardDto, userId: number): Promise<Board> {
    
    const user = await this.userRepository.findOne({ where: { id: userId  } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    
    const createBoard = this.boardRepository.create({
      user,
      part: userId,
      title: boardDto.title,
      category: boardDto.category,
      previousWeekPlan: boardDto.previousWeekPlan,
      currentWeekPlan: boardDto.currentWeekPlan,
      performance: boardDto.performance,
      completionDate: boardDto.completionDate,
      achievementRate: boardDto.achievementRate,
      report: boardDto.report,
      issue: boardDto.issue,
      memo: boardDto.memo
    });
    await this.boardRepository.save(createBoard);

    console.log('Board Create 완료');
    //this.boards.push(board); // 생성한 board 객체 추가
    return createBoard;
  }

  async allLoadBoard(userId: number): Promise<Board[]> {
    const user = await this.userRepository.findOne({ where: { id: userId  } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.team !== 10) {
      throw new NotFoundException("Admin User not found");
    }

    return await this.boardRepository.find();
  }
  async loadBoard(userId: number, team: number): Promise<Board[]> {
    const user = await this.userRepository.findOne({ where: { id: userId  } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return await this.boardRepository.find({
      where: { 
        part: team,
        user: { id: userId } }, // 🔗 userId에 해당하는 board 조회
    });
  }

  async updateBoard(userId: number, boardId: number, updateBoardDto: UpdateBoardDto): Promise<UpdateBoardDto> {
    // 1. 해당 board가 존재하는지 확인
    
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user'], // FK 관계 테이블 로드
    });

    if (!board) {
      throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
    }

    // 2. 요청한 user가 해당 board의 소유자인지 확인
    if (board.user.id !== userId) {
      throw new ForbiddenException('해당 게시글을 수정할 권한이 없습니다.');
    }


    // 3. 데이터 업데이트 및 저장
    Object.assign(board, updateBoardDto);
    this.boardRepository.save(board);

    console.log('Board Update 완료');
    return updateBoardDto;
  }
}