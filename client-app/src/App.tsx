import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayoutProps";
import LoginPage from "./pages/LoginPage/LoginPage";
import MainPage from "./pages/MainPage/MainPage"; // MainPage를 import

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [timeRemaining, setTimeRemaining] = useState("10:00"); // 예시로 시간 설정

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        {/* 기본 루트: 로그인 상태이면 DashBoard로 이동 */}
        <Route
          path="/"
          element={<Navigate to={token ? "/DashBoard" : "/login"} />}
        />

        {/* 로그인 페이지 */}
        <Route
          path="/login"
          element={!token ? <LoginPage /> : <Navigate to="/DashBoard" />}
        />

        {/* DashBoard 페이지 (MainLayout + MainPage) */}
        <Route
          path="/DashBoard"
          element={
            token ? (
              <MainLayout timeRemaining={timeRemaining} onLogout={handleLogout}>
                <MainPage />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
