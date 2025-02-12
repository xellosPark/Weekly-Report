// src/components/SidebarLayout/SidebarLayout.tsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./SidebarLayout.module.css";

interface SidebarLayoutProps {
  isMinimized: boolean;
  setIsMinimized: (state: boolean) => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  isMinimized,
  setIsMinimized,
}) => {
  return (
    <aside
      className={`${styles.sidebar} ${isMinimized ? styles.minimized : ""}`}
    >
      <div className={styles.menu}>
        <Link to="/sidebar/DashBoard" className={styles.menuItem}>
          LLM Service
        </Link>
        <Link to="/sidebar/EvalDashBoardFinal" className={styles.menuItem}>
          LLM Ops
        </Link>
        <Link to="/sidebar/view4" className={styles.menuItem}>
          view4
        </Link>
      </div>
      {/* 하단 최소화 버튼 */}
      <div
        className={styles.bottomToggle}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <span className={styles.toggleText}>
          {isMinimized ? "➡" : "⬅ 최소화"}
        </span>
      </div>
    </aside>
  );
};

export default SidebarLayout;
