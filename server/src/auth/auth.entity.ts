import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique, PrimaryColumn, } from 'typeorm';

@Entity('auth') // 데이터베이스 테이블 이름을 'usersinfo'로 설정
@Unique(['email'])
export class Auth {
    /**
     * 사용자 ID
     * - 기본 키
     */
    @PrimaryColumn()
    id: number;

    /**
     * 사용자 이메일
     * - 고유값
     */
    @Column()
    email: string;

    /**
     * 사용자 비밀번호
     */
    @Column()
    password: string;

    /**
     * 생성 날짜
     * - TypeORM에서 자동으로 관리
     */
    @CreateDateColumn()
    createdAt: Date;

    /**
     * 수정 날짜
     * - TypeORM에서 자동으로 관리
     */
    @UpdateDateColumn()
    updatedAt: Date;

    /**
     * 삭제 날짜
     * - TypeORM에서 자동으로 관리
     */
    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;

    /**
     * 해시된 리프레시 토큰
     * - 사용자의 리프레시 토큰을 암호화하여 저장
     * - nullable: true 설정으로 선택적으로 저장 가능
     * - 리프레시 토큰이 없는 경우 null 상태로 유지
    */
    @Column({ nullable: true })
    hashedRefreshToken: string;

}
