import React, { useRef, useState } from "react";
import styles from "./MainPage.module.css";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 화살표 아이콘 추가

const MainPage: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 스크롤 이동 함수 (좌우 스크롤)
  const scroll = (direction: number) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // 이동 거리 설정
      scrollRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // 업무 보고 데이터 (테이블 row)
  const [reportData, setReportData] = useState([
    {
      category: "",
      weeklyPlan: "",
      prevPlan: "",
      prevResult: "",
      completion: "202 . . ",
      progress: "0%",
      allprogress: "0%",
    },
  ]);

  // 새로운 행 추가 함수
  const handleAddRow = () => {
    setReportData([
      ...reportData,
      {
        category: "",
        weeklyPlan: "",
        prevPlan: "",
        prevResult: "",
        completion: "202 . . ",
        progress: "0%",
        allprogress: "0%",
      },
    ]);
  };

  // 입력값 변경 핸들러 (각 행에서 값 변경)
  const handleMainChange = (index: number, field: string, value: string) => {
    const newData = [...reportData];
    newData[index] = { ...newData[index], [field]: value };
    setReportData(newData);
  };

  // 주차 계산 함수 (월별로 1주차부터 시작)
  const getWeekNumberInMonth = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const pastDaysOfMonth = date.getDate() - 1; // 현재 날짜에서 1을 빼서 첫째 날부터 시작
    return Math.floor((pastDaysOfMonth + firstDayOfMonth.getDay()) / 7) + 1;
  };

  // 현재 날짜 기준 최근 6주 주차 생성
  const generateWeeks = () => {
    const today = new Date();
    let weeksArray = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i * 7); // 과거 주차로 이동

      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1; // 월은 0부터 시작하므로 +1
      const weekNumber = getWeekNumberInMonth(targetDate);

      weeksArray.push(`${year}년 ${month}월 ${weekNumber}주차`);
    }

    return weeksArray;
  };

  // 주차 드롭다운 데이터
  const weeks = generateWeeks();

  // // 주차 드롭다운 데이터
  // const weeks = [
  //   "2025년 1월 1주차",
  //   "2025년 1월 2주차",
  //   "2025년 1월 3주차",
  //   "2025년 1월 4주차",
  //   "2025년 2월 1주차",
  //   "2025년 2월 2주차",
  // ];

  // 기본 선택값: 2025년 2월 1주차
  const [selectedWeek, setSelectedWeek] = useState(weeks[4]);

  // 파트 선택 드롭다운 데이터
  const parts = ["자동화파트", "로봇파트", "팀장"];
  const [selectedPart, setSelectedPart] = useState(parts[0]);

  // 정보보고, 이슈, 메모 입력값 상태
  const [infoContent, setInfoContent] = useState("없음");
  const [issueContent, setIssueContent] = useState("없음");
  const [memoContent, setMemoContent] = useState("없음");

  // 정보보고, 이슈, 메모 입력 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    type: string
  ) => {
    if (type === "info") setInfoContent(e.target.value);
    if (type === "issue") setIssueContent(e.target.value);
    if (type === "memo") setMemoContent(e.target.value);
  };

  // textarea 높이 자동 조절 함수
  const handleTextAreaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;

    target.style.height = "30px"; // 최소 높이 설정
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
        {/* 드롭다운 + 제목 + 저장 버튼 (가로 정렬) */}
        <div className={styles.topBar}>
          {/* 드롭다운을 왼쪽 정렬 */}
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

          <div>
            {/* 행 추가 버튼 */}
            <button className={styles.addButton} onClick={handleAddRow}>
              Add
            </button>
            {/* 저장 버튼 */}
            <button className={styles.saveButton}>Save</button>
          </div>
        </div>

        {/* 업무보고 테이블 */}
        <div className={styles.reportTableContainer}>
          <table className={styles.reportTable}>
            <thead>
              <tr>
                <th rowSpan={2} className={styles.header}>
                  구분
                </th>
                <th colSpan={1} className={styles.weeklyReport}>
                  {selectedWeek}
                </th>
                <th colSpan={2} className={styles.prevWeek}>
                  {selectedWeek}
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
                <th className={styles.Completion}>(yyyy.mm.dd)</th>
                <th className={styles.Progress}>금주</th>
                <th className={styles.Progress}>전체</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).map((field) => (
                    <td
                      key={field}
                      className={
                        field === "progress" ||
                        field === "allprogress" ||
                        field === "completion"
                          ? `${styles.mainscrollableCell} ${styles.PlainTextCell}`
                          : styles.mainscrollableCell
                      }
                    >
                      {field === "progress" ||
                      field === "allprogress" ||
                      field === "completion" ? (
                        row[field as keyof typeof row]
                      ) : (
                        <textarea
                          className={styles.MaintextArea}
                          value={row[field as keyof typeof row]}
                          onChange={(e) =>
                            handleMainChange(index, field, e.target.value)
                          }
                          onInput={handleTextAreaResize} // 높이 자동 조절
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 정보보고, 이슈, 메모 입력 */}
      <div className={styles.section2}>
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
