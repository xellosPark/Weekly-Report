import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import MainPage from "./pages/MainPage/MainPage"; // 메인 페이지 컴포넌트

const RouterComponent: React.FC = () => {
  //const token = localStorage.getItem("accessToken"); // 로컬 스토리지에서 토큰을 가져옴
  const token = sessionStorage.getItem("accessToken"); // 로컬 스토리지에서 토큰을 가져옴

  return (
    <Router>
      <Routes>
        {/* 토큰이 있으면 MainPage로 이동, 없으면 로그인 페이지로 이동 */}
        <Route
          path="/"
          element={token ? <MainPage /> : <Navigate to="/login" />}
        />

        {/* 로그인 페이지 */}
        <Route
          path="/login"
          element={!token ? <LoginPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default RouterComponent;
