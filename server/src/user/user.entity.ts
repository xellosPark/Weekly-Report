// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, BeforeInsert, Unique, DeleteDateColumn, OneToMany, } from 'typeorm';
import { Auth } from '../auth/auth.entity';
import { Board } from 'src/boards/boards.entity';

@Entity('user')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ default: 0 }) //0: 미정, 1: 사원, 2: 대리
  rank: number;

  @Column({ default: 0 }) //0: 미정, ex)로봇자동화사업팀
  team: number;

  @Column({ default: 0 }) //0: 미정, 서울, 파주, 구미, 관리자(서울, 파주 두군데)
  site: number;

  @Column({ default: 0 })
  admin: number;

  //0:입사, 1:재입사, 2:휴직, 10:퇴사
  @Column({ default: 0 })
  state: number;

  @OneToOne(() => Auth, (auth) => auth.user, { cascade: true, eager: false }) //User 생성 시 Auth도 자동 생성
  auth: Auth;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  // 🔗 User(1) ↔ Board(N)
  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];

  @BeforeInsert()
  setAuth() {
    this.auth = new Auth(); //User가 생성될 때 Auth 객체도 자동으로 생성되도록 설정
  }
}
