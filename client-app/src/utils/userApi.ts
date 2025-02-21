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