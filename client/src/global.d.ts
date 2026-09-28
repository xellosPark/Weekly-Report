// CSS 모듈에 대한 타입 정의
declare module '*.module.css' {
    const classes: { [key: string]: string }; // CSS 클래스명이 key이고, 값은 string 타입
    export default classes;
}