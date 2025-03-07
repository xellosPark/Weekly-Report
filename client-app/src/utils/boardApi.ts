import axios from "axios";
import api from "./api";

/* GET */

// 로그인 하자마자 바로 업데이트가 필요한 부분으로 param으로 전달
export const LoadBoard = async (id_: number, team_: number) => {
  let response = null;
  if (team_ === 10) {
    response = await api.get(
      `http://localhost:9801/api/boards/${id_}`,
      {
        headers: { "Content-Type": "application/json" }, // ✅ JSON 명시
      }
    );
  } else {
    response = await api.get(
      `http://localhost:9801/api/boards?id=${id_}&team=${team_}`,
      {
        headers: { "Content-Type": "application/json" }, // ✅ JSON 명시
      }
    );
  }
  return response?.data;
}

export const SaveBoard = async (board: any, id_: number) => {
  const accessToken = localStorage.getItem('accessToken');

  console.log("📤 SaveBoard 호출됨 - 전송할 데이터:", board);
  console.log("🔑 Access Token:", accessToken);
  try {
    const response = await api.post(
      `http://localhost:9801/api/boards/${id_}`,
      JSON.stringify(board), // JSON 데이터 전송
      {
        headers: {
          "Content-Type": "application/json",
        }, // ✅ JSON 명시
      }
    );
    if (response?.data) return "저장되었습니다";// "저장되었습니다";
  } catch (error) {
    console.log(error);

    //console.error("❌ 요청 실패:", error.response?.data || error.message);
  }
  return "저장 실패";
}

export const EditBoard = async (board: any, original: number | undefined) => {
  const response = await api.patch(
    `http://localhost:9801/api/boards/edit/${original}`,
    board, // JSON 데이터 전송
  );
  if (response?.data) return "업데이트 성공";
  else return "업데이트 실패";
}