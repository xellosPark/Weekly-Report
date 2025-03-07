import React, {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./MainPage.module.css";
import axios from "axios";
import api from "../../utils/api";
import { EditBoard, LoadBoard, SaveBoard } from "../../utils/boardApi";
import { useAuth } from "../../context/AuthContext";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 화살표 아이콘 추가

const MainPage: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  interface Board {
    id: number;
    part: number;
    title: string;
    category: string;
    currentWeekPlan: string;
    previousWeekPlan: string;
    performance: string;
    completionDate: string;
    achievementRate: string;
    totalRate: string;
    report: string;
    issue: string;
    memo: string;
  }

  interface ContextMenuState {
    mouseX: number;
    mouseY: number;
  }

  const [weeks, setWeeks] = useState<number[]>(
    Array.from({ length: 52 }, (_, i) => i + 1)
  ); // 1~52주 배열
  const [currentWeek, setCurrentWeek] = useState<number | null>(null); // 현재 주차 저장
  const [previousWeek, setPreviousWeek] = useState<number | null>(null); // 이전 주차 저장
  const [recentWeeks, setRecentWeeks] = useState<(number | string)[]>([]); // 최근 6주 저장
  const [nextWeek, setNextWeek] = useState<number | null>(null); // 추가할 수 있는 주차 저장장
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null); // 선택한 주차 저장장
  const [copiedWeek, setCopiedWeek] = useState<number | null>(null); // 선택한 주차 저장장
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [nextWeekCheck, setNextWeekCheck] = useState<number | null>(null); // 추가할 수 있는 주차 저장장

  // 파트 선택 드롭다운 데이터
  //const parts = ["자동화파트", "로봇파트", "팀장"];
  const parts: { label: string; value: number }[] = [
    { label: "자동화파트", value: 1 },
    { label: "로봇파트", value: 2 },
    { label: "팀장", value: 10 },
  ];

  const [selectedPart, setSelectedPart] = useState<{
    label: string;
    value: number;
  }>(parts[0]);
  // ✅ useState의 초기 타입을 명시적으로 지정
  const [filteredParts, setFilteredParts] = useState<
    { label: string; value: number }[]
  >([]);

  // 정보보고, 이슈, 메모 입력값 상태
  const [infoContent, setInfoContent] = useState("");
  const [issueContent, setIssueContent] = useState("");
  const [memoContent, setMemoContent] = useState("");

  const [isBoardLoaded, setIsBoardLoaded] = useState(false); // loadBoard 완료 여부
  const [data, setData] = useState<Board[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [selectOriginalData, setSelectOriginalData] = useState<Board>();
  const { isAuth, userId, userTeam, logout } = useAuth();
  // 우클릭 메뉴 상태
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const [error, fetchDataAction, isPending] = useActionState<
    Error | null,
    void
  >(async () => {
    //console.log('load board', userId, userTeam);

    try {
      const result = await LoadBoard(userId, userTeam);
      setData(result); // API 데이터를 직접 useState에 저장
      setIsBoardLoaded(true);
    } catch (error) {
      return error as Error; // 명확한 에러 타입 캐스팅
    }
    return null; // 에러가 없을 경우 null 반환
  }, null);

  // 우클릭 이벤트 핸들러
  const handleContextMenu = (event: React.MouseEvent<HTMLTableElement>) => {
    event.preventDefault(); // 기본 우클릭 메뉴 방지
    const target = event.target as HTMLElement;

    // 우클릭한 요소가 <thead> 내부라면 컨텍스트 메뉴 표시 안 함
    if (target.closest("thead")) {
      setContextMenu(null);
      return;
    }

    // 우클릭 위치 저장 후 삭제 버튼 표시
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  // 마지막 행 삭제 함수
  const handleDeleteLastRow = () => {
    if (reportData.length === 1) return; // 최소 1개는 유지

    // 기본 행 데이터 (초기값)
    const defaultRow = {
      category: "",
      weeklyPlan: "",
      prevPlan: "",
      prevResult: "",
      completion: "202 . . ",
      progress: "0",
      allprogress: "0",
    };

    const lastRow = reportData[reportData.length - 1];

    // 마지막 행이 초기값과 다른지 확인
    const hasChanges = JSON.stringify(lastRow) !== JSON.stringify(defaultRow);

    if (hasChanges) {
      const confirmDelete = window.confirm(
        "작성된 내용이 있습니다. 지우시겠습니까?"
      );
      if (!confirmDelete) {
        setContextMenu(null); // 메뉴 닫기
        return;
      }
    }

    setReportData(reportData.slice(0, -1)); // 마지막 행 삭제
    setContextMenu(null); // 메뉴 닫기
  };

  // 🔹 마우스 클릭 시 메뉴 닫기 (우클릭 메뉴 외 다른 곳 클릭 시 숨김)
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // 🔹 마우스 클릭 이벤트 등록 (마운트 시 추가, 언마운트 시 정리)
  useEffect(() => {
    document.addEventListener("click", handleCloseContextMenu);
    return () => {
      document.removeEventListener("click", handleCloseContextMenu);
    };
  }, []);

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
      progress: "0",
      allprogress: "0",
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
        progress: "0",
        allprogress: "0",
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
    //🔹 LocalStorage에서 'team' 값 가져오기 (문자열을 숫자로 변환)
    //const team = userTeam;//Number(localStorage.getItem("userTeam"));
    //console.log('team 변경되었을때 탄다', team);

    const dateNow = new Date();
    const weekNow = getWeekNumber(dateNow);
    const yearNow = dateNow.getFullYear();

    //console.log("📅 현재 날짜:", dateNow);
    //console.log("📆 현재 주차 (weekNow):", weekNow);

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
    setCopiedWeek(weekNow);
    checkNextWeekAvailable();

    //🔹 team 값에 따라 필터링
    if (userTeam === 10) {
      //console.log('진행', team);
      setFilteredParts(parts); // 모든 파트 표시
      setSelectedPart(parts[parts.length - 1]);
    } else if (userTeam === 0) {
      return;
    } else {
      //console.log('진행', team);
      const filtered = parts.filter((part) => part.value === userTeam);
      //console.log('filtered', filtered);

      setFilteredParts(
        filtered.length > 0 ? filtered : [{ label: "선택 없음", value: -1 }]
      );
      setSelectedPart(filtered[0]);
    }
    startTransition(() => {
      fetchDataAction();
    });
  }, [isAuth]);

  // 🔹 `selectedWeek` 변경 시 `previousWeek`, `nextWeek` 업데이트
  useEffect(() => {
    if (selectedWeek !== null) {
      setCurrentWeek(selectedWeek);
      setPreviousWeek(selectedWeek > 1 ? selectedWeek - 1 : 52);
      setNextWeek(selectedWeek < 52 ? selectedWeek + 1 : 1);
    }
  }, [selectedWeek]);

  useEffect(() => {
    if (!isBoardLoaded || !currentWeek) return;

    const loadData = data.filter(
      (data) =>
        data.title === getMonthWeekLabel(currentWeek) &&
        data.part === selectedPart.value
    );

    if (loadData.length === 0) {
      setReportData([
        {
          category: "",
          weeklyPlan: "",
          prevPlan: "",
          prevResult: "",
          completion: "202 . . ",
          progress: "0",
          allprogress: "0",
        },
      ]);
      setInfoContent("");
      setIssueContent("");
      setMemoContent("");
      setIsEdit(true);

      return; // 데이터가 없으면 실행 중지
    }

    const transformedData = transData(loadData[0]);

    // 변환된 데이터를 setReportData에 저장
    setReportData(transformedData);

    setInfoContent(loadData[0].report);
    setIssueContent(loadData[0].issue);
    setMemoContent(loadData[0].memo);

    setSelectOriginalData(loadData[0]);
    setIsEdit(false);
  }, [currentWeek, isBoardLoaded, selectedPart]);

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

  const OnSave = async () => {
    console.log("OnSave reportData", reportData);
    const isConfirmed = window.confirm("저장하시겠습니까?");

    if (!isConfirmed) {
      return;
    }
    const board = {
      title: currentWeek !== null ? getMonthWeekLabel(currentWeek) : "",
      category: reportData.map((obj) => obj.category).join("^^"),
      currentWeekPlan: reportData.map((obj) => obj.weeklyPlan).join("^^"),
      previousWeekPlan: reportData.map((obj) => obj.prevPlan).join("^^"),
      performance: reportData.map((obj) => obj.prevResult).join("^^"),
      completionDate: reportData.map((obj) => obj.completion).join("^^"),
      achievementRate: reportData.map((obj) => obj.progress).join("^^"),
      totalRate: reportData.map((obj) => obj.allprogress).join("^^"),
      report: infoContent,
      issue: issueContent,
      memo: memoContent,
    };

    console.log("API 요청 데이터:", JSON.stringify(board, null, 2));

    const response = await SaveBoard(board);
    alert(response);

    const result = await LoadBoard(userId, userTeam);
    setData(result); // API 데이터를 직접 useState에 저장
    setIsBoardLoaded(true);
    //alert("save 후 자동 로그아웃 처리됨");
    //logout();
  };

  const OnEdit = async () => {
    // if (selectOriginalData?.part !== userTeam) {
    //   console.log('파트가 틀립니다', selectOriginalData);
    //   return;
    // }

    const board = {
      category: reportData.map((obj) => obj.category).join("^^"),
      currentWeekPlan: reportData.map((obj) => obj.weeklyPlan).join("^^"),
      previousWeekPlan: reportData.map((obj) => obj.prevPlan).join("^^"),
      performance: reportData.map((obj) => obj.prevResult).join("^^"),
      completionDate: reportData.map((obj) => obj.completion).join("^^"),
      achievementRate: reportData.map((obj) => obj.progress).join("^^"),
      totalRate: reportData.map((obj) => obj.allprogress).join("^^"),
      report: infoContent,
      issue: issueContent,
      memo: memoContent,
    };

    console.log("API 요청 데이터:", JSON.stringify(board, null, 2));
    //console.log('select id', selectOriginalData?.id);
    const response = await EditBoard(board, selectOriginalData?.id);
    alert(response);
    //console.log('Edit response', response);
  };

  const onCopyAndPaste = async () => {
    if (currentWeek === 0)
    return;
    //console.log('선택 주차', copiedWeek);
    const isConfirmed = window.confirm("이전 주차의 내용으로 업데이트 하시겠습니까? 진행시 작성된 내용이 사라집니다.");

    if (!isConfirmed) {
      alert('취소되었습니다.');
      return;
    }

    const title = getMonthWeekLabel(Number((currentWeek || 0) - 1));
    const filterData = data.filter((data) => data.title === title && data.part === userTeam);
    console.log('filterData', filterData, userTeam);
    if (recentWeeks[recentWeeks.length - 1] !== currentWeek) {
      alert('이전 주차에는 붙여넣기가 안됩니다');
      return;
    }
    if (filterData.length <= 0) {
      alert('해당 주차의 데이터가 없습니다');
      return;
    }

    const transformedData = transData(filterData[0]);

    // 변환된 데이터를 setReportData에 저장
    setReportData(transformedData);

    setInfoContent(filterData[0].report);
    setIssueContent(filterData[0].issue);
    setMemoContent(filterData[0].memo);

    setSelectOriginalData(filterData[0]);
  }

  const transData = (loadData:Board) => {

    // ✅ 쉼표(,)로 구분된 데이터를 개별 배열로 변환
    const categories = loadData.category
      .split("^^")
      .map((item) => item.trim());
    const weeklyPlan = loadData.currentWeekPlan
      .split("^^")
      .map((item) => item.trim());
    const prevPlan = loadData.previousWeekPlan
      .split("^^")
      .map((item) => item.trim());
    const prevResult = loadData.performance
      .split("^^")
      .map((item) => item.trim());
    const completion = loadData.completionDate
      .split("^^")
      .map((item) => item.trim());
    const progress = loadData.achievementRate
      .split("^^")
      .map((item) => item.trim());
    const allprogress = loadData.totalRate
      .split("^^")
      .map((item) => item.trim());

    // ✅ 배열을 순회하면서 개별 객체 생성
    const transformedData = categories.map((_, index) => ({
      category: categories[index] || "",
      weeklyPlan: weeklyPlan[index] || "",
      prevPlan: prevPlan[index] || "",
      prevResult: prevResult[index] || "",
      completion: completion[index] || "",
      progress: progress[index] || "",
      allprogress: allprogress[index] || "",
    }));

    return transformedData;
  }

  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>(
    {}
  );

  // Textarea 높이 조절 함수
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "30px"; // 기존 높이 초기화
    textarea.style.height = textarea.scrollHeight + "px"; // 입력 내용에 맞게 조절
  };

  // 데이터 로드시 자동으로 높이 조절
  useEffect(() => {
    Object.keys(textareaRefs.current).forEach((key) => {
      if (textareaRefs.current[key]) {
        adjustTextareaHeight(textareaRefs.current[key] as HTMLTextAreaElement);
      }
    });
  }, [reportData]); // reportData 변경 시 실행

  return (
    <div className={styles.mainContainer}>
      <div className={styles.section1}>
        {/* 드롭다운 + 제목 + 저장 버튼 (가로 정렬) */}
        <div className={styles.topBar}>
          {/* 드롭다운을 왼쪽 정렬 */}
          <div className={styles.dropdownContainer}>
            <select
              className={styles.dropdown}
              value={selectedPart?.value}
              onChange={(e) => {
                const selectedValue = Number(e.target.value); // string -> number 변환
                const selected = parts.find(
                  (part) => part.value === selectedValue
                );
                if (selected) {
                  setSelectedPart(selected); // 선택된 값 설정
                  setSelectedWeek(Number(recentWeeks[recentWeeks.length - 1]));
                }
              }}
            >
              {filteredParts.map((part, index) => (
                <option key={part.value} value={part.value}>
                  {part.label}
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
            {userTeam === selectedPart.value && 
            <>
            {/* <select
              className={styles.dropdown}
              value={copiedWeek || ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setCopiedWeek(Number(e.target.value))
              }
            >
              {recentWeeks.map((week, index) => (
                <option key={index} value={week}>
                  {`${week}주 (${getMonthWeekLabel(Number(week))})`}
                </option>
              ))}
            </select> 
            <button className={styles.addButton} onClick={onCopyAndPaste}>주차 붙여 넣기</button> */}
            </>
            }
          </div>

          <div>
            {/* 행 추가 버튼 */}
            {/* <button className={styles.addButton} onClick={handleNewSheet}>
              New
            </button> */}
            {/* 행 추가 버튼 */}
            <button className={styles.addButton} onClick={onCopyAndPaste}>전 주차 붙여 넣기</button>
            {selectedPart.value === userTeam && (
              <button className={styles.addButton} onClick={handleAddRow}>
                Row Add
              </button>
            )}

            {/* 저장 버튼 */}
            {selectedPart.value === userTeam && (
              <button className={styles.saveButton} onClick={OnSave}>
                Save
              </button>
            )}

            {/* {
              isEdit ? ( <button className={styles.saveButton} onClick={OnSave}>Save</button>) : (
                <button className={styles.saveButton} onClick={OnEdit}>Edit</button>)
            } */}
          </div>
        </div>

        {isPending && <p>⏳ 데이터를 불러오는 중...</p>}

        {/* 에러 발생 시 표시 */}
        {error?.message && <p style={{ color: "red" }}>⚠️ {error.message}</p>}

        {/* 업무보고 테이블 */}
        {/* {data.length > 0 ? ( */}
        <div className={styles.reportTableContainer}>
          <table
            className={styles.reportTable}
            onContextMenu={handleContextMenu} // 테이블에서 우클릭 감지
            style={{ border: "1px solid black", width: "100%" }}
          >
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
              {reportData.map((row, index) => {
                
                
                const isCompleted = row.progress === "100" && row.allprogress === "100";
                console.log('row', row.progress, row.allprogress, isCompleted);
                return (
                <tr key={index} style={{ backgroundColor: isCompleted ? "#bfeeb3" : "transparent" }}>
                  {Object.keys(row).map((field, colIndex) => (
                    <td
                      key={field}
                      className={styles.mainscrollableCell}
                      contentEditable={false}
                    >
                      {field === "progress" ||
                      field === "allprogress" ||
                      field === "completion" ? (
                        <div style={{ display: "flex" }}>
                          <input
                            style={{
                              color: "black",
                              // cursor:
                              //   recentWeeks[recentWeeks.length - 1] !==
                              //     currentWeek || userTeam !== selectedPart.value
                              //     ? "not-allowed"
                              //     : "text",
                            }}
                            type="text"
                            className={styles.inputField}
                            value={row[field as keyof typeof row]}
                            onChange={(e) =>
                              handleMainChange(index, field, e.target.value)
                            }
                            // disabled={
                            //   recentWeeks[recentWeeks.length - 1] !==
                            //     currentWeek || userTeam !== selectedPart.value
                            // }
                          />
                          {(field === "progress" ||
                            field === "allprogress") && (
                            <span style={{ marginRight: "2px" }}>%</span>
                          )}
                        </div>
                      ) : (
                        <textarea
                          ref={(el) => {
                            textareaRefs.current[`${index}-${field}`] = el;
                            if (el) adjustTextareaHeight(el);
                          }}
                          style={{
                            color: "black",
                            // cursor:
                            //   recentWeeks[recentWeeks.length - 1] !==
                            //     currentWeek || userTeam !== selectedPart.value
                            //     ? "not-allowed"
                            //     : "text",
                            overflowY: "auto", // ✅ 스크롤바 자동 활성화
                            maxHeight: "200px", // ✅ 최대 높이 제한 (200px)
                            resize: "none", // 사용자가 크기 조절하지 못하도록 설정
                          }}
                          className={
                            colIndex === 0
                              ? styles.FirstTextArea
                              : styles.MaintextArea
                          }
                          value={row[field as keyof typeof row]}
                          onChange={(e) => {
                            handleMainChange(index, field, e.target.value);
                            adjustTextareaHeight(e.target);
                          }}
                          onInput={(e) =>
                            adjustTextareaHeight(
                              e.target as HTMLTextAreaElement
                            )
                          } // 입력 시 크기 조절
                          // disabled={
                          //   recentWeeks[recentWeeks.length - 1] !==
                          //     currentWeek || userTeam !== selectedPart.value
                          // }
                        />
                      )}
                    </td>
                  ))}
                </tr>
              )})}
            </tbody>
          </table>
          {/* 우클릭 메뉴 */}
          {contextMenu && (
            <div
              style={{
                position: "absolute",
                top: contextMenu.mouseY,
                left: contextMenu.mouseX,
                background: "white",
                border: "1px solid gray",
                borderRadius: "0.4rem",
                padding: "0.5rem",
                boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
              onClick={handleDeleteLastRow} // 삭제 버튼 클릭 시 마지막 행 삭제
            >
              마지막 행 삭제
            </div>
          )}
        </div>
        {/* ) : (<p>📌 데이터 없음</p>)} */}
      </div>

      {/* 정보보고, 이슈, 메모 입력 */}
      {/* {data.length > 0 ? ( */}
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
                  style={{
                    color: "black",
                    // cursor:
                    //   recentWeeks[recentWeeks.length - 1] !== currentWeek ||
                    //   userTeam !== selectedPart.value
                    //     ? "not-allowed"
                    //     : "text",
                  }}
                  // disabled={
                  //   recentWeeks[recentWeeks.length - 1] !== currentWeek ||
                  //   userTeam !== selectedPart.value
                  // }
                />
              </td>
              <th className={styles.issueHeader}>이슈</th>
              <td className={styles.scrollableCell}>
                <textarea
                  className={styles.textArea}
                  value={issueContent}
                  onChange={(e) => handleInputChange(e, "issue")}
                  style={{
                    color: "black",
                    // cursor:
                    //   recentWeeks[recentWeeks.length - 1] !== currentWeek ||
                    //   userTeam !== selectedPart.value
                    //     ? "not-allowed"
                    //     : "text",
                  }}
                  // disabled={
                  //   recentWeeks[recentWeeks.length - 1] !== currentWeek ||
                  //   userTeam !== selectedPart.value
                  // }
                />
              </td>
              <th className={styles.memoHeader}>메모</th>
              <td className={styles.scrollableCell}>
                <textarea
                  className={styles.textArea}
                  value={memoContent}
                  onChange={(e) => handleInputChange(e, "memo")}
                  style={{
                    color: "black",
                    // cursor:
                    //   recentWeeks[recentWeeks.length - 1] !== currentWeek ||
                    //   userTeam !== selectedPart.value
                    //     ? "not-allowed"
                    //     : "text",
                  }}
                  // disabled={
                  //   recentWeeks[recentWeeks.length - 1] !== currentWeek ||
                  //   userTeam !== selectedPart.value
                  // }
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* ) : (<p>📌 데이터 없음</p>)} */}
    </div>
  );
};

export default MainPage;
