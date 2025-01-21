import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class BoardsService {
  private boards : CreateBoardDto[] = [];

  getAllBoards() {
    return this.boards;
  }

  getBoards(id: string) {
    const board = this.boards.find((b) => b.id === id);

        if (!board) {
            throw new NotFoundException(`Board with ID ${id} not found`);
        }

        return board;
  }

  createBoard(createBoardDto: CreateBoardDto) {
    const { title, description, isPublic } = createBoardDto; // DTO에서 필요한 값 추출

    const board: CreateBoardDto = {
        id: uuid(), // UUID 생성
        title,
        description,
        isPublic, // isPublic 추가 (누락된 필드 추가)
    };

    this.boards.push(board); // 생성한 board 객체 추가
    return board; // 생성된 board 객체 반환 (선택 사항)
}

}