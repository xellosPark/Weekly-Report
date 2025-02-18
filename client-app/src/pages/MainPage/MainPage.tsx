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
  const [nextWeek, setNextWeek] = useState<number | null>(null); // 추가할 수 있는 주차 저장장
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null); // 선택한 주차 저장장
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [nextWeekCheck, setNextWeekCheck] = useState<number | null>(null); // 추가할 수 있는 주차 저장장

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
  //console.log(getWeekNumber(new Date())); // 현재 주차 출력

  // 특정 주차가 몇 월 몇 주인지 계산하는 함수
  const getMonthWeekLabel = (weekNumber: number): string => {
    // 1월 1일부터 주차를 나누어 월을 계산
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
    const targetDate = new Date(firstDayOfYear);
    targetDate.setDate(firstDayOfYear.getDate() + (weekNumber - 1) * 7);

    const month: number = targetDate.getMonth() + 1; // 월 (0부터 시작이므로 +1)
    const weekOfMonth: number = Math.ceil(targetDate.getDate() / 7); // 해당 월의 몇 번째 주인지 계산

    // ✅ 변환 과정 디버깅 로그 추가
    // console.log(`🟢 변환 과정 - 입력 주차: ${weekNumber}`);
    // console.log(`📆 기준 날짜: ${targetDate.toISOString().split("T")[0]}`);
    // console.log(`✅ 변환된 월: ${month}, 변환된 주차: ${weekOfMonth}`);
    // console.log(`🎯 최종 결과: ${month}월 ${weekOfMonth}주차`);

    return `${month}월 ${weekOfMonth}주차`;
  };

  // ✅ 기존 `useEffect` 업데이트: 새로운 주차가 드롭다운에 반영되도록 변경
  useEffect(() => {
    const dateNow = new Date();
    const weekNow = getWeekNumber(dateNow);
    const yearNow = dateNow.getFullYear();

    console.log("📅 현재 날짜:", dateNow);
    console.log("📆 현재 주차 (weekNow):", weekNow);

    if (yearNow !== currentYear) {
      // ✅ 연도 변경 시 48~52주차 + 새로운 1주차 유지
      setCurrentYear(yearNow);
      setRecentWeeks([48, 49, 50, 51, 52, 1]);
    } else {
      // ✅ 최근 6주 유지 + 새로 추가된 주차 포함
      setRecentWeeks((prevWeeks) => {
        const last6Weeks = [];
        for (let i = 5; i >= 0; i--) {
          let weekNum = weekNow - i;
          if (weekNum <= 0) weekNum += 52; // ✅ 1주차 이전이면 52주차로 변환
          last6Weeks.push(weekNum);
        }
        return [...new Set([...last6Weeks, ...prevWeeks])]; // ✅ 중복 방지
      });
    }

    setCurrentWeek(weekNow);
    setSelectedWeek(weekNow);
    checkNextWeekAvailable();
  }, []);

  // 🔹 `selectedWeek` 변경 시 `previousWeek`, `nextWeek` 업데이트
  useEffect(() => {
    if (selectedWeek !== null) {
      setCurrentWeek(selectedWeek);
      setPreviousWeek(selectedWeek > 1 ? selectedWeek - 1 : 52);
      setNextWeek(selectedWeek < 52 ? selectedWeek + 1 : 1);
    }
  }, [selectedWeek]);

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

  // ✅ 다음 주차를 생성할 수 있는지 확인하는 함수
  const checkNextWeekAvailable = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일 ~ 6: 토요일
    if (dayOfWeek === 1) {
      setNextWeekCheck(currentWeek! + 1);
    } else {
      setNextWeekCheck(null);
    }
  };

  // ✅ 새로운 주차 추가하는 함수
  const handleNewSheet = () => {
    const dateNow = new Date();
    const weekNow = getWeekNumber(dateNow);
    console.log("🔹 실제 주차:", weekNow);

    const nextWeek: number = weekNow < 52 ? weekNow + 1 : 1; // 52주차 이후면 1주차로 순환

    console.log("🔹 다음 추가 가능한 주차:", nextWeek);

    // ✅ `nextWeek`가 이미 추가되지 않았을 경우에만 추가
    setRecentWeeks((prevWeeks) => {
      const updatedWeeks = prevWeeks.map((week) => Number(week)); // `number[]` 변환

      if (!updatedWeeks.includes(nextWeek)) {
        console.log("✅ 새로운 주차 추가됨:", nextWeek);
        return [...prevWeeks, nextWeek]; // ✅ 맨 아래에 추가
      } else {
        console.log("⚠️ 이미 추가된 주차입니다.");
        alert("이미 추가된 주차입니다.");
        return prevWeeks; // 변경 없음
      }
    });

    // ✅ 드롭다운 선택값을 `nextWeek`로 변경
    setSelectedWeek(nextWeek);

    // ✅ `reportData` 초기화: 테이블을 기본 값으로 유지
    setReportData([
      {
        category: "",
        weeklyPlan: ``,
        prevPlan: ``,
        prevResult: "",
        completion: "202 . . ",
        progress: "0%",
        allprogress: "0%",
      },
    ]);
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
              value={selectedWeek || ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedWeek(Number(e.target.value))
              }
            >
              {recentWeeks.map((week, index) => (
                <option key={index} value={week}>
                  {`${week}주 (${getMonthWeekLabel(Number(week))})`}
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
            <button className={styles.addButton} onClick={handleNewSheet}>
              New
            </button>
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
                  {nextWeek !== null ? getMonthWeekLabel(nextWeek) : ""}
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
