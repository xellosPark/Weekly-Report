import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardDto } from './dto/create-board.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
    constructor(private boardsService: BoardsService) { }

    @Get(':id')
    async allLoadBoard(@Param("id", ParseIntPipe) id: number) {
        //console.log('allLoadBoard id', id);
        return this.boardsService.allLoadBoard(id);
    }

    /**
     * //get http://ubisampaju.synology.me:9100/boards?id=${id}&team=${team}
     * @param id 
     * @param team 
     * @returns 
     */

    @Get()
    async loadBoard(@Query("id", ParseIntPipe) id: number, @Query('team') team: number) {
        //console.log('id team', id, team);
        return this.boardsService.loadBoard(id, team);
    }


    /**
     * //post http://ubisampaju.synology.me:9100/boards/
        {
            "user": {
                "id": "4f09c28c",
                "email": "test3@example.com",
                "username": "test3",
                "rank": 1,
                "team": 2,
                "site": 1,
                "admin": 3,
                "state": 10
            },
            "board": {
                "part": 1,
                "title": "2025년 2월 3주차",
                "category": "개발",
                "previousWeekPlan": "기능개선선선",
                "currentWeekPlan": "버그 수정",
                "performance": "테스트트 완료",
                "completionDate": "2025.02.13",
                "achievementRate": 80,
                "totalRate": 100,
                "report": null,
                "issue": "",
                "memo": null
            }
        }
     */
    @Post(':id')
    @UseGuards(AuthGuard('jwt'))
    async createBoard(@Param("id", ParseIntPipe) id: number, @Body() createBoardDto: BoardDto, @Req() req: any) {
        const userId = req.user.id;
        console.log('userId', id);
        
        console.log('createBoard id', userId);
        
        //console.log('board', createBoardDto);

        const exist = await this.boardsService.existBoard(createBoardDto, userId);
        //console.log('board 존재', exist);
        if (exist === undefined) {
            return this.boardsService.createBoard(createBoardDto, userId);
        }
        else return this.boardsService.updateBoard(userId, createBoardDto);
        
    }

    // @Post()
    // async test(@Res() res: Response) {
        
        
    //     return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
    // }

    @Patch('edit/:id')
    @UseGuards(AuthGuard('jwt')) // JWT 인증 가드 적용
    //@Req() Express의 Request 객체를 가져옴옴
    async updateBoard(@Param('id') boardId: number, @Body() updateBoardDto: UpdateBoardDto, @Req() req: any) {
        const userId = req.user.id;
        console.log('boardId', boardId, userId, req.user);
        
        return this.boardsService.updateBoardWhitBoardId(userId, boardId, updateBoardDto);
    }
}

