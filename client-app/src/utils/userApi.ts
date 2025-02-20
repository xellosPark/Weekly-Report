import axios from "axios";
import api from "./api";

const id = Number(localStorage.getItem("userId"));
const team = Number(localStorage.getItem("userTeam"));

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    userData: User;
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

/* GET */
export const Login = async (id: string, password: string) => {
    const response = await axios.post<LoginResponse>(
        "http://localhost:9801/api/auth/signin",
        { email: id, password: password }
      );
    return response;
}