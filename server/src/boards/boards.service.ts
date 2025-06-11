import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BoardDto } from './dto/create-board.dto';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './boards.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { UpdateBoardDto } from './dto/update-board.dto';
import { UserRank } from 'src/@common/enums/global.enum';

@Injectable()
export class BoardsService {
  private boards: BoardDto[] = [];

  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }


  async existBoard(boardDto: BoardDto, userId: number): Promise<Board> {
    const user = await this.userRepository.findOne({ where: { id: userId  } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const board = await this.boardRepository.find({
      where: { 
        part: user.team,
        title: boardDto.title,
        user: { id: userId } }, // 🔗 userId에 해당하는 board 조회
        relations: ['user'],
    });

    return board[0];
  }

  async createBoard(boardDto: BoardDto, userId: number): Promise<Board> {
    
    const user = await this.userRepository.findOne({ where: { id: userId  } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    
    const createBoard = this.boardRepository.create({
      user,
      part: user.team,
      title: boardDto.title,
      category: boardDto.category,
      previousWeekPlan: boardDto.previousWeekPlan,
      currentWeekPlan: boardDto.currentWeekPlan,
      performance: boardDto.performance,
      completionDate: boardDto.completionDate,
      achievementRate: boardDto.achievementRate,
      report: boardDto.report,
      issue: boardDto.issue,
      memo: boardDto.memo,
      pm: boardDto.pm,
    });
    await this.boardRepository.save(createBoard);

    //console.log('Board Create 완료');
    //this.boards.push(board); // 생성한 board 객체 추가
    return createBoard;
  }

  async allLoadBoard(userId: number): Promise<Board[]> {
    const user = await this.userRepository.findOne({ where: { id: userId  } });
    if (!user) {
      throw new NotFoundException("User not found");
    } 

    // if (user.team !== 10) {
    //   throw new NotFoundException("Admin User not found");
    // }
    //console.log('team', user.team);
    
    //const data = await this.boardRepository.find(); //유저 정보 포함 안됨
    // const data = await this.boardRepository.find({
    //   relations: ['user'], // 유저 정보 전부 포함
    // });

    const data = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoin('board.user', 'user') // join만 하고 select는 따로
      .addSelect(['user.id'])       // user.id만 추가
      .getMany();

    //console.log('all data', data);
    
    return data;// await this.boardRepository.find();
  }
  async loadBoard(userId: number, rank: UserRank): Promise<Board[]> {
    const user = await this.userRepository.findOne({ where: { id: userId  } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (rank === UserRank.Support) {
      //console.log('여기다');
      
      return await this.boardRepository.find({
        where: { 
          //rank: rank,
          user: { site: 1  } }, // 🔗 userId에 해당하는 board 조회
      });
    }

    // return await this.boardRepository.find({
    //   where: { 
    //     //rank: rank,
    //     user: { id: userId} }, // 🔗 userId에 해당하는 board 조회
    // });

    return await this.boardRepository
    .createQueryBuilder('board')
    .leftJoin('board.user', 'user') // join만 하고 select는 따로
    .addSelect(['user.id'])       // user.id만 추가
    .getMany();
  }

  async updateBoard(userId: number, boardDto: BoardDto): Promise<UpdateBoardDto> {
    // 1. 해당 board가 존재하는지 확인
    
    // const board = await this.boardRepository.findOne({
    //   where: { id: boardId },
    //   relations: ['user'], // FK 관계 테이블 로드
    // });
    const board = await this.existBoard(boardDto, userId);

    //console.log('update board', board);
    

    if (!board) {
      throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
    }

    // 2. 요청한 user가 해당 board의 소유자인지 확인
    if (board.user.id !== userId) {
      throw new ForbiddenException('해당 게시글을 수정할 권한이 없습니다.');
    }


    // 3. 데이터 업데이트 및 저장
    Object.assign(board, boardDto);
    await this.boardRepository.save(board);

    console.log('Board Update 완료');
    return boardDto;
  }

  async updateBoardWhitBoardId(userId: number, boardId: number, updateBoardDto: UpdateBoardDto): Promise<UpdateBoardDto> {
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
    await this.boardRepository.save(board);

    console.log('Board Update 완료');
    return updateBoardDto;
  }
}