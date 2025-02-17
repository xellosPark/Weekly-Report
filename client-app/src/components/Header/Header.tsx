import React from "react";
import styles from "./Header.module.css"; // CSS 모듈을 import

interface HeaderProps {
  timeRemaining: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ timeRemaining, onLogout }) => {
  return (
    <header className={styles.header}>
      {/* styles로 CSS 클래스 적용 */}
      <div className={styles["header-content"]}>
        {/* CSS 모듈에서 클래스를 사용 */}
        <span className={styles["time-remaining"]}>{timeRemaining}</span>
        <button className={styles["logout-button"]} onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default Header;
