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

  getAllBoards() {
    return this.boards;
  }

  getBoards(id: number) {
    //DB없이 사용사
    // const board = this.boards.find((b) => b.id === id);
    //     if (!board) {
    //         throw new NotFoundException(`Board with ID ${id} not found`);
    //     }
    //     return board;

    return this.boardRepository
      .createQueryBuilder('board')
      .where('board.id = :id', { id: id })
      .getOne()
      .then((board) => {
        if (!board) {
          console.error(`Board with ID ${id} not found`); // 에러 로그
          throw new NotFoundException(`Board with ID ${id} not found`);
        }
        // UTC -> KST 변환
        const createdAtKST = new Date(board.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        const updateAtKST = new Date(board.updatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        console.log(`Board found:`, {
          ...board,
          createdAt: createdAtKST,
          updateAt: updateAtKST,
        });
        return board;
      })
      .catch((error) => {
        console.error(`Error occurred while fetching board with ID ${id}:`, error); // 에러 발생 로그
        throw error;
      });
  }

  //옛날 방식 및 db없이 데이터 추가 할때 사용
  //   createBoard(createBoardDto: CreateBoardDto) {
  //     const { title, description, isPublic } = createBoardDto; // DTO에서 필요한 값 추출

  //     const board: CreateBoardDto = {
  //         id: uuid(), // UUID 생성
  //         title,
  //         description,
  //         isPublic, // isPublic 추가 (누락된 필드 추가)
  //     };

  //     this.boards.push(board); // 생성한 board 객체 추가
  //     return board; // 생성된 board 객체 반환 (선택 사항)
  // }

  async createBoard(createBoardDto: CreateBoardDto) {
    const { id, title, description, isPublic } = createBoardDto; // DTO에서 필요한 값 추출

    const data = this.boardRepository.create({ title })

    try {
      await this.boardRepository.save(data);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('추가하는 도중에 에러가 발생했습니다.');
    }

    const board: CreateBoardDto = {
      id, // UUID 생성
      title,
      description,
      isPublic, // isPublic 추가 (누락된 필드 추가)
    };

    //this.boards.push(board); // 생성한 board 객체 추가
    return board; // 생성된 board 객체 반환 (선택 사항)
  }

}