import { useState } from "react";
import styles from "./LoginPage.module.css";
import axios from "axios";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// 서버 응답 타입 정의
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userData: User;
}

interface ErrorResponse {
  message: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  rank: number;
  team: number;
  site: number;
  admin: number;
  state: number;
}

export default function LoginPage() {
  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const { login } = useAuth();

  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  const handleLogin = async () => {
    try {
      console.log("로그인 요청 데이터:", { email: id, password });

      const response = await axios.post<LoginResponse>(
        "http://localhost:9801/auth/signin",
        { email: id, password: password }
      );

      if (response.status === 201) {
        const { accessToken, userData } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userId", String(userData.id));
        localStorage.setItem("username", userData.username);
        localStorage.setItem("userRank", String(userData.rank));
        localStorage.setItem("userTeam", String(userData.team));
        login(accessToken);

        navigate("/DashBoard"); // 로그인 성공 후 페이지 이동
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(
          (error.response.data as ErrorResponse).message ||
            "로그인에 실패했습니다."
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
      setTestMessage("테스트 API 호출 성공");
    } catch (error) {
      console.error("API 요청 중 오류 발생:", error);
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
