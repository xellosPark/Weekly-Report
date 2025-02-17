import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

      async findUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
          where: { email },
          relations: ['auth'], // auth 데이터를 함께 불러옴
        });
      }
}
