import { useState } from "react";
import styles from "./LoginPage.module.css";
import axios from "axios";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Login } from "../../utils/userApi";

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
  const [id, setId] = useState<string>("@ubisam.com");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const { login, userUpdateData } = useAuth();

  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  const handleLogin = async () => {
    try {
      console.log("로그인 요청 데이터:", { email: id, password });

      const response = await Login(id, password);

      if (response.status === 201) {
        alert("로그인 성공!");
        console.log("서버 응답:", response.data);

        const { accessToken, refreshToken } = response.data;
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // window.location.href = "/dashboard";
      } else {
        // 서버가 401 응답을 줬다면, 그 메시지를 사용자에게 보여줌
        console.warn("로그인 실패:", response.data);
        setErrorMessage(
          response.data.message || "로그인 실패: 다시 시도해주세요."
        );

        // 실패한 경우 사용자에게 알림창 표시 (선택적)
        alert(
          response.data?.message || "로그인에 실패했습니다. 다시 시도해주세요."
        );
      }
    } catch (error) {
      console.error("알 수 없는 오류:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
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
      {/* ✅ 로그인 박스 */}
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Weekly-Report</h1>

        {/* ✅ 로그인 폼 */}
        {/* <form className={styles.form}> */}
        <div className={styles.inputGroup}>
          {/* ✅ 아이디 입력 필드 */}
          <input
            className={styles.inputField}
            type="text"
            placeholder="아이디를 입력해 주세요"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="off" /* ✅ 자동완성 차단하여 보안 경고 방지 */
          />

          {/* ✅ 비밀번호 입력 필드 */}
          <input
            className={styles.inputField}
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value.trim())
            } /* ✅ 공백 방지 */
            autoComplete="off" /* ✅ 자동완성 차단하여 보안 경고 방지 */
          />

          {/* ✅ 로그인 버튼 */}
          <button className={styles.button} onClick={handleLogin}>
            로그인
          </button>
        </div>

        {/* ✅ 아이디 / 비밀번호 찾기 링크 */}
        <div className={styles.findLinks}>
          {/* <a href="#">아이디 찾기</a> | <a href="#">비밀번호 찾기</a> */}
        </div>
      </div>
    </div>
  );
}
