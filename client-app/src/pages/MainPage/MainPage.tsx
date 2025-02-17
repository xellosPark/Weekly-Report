import React, { useEffect, useRef, useState } from "react";
import styles from "./MainPage.module.css";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 화살표 아이콘 추가

const MainPage: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [weeks, setWeeks] = useState<number[]>(
    Array.from({ length: 52 }, (_, i) => i + 1)
  ); // 1~52주 배열
  const [currentWeek, setCurrentWeek] = useState<number | null>(null); // 현재 주차 저장
  const [previousWeek, setPreviousWeek] = useState<number | null>(null); // 이전 주차 저장
  const [recentWeeks, setRecentWeeks] = useState<(number | string)[]>([]); // 최근 6주 저장

  // 파트 선택 드롭다운 데이터
  const parts = ["자동화파트", "로봇파트", "팀장"];
  const [selectedPart, setSelectedPart] = useState(parts[0]);

  // 정보보고, 이슈, 메모 입력값 상태
  const [infoContent, setInfoContent] = useState("없음");
  const [issueContent, setIssueContent] = useState("없음");
  const [memoContent, setMemoContent] = useState("없음");

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

  // 현재 날짜 기준으로 주차를 계산하는 함수
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);

    // 첫 번째 월요일 찾기
    const firstMonday = new Date(firstDayOfYear);
    firstMonday.setDate(
      firstDayOfYear.getDate() + ((1 - firstDayOfYear.getDay() + 7) % 7)
    );

    // 현재 날짜와 첫 번째 월요일 사이의 차이를 밀리초 단위로 계산
    const diff: number = date.getTime() - firstMonday.getTime(); // getTime()으로 명확하게 숫자로 변환

    // 1주일(7일)을 기준으로 몇 번째 주인지 계산
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  };

  // 테스트 실행
  console.log(getWeekNumber(new Date())); // 현재 주차 출력

  // 특정 주차가 몇 월 몇 주인지 계산하는 함수
  const getMonthWeekLabel = (weekNumber: number): string => {
    // 1월 1일부터 주차를 나누어 월을 계산
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
    const targetDate = new Date(firstDayOfYear);
    targetDate.setDate(firstDayOfYear.getDate() + (weekNumber - 1) * 7);

    const month: number = targetDate.getMonth() + 1; // 월 (0부터 시작이므로 +1)
    const weekOfMonth: number = Math.ceil(targetDate.getDate() / 7); // 해당 월의 몇 번째 주인지 계산

    return `${month}월 ${weekOfMonth}주차`;
  };

  useEffect(() => {
    const weekNow: number = getWeekNumber(new Date()); // 현재 주차 계산
    setCurrentWeek(weekNow);
    setPreviousWeek(weekNow > 1 ? weekNow + 1 : null); // 이전 주차 설정 (1주차일 경우 null)

    // 현재 주차 기준으로 최근 6주 찾기 (숫자가 아닌 "2월 3주차" 형식으로 변환)
    const last6Weeks: string[] = weeks
      .filter((week) => week <= weekNow) // 현재 주차 이하만 필터링
      .slice(-6) // 최근 6주 선택
      .map((week) => getMonthWeekLabel(week)); // 숫자를 "X월 Y주차" 형식으로 변환

    setRecentWeeks(last6Weeks); // 변환된 최근 6주를 저장
  }, [weeks]);

  // 주차 드롭다운 데이터
  const sixweeks = recentWeeks;

  // // 주차 드롭다운 데이터
  // const weeks = [
  //   "2025년 1월 1주차",
  //   "2025년 1월 2주차",
  //   "2025년 1월 3주차",
  //   "2025년 1월 4주차",
  //   "2025년 2월 1주차",
  //   "2025년 2월 2주차",
  // ];

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

  // "2월 1주차" 형식에서 주차 숫자로 변환하는 함수
  const parseWeekLabelToNumber = (label: string): number | null => {
    const match = label.match(/\d+/g); // 숫자만 추출 (예: ["2", "1"] for "2월 1주차")
    return match && match.length === 2
      ? (parseInt(match[0]) - 1) * 4 + parseInt(match[1])
      : null;
  };

  // 드롭다운 변경 시 주차 업데이트
  const handleWeekChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = event.target.value;
    const selectedWeek = parseWeekLabelToNumber(selectedLabel);

    if (selectedWeek !== null) {
      setCurrentWeek(selectedWeek); // 선택한 주차 업데이트
      setPreviousWeek(selectedWeek + 1); // 선택한 주차 + 1 업데이트
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
              value={currentWeek !== null ? getMonthWeekLabel(currentWeek) : ""}
              onChange={handleWeekChange}
            >
              {sixweeks.map((week, index) => (
                <option key={index} value={week}>
                  {week}
                </option>
              ))}
            </select>
          </div>

          {/* 제목을 가운데 정렬 */}
          <h3 className={styles.title}>
            {currentWeek !== null ? getMonthWeekLabel(currentWeek) : ""}{" "}
            업무보고
          </h3>

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
                  {previousWeek !== null ? getMonthWeekLabel(previousWeek) : ""}
                </th>
                <th colSpan={2} className={styles.prevWeek}>
                  {currentWeek !== null ? getMonthWeekLabel(currentWeek) : ""}
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
                    <td key={field} className={styles.mainscrollableCell}>
                      {field === "progress" ||
                      field === "allprogress" ||
                      field === "completion" ? (
                        <input
                          type="text"
                          className={styles.inputField}
                          value={row[field as keyof typeof row]}
                          onChange={(e) =>
                            handleMainChange(index, field, e.target.value)
                          }
                        />
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
