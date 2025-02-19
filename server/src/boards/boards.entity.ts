import { User } from '../user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('boards')
//BaseEntity와 같은 상위 클래스를 상속받지 않으면 생성일시, 수정일시, 생성자, 수정자와 같은 필드는 존재하지 않습니다.
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number; // 게시판 ID, 자동으로 생성되는 기본 키 필드

  @ManyToOne(() => User, {eager: false}) //eager: false ❌ 자동 로드 방지
  @JoinColumn({ name: 'user_id' }) // 'user_id'로 외래 키 연결
  user: User;

  @Column({ type: 'int', default: 0 })
  part: number; //파트 구분 ex) 1파트

  @Column({ type: 'text' })
  title: string; // 게시판 제목을 저장하는 필드 (2025년 2월 1주차)

  @Column({ type: 'text',default: "" })
  category: string; // 구분(카테고리) 정보를 저장하는 필드

  @Column({ type: 'text', nullable: true })
  previousWeekPlan: string; // 이전 주 계획 업무 내용을 저장하는 필드

  @Column({ type: 'text', nullable: true })
  currentWeekPlan: string; // 금주 계획 업무 내용을 저장하는 필드

  @Column({ type: 'text', nullable: true })
  performance: string; // 수행 실적 정보를 저장하는 필드

  @Column({ type: 'text', nullable: true })
  completionDate: string; // 완료 예정일을 저장하는 필드, 형식은 '2015.02.08'과 같은 문자열

  @Column({ type: 'text', default: 0 })
  achievementRate: string; // 달성율을 저장하는 필드, 정수 값으로 저장 (0~100 범위)

  @Column({ type: 'text', default: 0 })
  totalRate: string; // 전체 달성

  @Column({ nullable: true })
  report: string;

  @Column({ nullable: true })
  issue: string;

  @Column({ nullable: true })
  memo: string;

  @CreateDateColumn()
  createdAt: Date; // 엔티티가 생성된 시간을 자동으로 기록하는 필드

  @UpdateDateColumn()
  updatedAt: Date; // 엔티티가 마지막으로 수정된 시간을 자동으로 기록하는 필드

  @DeleteDateColumn()
  deletedAt: Date | null; // 엔티티가 삭제된 시간을 기록하는 필드 (소프트 삭제를 위해 사용)
}