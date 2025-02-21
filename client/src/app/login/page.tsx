"use client";

import { useState } from "react";
import styles from "./login.module.css";
import axios from "axios";
import api from "@/utils/api";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      // 콘솔 로그 추가 (로그인 요청 전)
      console.log("로그인 요청 데이터:", { email: id, password });

      // 서버에 로그인 요청
      const response = await axios.post("http://localhost:9801/auth/signin", {
        email: id,
        password: password,
      });

      // 성공 시 처리
      if (response.status === 201) {
        alert("로그인 성공!");
        console.log("서버 응답:", response.data);

        // accessToken과 refreshToken을 응답에서 받아서 콘솔에 출력
        const { accessToken, refreshToken } = response.data;
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);

        // 토큰을 로컬 스토리지에 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // 페이지 이동
        // window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("로그인 오류 발생:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // 서버에서 반환한 응답이 있는 경우
          console.error("서버 응답 데이터:", error.response.data);
          console.error("서버 응답 상태 코드:", error.response.status);

          setErrorMessage(
            error.response.data.message ||
              `로그인 실패 (상태 코드: ${error.response.status})`
          );
        } else if (error.request) {
          // 요청이 보내졌지만 응답을 받지 못한 경우 (네트워크 문제 등)
          console.error("요청이 보내졌지만 응답 없음:", error.request);
          setErrorMessage("서버에서 응답이 없습니다. 네트워크를 확인하세요.");
        } else {
          // 요청 설정 중 오류 발생
          console.error("요청 설정 오류:", error.message);
          setErrorMessage(`요청 오류: ${error.message}`);
        }
      } else {
        console.error("알 수 없는 오류:", error);
        setErrorMessage("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  const handleTest = async () => {
    try {
      const response = await api.post("/auth/test");
      console.log("서버 응답:", response.data);
    } catch (error) {
      console.error("API 요청 중 오류 발생:", error); // 로그 추가
      setErrorMessage("테스트 요청에 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>로그인</h1>
      <input
        className={styles.inputField}
        type="text"
        placeholder="아이디"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <input
        className={styles.inputField}
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      <button className={styles.button} onClick={handleLogin}>
        로그인
      </button>

      <h1 className={styles.title}>테스트 API 호출</h1>
      <button className={styles.button} onClick={handleTest}>
        테스트 API 호출
      </button>
      {testMessage && <p>{testMessage}</p>}
    </div>
  );
}
