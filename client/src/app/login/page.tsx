"use client";

import { useState } from "react";
import styles from "./login.module.css";
import axios from "axios";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    </div>
  );
}
