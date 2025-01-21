# Weekly-Report

pm2 - Node.js 애플리케이션을 관리하기 위한 도구로, 프로세스를 백그라운드에서 실행하고 모니터링함

1. 설치
npm install -g pm2

2. NestJS 서버 실행
pm2 start npm --name "weekly-report-server" -- run start:dev


3. 상태확인
pm2 status

4. 서버 종료
pm2 stop weekly-report-server

5. 시스템 재부팅 시 자동 실행 설정
pm2 startup
pm2 save

6. 특정 프로세스 이름으로 삭제
pm2 delete <name>

7. 특정 프로세스 ID로 삭제

8. 전체 프로세스 삭제
pm2 delete all


npm install --save class-validator class-transformer
npm install uuid