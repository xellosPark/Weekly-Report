import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique } from 'typeorm';

@Entity()
//BaseEntity와 같은 상위 클래스를 상속받지 않으면 생성일시, 수정일시, 생성자, 수정자와 같은 필드는 존재하지 않습니다.
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number; // 게시판 ID, 자동으로 생성되는 기본 키 필드

  @Column()
  title: string; // 게시판 제목을 저장하는 필드

  @Column()
  category: string; // 구분(카테고리) 정보를 저장하는 필드

  @Column()
  previousWeekPlan: string; // 이전 주 계획 업무 내용을 저장하는 필드

  @Column()
  currentWeekPlan: string; // 금주 계획 업무 내용을 저장하는 필드

  @Column()
  performance: string; // 수행 실적 정보를 저장하는 필드

  @Column({ type: 'varchar', length: 10, nullable: true })
  completionDate: string; // 완료 예정일을 저장하는 필드, 형식은 '2015.02.08'과 같은 문자열

  @Column({ type: 'int', default: 0 })
  achievementRate: number; // 달성율을 저장하는 필드, 정수 값으로 저장 (0~100 범위)

  @CreateDateColumn()
  createdAt: Date; // 엔티티가 생성된 시간을 자동으로 기록하는 필드

  @UpdateDateColumn()
  updatedAt: Date; // 엔티티가 마지막으로 수정된 시간을 자동으로 기록하는 필드

  @DeleteDateColumn()
  deletedAt: Date | null; // 엔티티가 삭제된 시간을 기록하는 필드 (소프트 삭제를 위해 사용)
}
