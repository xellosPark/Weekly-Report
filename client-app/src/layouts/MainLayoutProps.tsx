// src/layouts/MainLayout.tsx
import React, { useState } from "react";
import SidebarLayout from "../components/SidebarLayout/SidebarLayout"; // 사이드바 컴포넌트 import
import Header from "../components/Header/Header"; // 헤더 컴포넌트 import

interface MainLayoutProps {
  children: React.ReactNode;
  timeRemaining: string;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  timeRemaining,
  onLogout,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // 사이드바 너비 조정
  const sidebarWidth = isMinimized ? 40 : 150;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* 헤더 */}
      <Header timeRemaining={timeRemaining} onLogout={onLogout} />

      {/* 사이드바 + 메인 콘텐츠 컨테이너 */}
      <div style={{ display: "flex", flexGrow: 1 }}>
        {/* 사이드바 */}
        <SidebarLayout
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
        />

        {/* 메인 콘텐츠 */}
        <div
          style={{
            flexGrow: 1,
            transition: "margin-left 0.3s ease", // 부드럽게 이동
            marginLeft: isMinimized ? "80px" : "120px",
            padding: "0px",
          }}
        >
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
