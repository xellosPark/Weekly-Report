import { Body, Controller, Get, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardDto } from './dto/create-board.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UpdateBoardDto } from './dto/update-board.dto';
import { UserRank } from 'src/@common/enums/global.enum';

interface AuthenticatedRequest extends Request {
    user: {
      id: number;
      // 필요하다면 name, email 등도 추가 가능
    };
}

@Controller('boards')
export class BoardsController {
    constructor(private boardsService: BoardsService) { }

    // @Get(':id')
    // @UseGuards(AuthGuard('jwt'))
    // async allLoadBoard(@Param("id", ParseIntPipe) id: number) {
    //     //console.log('allLoadBoard id', id);
    //     return this.boardsService.allLoadBoard(id);
    // }

    /**
     * //get http://localhost:9801/api/boards?id=${id}?rank=${rank}
     * @param id 
     * @param team 
     * @returns 
     */

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    //async loadBoard(@Query("id", ParseIntPipe) id: number, @Query('rank') rank: UserRank) {
    async loadBoard(@Param("id", ParseIntPipe) id: number, @Query('rank') rank: UserRank) {
        //console.log('id team', id, rank);

        if (rank === UserRank.CEO || rank === UserRank.Manager || rank === UserRank.Support)
            return this.boardsService.allLoadBoard(id);
        else
            return this.boardsService.loadBoard(id, rank);
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
    async createBoard(@Param("id", ParseIntPipe) id: number, @Body() createBoardDto: BoardDto, @Req() req: AuthenticatedRequest) {
        const userId = req.user.id;
        //console.log('userId', id);
        
        //console.log('createBoard id', userId);
        
        //console.log('board', createBoardDto);

        const exist = await this.boardsService.existBoard(createBoardDto, id);
        //console.log('board 존재', exist);

        if (exist === undefined && userId !== id) {
            console.log('게시물 추가 x');
            
            return { success: false, message: '해당 유저가 게시물 추가 후에 수정이 가능합니다'};
            throw new NotFoundException('해당 게시글이 추가되지 않아 입력 안됨');
        }

        if (exist === undefined) {
            console.log('게시물 생성');
            
            return this.boardsService.createBoard(createBoardDto, userId);
        }
        else {
            console.log('게시물 수정');
            return this.boardsService.updateBoard(id, createBoardDto);
        }
        
    }

    // @Post()
    // async test(@Res() res: Response) {
        
        
    //     return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
    // }

    @Patch('edit/:id')
    @UseGuards(AuthGuard('jwt')) // JWT 인증 가드 적용
    //@Req() Express의 Request 객체를 가져옴옴
    async updateBoard(@Param('id') boardId: number, @Body() updateBoardDto: UpdateBoardDto, @Req() req: AuthenticatedRequest) {
        const userId = req.user.id;
        console.log('boardId', boardId, userId, req.user);
        
        return this.boardsService.updateBoardWhitBoardId(userId, boardId, updateBoardDto);
    }
}

