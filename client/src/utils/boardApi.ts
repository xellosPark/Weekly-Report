import axios from "axios";
import api from "./api";

const ip = process.env.REACT_APP_API_DEV === 'true' ? process.env.REACT_APP_API_LOCAL : process.env.REACT_APP_API_SERVER;

// 로그인 하자마자 바로 업데이트가 필요한 부분으로 param으로 전달
export const LoadBoard = async (id_: number, rank_: number) => {
  let response = null;
  // if (rank_ === 10) { //1,2,3
  //   response = await api.get(
  //     `http://localhost:9801/api/boards/${id_}`,
  //     {
  //       headers: { "Content-Type": "application/json" }, // ✅ JSON 명시
  //     }
  //   );
  // } else {
  //   response = await api.get(
  //     `http://localhost:9801/api/boards?id=${id_}&team=${rank_}`,
  //     {
  //       headers: { "Content-Type": "application/json" }, // ✅ JSON 명시
  //     }
  //   );
  // }
  

  response = await api.get(
    `${ip}/api/boards/${id_}?rank=${rank_}`,
    {
      headers: { "Content-Type": "application/json" }, // ✅ JSON 명시
    }
  );

  return response?.data;
}

export const SaveBoard = async (board: any, id_: number) => {
  //console.log("📤 SaveBoard 호출됨 - 전송할 데이터:", board);
  try {
    const response = await api.post(
      `${ip}/api/boards/${id_}`,
      JSON.stringify(board), // JSON 데이터 전송
      {
        headers: {
          "Content-Type": "application/json",
        }, // ✅ JSON 명시
      }
    );
    console.log('response', response);
    if (response?.data.success === false) return response?.data.message;
    if (response?.data) return "저장되었습니다";// "저장되었습니다";

  } catch (error) {
    console.log(error);
    //console.error("❌ 요청 실패:", error.response?.data || error.message);
  }
  return "저장 실패";
}

export const EditBoard = async (board: any, original: number | undefined) => {
  const response = await api.patch(
    `${ip}/api/boards/edit/${original}`,
    board, // JSON 데이터 전송
  );
  if (response?.data) return "업데이트 성공";
  else return "업데이트 실패";
}