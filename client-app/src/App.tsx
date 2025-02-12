// src/App.tsx
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
      <div>
        <Routes>
          {/* 로그인한 상태일 때 메인 페이지로 이동 */}
          <Route
            path="/"
            element={
              token ? (
                <MainLayout
                  timeRemaining={timeRemaining}
                  onLogout={handleLogout}
                >
                  <MainPage /> {/* MainPage 컴포넌트 렌더링 */}
                </MainLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* 로그인 페이지 */}
          <Route
            path="/login"
            element={!token ? <LoginPage /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
