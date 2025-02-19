import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class BoardDto {
  
  // @IsInt()
  // @Transform(({ value }) => value ?? 0) // 값이 없으면 0으로 설정
  // part: number;

  @IsString()
  @IsNotEmpty({ message: '제목 포맷은 "2025년도 1월 1주차" 입니다.'})
  title: string; // 게시판 제목

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  previousWeekPlan: string;

  @IsOptional()
  @IsString()
  currentWeekPlan: string;

  @IsOptional()
  @IsString()
  performance: string;

  @IsOptional()
  @IsString()
  completionDate: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '금주 달성율은 필수 항목 입니다.'})
  achievementRate: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '전체 달성율은 필수 항목 입니다.'})
  totalRate: string;

  @IsOptional() // ✅ 값이 없어도 허용
  @IsString()
  report?: string; // 게시판 정보보고

  @IsOptional() // ✅ 값이 없어도 허용
  @IsString()
  issue?: string; // 게시판 이슈

  @IsOptional() // ✅ 값이 없어도 허용
  @IsString()
  memo?: string; // 게시판 메모
}