import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayoutProps";
import LoginPage from "../pages/LoginPage/LoginPage";
import Dashboard from "../pages/MainPage/MainPage";

const AppRoutes = () => {
  const { isAuth, logout } = useAuth();

  console.log("🔹 Auth 상태 : ", isAuth);

  // ✅ 로그아웃 핸들러
  const handleLogout = () => {
    console.log("🔹 로그아웃 함수 실행됨");
    //localStorage.removeItem("accessToken");
    logout();
    window.location.href = "/login"; // ✅ 로그아웃 후 로그인 페이지로 이동
  };
  console.log("🔹 여기는 : ");
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/DashBoard" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/DashBoard"
        element={
          isAuth ? (
            <MainLayout onLogout={handleLogout}>
              <Dashboard />
            </MainLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
