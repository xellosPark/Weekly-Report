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

        // window.location.href = "/dashboard";
      }
    } catch (error) {
      // 오류 처리
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(
          error.response.data.message || "로그인에 실패했습니다."
        );
      } else {
        setErrorMessage("서버와의 연결에 문제가 발생했습니다.");
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
