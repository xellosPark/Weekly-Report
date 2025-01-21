import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  title: string; // 게시판 제목

  @IsString()
  @IsNotEmpty()
  description: string; // 게시판 설명

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean; // 공개 여부
}