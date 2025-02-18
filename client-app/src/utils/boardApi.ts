import api from "./api";

const id = Number(localStorage.getItem("userId"));
const team = Number(localStorage.getItem("userTeam"));
/* GET */

export const LoadBoard = async () => {
    let response = null;
    if (team === 10) {
        response = await api.get(
          `http://localhost:9801/boards/${id}`,
          {
            headers: { "Content-Type": "application/json" }, // ✅ JSON 명시
          }
        );
      } else {
        response = await api.get(
          `http://localhost:9801/boards?id=${id}&team=${team}`,
          {
            headers: { "Content-Type": "application/json" }, // ✅ JSON 명시
          }
        );
      }
    return response?.data;
}

export const SaveBoard = async (board: any) => {
    const response = await api.post(
        `http://localhost:9801/boards/${id}`,
        JSON.stringify(board), // JSON 데이터 전송
        {
          headers: { "Content-Type": "application/json" }, // ✅ JSON 명시
        }
    );
    if (response?.data) return "저장되었습니다";
    else return "저장 실패";
}

export const EditBoard = async (board: any, original: number | undefined) => {
    const response = await api.patch(
        `http://localhost:9801/boards/edit/${original}`,
        board, // JSON 데이터 전송
    );
    if (response?.data) return "업데이트 성공";
    else return "업데이트 실패";
}