// src/pages/MainPage/MainPage.tsx
import React from "react";
import styles from "./MainPage.module.css";

const MainPage: React.FC = () => {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.section1}>
        <h2>메인화면 1 - 1</h2>
        <p>이곳은 첫 번째 섹션입니다.</p>
      </div>

      <div className={`${styles.section2}`}>
        <div className={styles.cardContainer}>
          {/* 카드 5개 반복 생성 */}
          {[...Array(6)].map((_, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.profileIcon}>👤</div>
                <span className={styles.userName}>2월 1주차</span>
              </div>
              <div className={styles.cardContent}>로봇자동화파트</div>
              <div className={styles.cardFooter}>
                <span>📅 2022.04.08 22:46</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
