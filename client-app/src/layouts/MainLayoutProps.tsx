import React, { useState, useEffect } from "react";
import SidebarLayout from "../components/SidebarLayout/SidebarLayout"; // 사이드바 컴포넌트 import
import Header from "../components/Header/Header"; // 헤더 컴포넌트 import

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void; // 로그아웃 함수
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const sidebarWidth = isMinimized ? 40 : 150;

  // ✅ 자동 로그아웃 타이머 상태
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 초기값: 30분 (1800초)
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now()); // 마지막 입력 시간

  // ✅ 사용자의 입력(키보드 & 마우스)을 감지하는 함수
  const handleUserAction = () => {
    setLastActionTime(Date.now()); // 입력이 있을 때마다 마지막 입력 시간 갱신
  };

  // ✅ 타이머 업데이트 함수 (1초마다 실행)
  const updateTimer = () => {
    const elapsedTime = Math.floor((Date.now() - lastActionTime) / 1000); // 경과 시간(초)
    const remainingTime = 300 - elapsedTime; // 남은 시간 계산

    if (remainingTime <= 0) {
      console.log("⏳ 30분 동안 입력 없음 → 자동 로그아웃 실행");
      onLogout(); // 자동 로그아웃 실행
      setTimeRemaining(300); // 타이머 초기화
    } else {
      setTimeRemaining(remainingTime); // 남은 시간 갱신
    }
  };

  // ✅ 키보드 & 마우스 이벤트 리스너 설정 및 타이머 업데이트
  useEffect(() => {
    const handleKeyDown = () => handleUserAction(); // 키 입력 감지
    const handleMouseActivity = () => handleUserAction(); // 마우스 활동 감지

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseActivity);

    // 1초마다 타이머 업데이트
    const intervalId = setInterval(updateTimer, 1000);

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseActivity);
    };
  }, [lastActionTime]); // `lastActionTime` 변경될 때마다 타이머 리셋

  // ✅ 남은 시간을 "분:초" 형식으로 변환
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* 헤더 - 남은 시간 표시 */}
      <Header timeRemaining={formattedTime} onLogout={onLogout} />

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
            transition: "margin-left 0.3s ease",
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
