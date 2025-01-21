import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('boards')
export class BoardsController {
    constructor(private boardsService: BoardsService) { }

    //get http://ubisampaju.synology.me:9100/boards/
    @Get()
    getAllBoard() {
        return this.boardsService.getAllBoards();
    }
   
    //get http://ubisampaju.synology.me:9100/boards/e5f33e73-2a72-4189-a2bf-f3ce0faaa70a
    @Get(':id')
    getBoardById(@Param('id') id: number) {
        return this.boardsService.getBoards(id);
    }

    //post http://ubisampaju.synology.me:9100/boards/
    // {
    //     "title": "Board 2",
    //     "description": "Description 2",
    //     "isPublic": false
    //   }
    @Post()
    createBoard(@Body() createBoardDto: CreateBoardDto) {
        return this.boardsService.createBoard(createBoardDto);
    }

}

