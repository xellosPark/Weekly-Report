import axios from "axios";
import api from "./api";

const id = Number(localStorage.getItem("userId"));
const team = Number(localStorage.getItem("userTeam"));

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

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userData: User;
}

interface ChangePasswordResponse {
  message: string; // 성공/실패 메시지
  success?: boolean;
}

/* GET */
export const Login = async (id: string, password: string) => {
  try {
    const response = await axios.post<LoginResponse>(
      "http://localhost:9801/api/auth/signin",
      { email: id, password: password }
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response; // 에러 응답을 그대로 반환
    }
    throw new Error("서버와의 연결에 문제가 발생했습니다.");
  }
};

/* POST */
export const changePassword = async (currentPw: string, newPw: string) => {
  console.log("[changePassword] 비밀번호 변경 요청 시작:", {
    currentPassword: currentPw,
    newPassword: newPw,
  });

  try {
    const response = await api.post<ChangePasswordResponse>(
      "http://localhost:9801/api/auth/change-password",
      {
        currentPassword: currentPw,
        newPassword: newPw,
      }
    );

    console.log("[changePassword] 서버 응답:", response.data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.warn("[changePassword] 에러 응답:", error.response.data);
      return error.response; // 에러 메시지 응답 그대로 반환
    }

    console.error("[changePassword] 요청 실패:", error);
    throw new Error("비밀번호 변경 요청 중 오류가 발생했습니다.");
  }
};