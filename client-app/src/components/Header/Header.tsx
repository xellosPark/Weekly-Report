import React, { useState } from "react";
import styles from "./Header.module.css"; // CSS 모듈을 import
import { BsRss } from "react-icons/bs";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react"; // 열쇠 아이콘 import
import ChangePassword from "../../pages/LoginPage/ChangePassword";

interface HeaderProps {
  timeRemaining: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ timeRemaining, onLogout }) => {
  const { isAuth, userId, userTeam, userName } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅
  const onHome = () => {
    navigate("/");
  };

  const onChangePassword = () => {
    console.log("비밀번호 변경 클릭됨!");
    setShowChangePassword(true); // 모달 열기
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoCon}>
        <div onClick={onHome}>
          <span className={styles.iconub}>U</span>
          <span className={styles.iconubi}>bi</span>
          <span className={styles.icons}>S</span>
          <span className={styles.iconsam}>am</span>
          <BsRss className={styles.navbarLogoIcon} />
        </div>
      </div>
      {/* styles로 CSS 클래스 적용 */}
      <div className={styles["header-content"]}>
        {/* CSS 모듈에서 클래스를 사용 */}
        <span className={styles["time-remaining"]}>{timeRemaining}</span>
        <label className={styles.huserinfo}>
          {/* 반쪽 사람 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={styles.iconhalfhuman} // ✅ className 수정
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm-7 8v-1a5 5 0 015-5h4a5 5 0 015 5v1a2 2 0 01-2 2H7a2 2 0 01-2-2z"
            />
          </svg>

          {/* 사용자 이름 */}
          <span className={styles.headename}>{isAuth && `${userName} 님`}</span>
        </label>
        <button className={styles["logout-button"]} onClick={onLogout}>
          로그아웃
        </button>
        <button
          className={styles["logout-button"]}
          onClick={onChangePassword}
          aria-label="비밀번호 변경"
        >
          <KeyRound size={20} color="white" />
        </button>
        {/* 💬 비밀번호 변경 모달 */}
        {showChangePassword && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
              <ChangePassword onClose={() => setShowChangePassword(false)} />
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowChangePassword(false)}
                aria-label="모달 닫기"
              >
                ✖
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
