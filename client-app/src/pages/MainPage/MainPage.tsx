import React, { useRef, useState } from "react";
import styles from "./MainPage.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 화살표 아이콘 추가

const MainPage: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 스크롤 이동 함수
  const scroll = (direction: number) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // 이동 거리
      scrollRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // 업무 보고 데이터 (수정 가능)
  const [reportData, setReportData] = useState([
    {
      category: "업무1",
      weeklyPlan: "계획1",
      prevPlan: "계획2",
      prevResult: "실적1",
      completion: "2025.02.10",
      progress: "80%",
      allprogress: "90%",
    },
    {
      category: "업무2",
      weeklyPlan: "계획3",
      prevPlan: "계획4",
      prevResult: "실적2",
      completion: "2025.02.11",
      progress: "60%",
      allprogress: "75%",
    },
  ]);

  // 입력 값 변경 핸들러
  const handleMainChange = (index: number, field: string, value: string) => {
    const newData = [...reportData];
    newData[index] = { ...newData[index], [field]: value };
    setReportData(newData);
  };

  // 드롭다운 데이터
  const weeks = [
    "2025년 1월 1주차",
    "2025년 1월 2주차",
    "2025년 1월 3주차",
    "2025년 1월 4주차",
    "2025년 2월 1주차",
    "2025년 2월 2주차",
  ];

  const [selectedWeek, setSelectedWeek] = useState(weeks[4]); // 기본값: 2월 1주차

  // 상태: 각 칸에 입력된 텍스트를 배열로 저장
  const [infoContent, setInfoContent] = useState("없음");
  const [issueContent, setIssueContent] = useState("없음");
  const [memoContent, setMemoContent] = useState("");

  // 입력 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    type: string
  ) => {
    if (type === "info") setInfoContent(e.target.value);
    if (type === "issue") setIssueContent(e.target.value);
    if (type === "memo") setMemoContent(e.target.value);
  };

  // 파트 선택 드롭다운 데이터
  const parts = ["1파트", "2파트", "3파트"];
  const [selectedPart, setSelectedPart] = useState(parts[0]);

  const handleTextAreaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;

    target.style.height = "30px"; // 최소 높이 초기화
    target.style.height = `${target.scrollHeight}px`; // 입력 내용에 맞게 높이 증가

    // 최대 높이를 초과하면 스크롤 활성화
    if (target.scrollHeight > 150) {
      target.style.overflowY = "auto";
    } else {
      target.style.overflowY = "hidden";
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.section1}>
        {/* 드롭다운 + 제목 + 저장 버튼 (가로 배치) */}
        <div className={styles.topBar}>
          {/* 드롭다운을 왼쪽으로 정렬 */}
          <div className={styles.dropdownContainer}>
            <select
              className={styles.dropdown}
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
            >
              {parts.map((part, index) => (
                <option key={index} value={part}>
                  {part}
                </option>
              ))}
            </select>

            <select
              className={styles.dropdown}
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {weeks.map((week, index) => (
                <option key={index} value={week}>
                  {week}
                </option>
              ))}
            </select>
          </div>

          {/* 제목을 가운데 정렬 */}
          <h3 className={styles.title}>{selectedWeek} 업무보고</h3>

          {/* 저장 버튼을 오른쪽으로 정렬 */}
          <button className={styles.saveButton}>ADD</button>
        </div>

        {/* 업무보고 테이블 */}
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th rowSpan={2} className={styles.header}>
                구분
              </th>
              <th colSpan={1} className={styles.weeklyReport}>
                2025년 2월 1주차 (2/3일 ~ 7일)
              </th>

              <th colSpan={2} className={styles.prevWeek}>
                2025년 1월 4주차 (1/20일 ~ 24일)
              </th>
              <th rowSpan={1} className={styles.Completion}>
                완료예정일
              </th>
              <th colSpan={2} className={styles.Progress}>
                달성율
              </th>
            </tr>
            <tr>
              <th className={styles.weeklyReport}>계획업무</th>
              <th className={styles.prevWeek}>계획업무</th>
              <th className={styles.prevWeek}>수행실적</th>
              <td className={styles.Completion}>(yyyy.mm.dd)</td>
              <td className={styles.Progress}>금주</td>
              <td className={styles.Progress}>전체</td>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index}>
                <td className={styles.mainscrollableCell}>
                  <textarea
                    className={styles.MaintextArea}
                    value={row.category}
                    onChange={(e) =>
                      handleMainChange(index, "category", e.target.value)
                    }
                    onInput={handleTextAreaResize} // 높이 자동 조절
                  />
                </td>
                <td className={styles.mainscrollableCell}>
                  <textarea
                    className={styles.MaintextArea}
                    value={row.weeklyPlan}
                    onChange={(e) =>
                      handleMainChange(index, "weeklyPlan", e.target.value)
                    }
                    onInput={handleTextAreaResize}
                  />
                </td>
                <td className={styles.mainscrollableCell}>
                  <textarea
                    className={styles.MaintextArea}
                    value={row.prevPlan}
                    onChange={(e) =>
                      handleMainChange(index, "prevPlan", e.target.value)
                    }
                    onInput={handleTextAreaResize}
                  />
                </td>
                <td className={styles.mainscrollableCell}>
                  <textarea
                    className={styles.MaintextArea}
                    value={row.prevResult}
                    onChange={(e) =>
                      handleMainChange(index, "prevResult", e.target.value)
                    }
                    onInput={handleTextAreaResize}
                  />
                </td>
                <td className={styles.mainscrollableCell}>
                  <textarea
                    className={styles.MaintextArea}
                    value={row.completion}
                    onChange={(e) =>
                      handleMainChange(index, "completion", e.target.value)
                    }
                    onInput={handleTextAreaResize}
                  />
                </td>
                <td className={styles.mainscrollableCell}>
                  <textarea
                    className={styles.MaintextArea}
                    value={row.progress}
                    onChange={(e) =>
                      handleMainChange(index, "progress", e.target.value)
                    }
                    onInput={handleTextAreaResize}
                  />
                </td>
                <td className={styles.mainscrollableCell}>
                  <textarea
                    className={styles.MaintextArea}
                    value={row.allprogress}
                    onChange={(e) =>
                      handleMainChange(index, "allprogress", e.target.value)
                    }
                    onInput={handleTextAreaResize}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* /////////////////////////////////////////////////////////// */}
      {/* <div className={styles.section2}>
        왼쪽 화살표 버튼 (항상 보이도록 설정)
        <button
          className={`${styles.scrollButton} ${styles.leftButton}`}
          onClick={() => scroll(-1)}
        >
          <FaChevronLeft />
        </button>
        <div className={styles.cardContainer} ref={scrollRef}>
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
        <button
          className={`${styles.scrollButton} ${styles.rightButton}`}
          onClick={() => scroll(1)}
        >
          <FaChevronRight />
        </button>
      </div> */}
      <div className={styles.section2}>
        {/* 정보보고 테이블 */}
        <table className={styles.infoTable}>
          <tbody>
            <tr>
              <th className={styles.infoHeader}>정보보고</th>
              <td className={styles.scrollableCell}>
                <textarea
                  className={styles.textArea}
                  value={infoContent}
                  onChange={(e) => handleInputChange(e, "info")}
                />
              </td>
              <th className={styles.issueHeader}>이슈</th>
              <td className={styles.scrollableCell}>
                <textarea
                  className={styles.textArea}
                  value={issueContent}
                  onChange={(e) => handleInputChange(e, "issue")}
                />
              </td>
              <th className={styles.memoHeader}>메모</th>
              <td className={styles.scrollableCell}>
                <textarea
                  className={styles.textArea}
                  value={memoContent}
                  onChange={(e) => handleInputChange(e, "memo")}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MainPage;
