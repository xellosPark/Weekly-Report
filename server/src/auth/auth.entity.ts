import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique, PrimaryColumn, OneToOne, JoinColumn, } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

@Entity('auth') // 데이터베이스 테이블 이름을 'usersinfo'로 설정
export class Auth {
    /**
     * 사용자 ID
     * - 기본 키
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 사용자 비밀번호
     */
    @Column({ nullable: false })
    password: string;

    @Column()
    authMethod: string;

    @Column({ type: 'text', nullable: true })
    refreshToken: string | null;

    @OneToOne(() => User, (user) => user.auth)
    @JoinColumn()
    user: User;

    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    async comparePassword(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.password);
    }

}
