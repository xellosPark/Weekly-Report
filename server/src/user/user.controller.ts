import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    @Get(':site')
    //@UseGuards(AuthGuard('jwt'))
    async getUsers(@Param("site", ParseIntPipe) site: number) {
        return this.userService.getUsers(site);
    }
}
