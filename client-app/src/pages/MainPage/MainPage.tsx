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
import { getUsers } from "../../utils/userApi";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 화살표 아이콘 추가
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface MemoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const MemoTextarea = React.memo(function MemoTextarea({ value, onChange, ...props }: MemoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      {...props}
    />
  );
});

const MainPage: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  type User = {
    id: number;
    // username: string;
    // email: string;
    // rank: number;
    // site: number;
    // team: number;
  }

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
    user: User;
    pm: string;
  }

  interface ContextMenuState {
    mouseX: number;
    mouseY: number;
    rowIndex: number;
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
  const parts: { label: string; value: number, site: number}[] = [
    { label: "로봇파트", value: 2, site:1 },
    { label: "시스템사업팀", value: 7, site:3 },
    { label: "자동화파트", value: 1, site:2 },
    { label: "연구소", value: 6, site:1 },
    { label: "경영1팀-I", value: 3, site:1 },
    { label: "경영2팀-J", value: 4, site:1 },
    { label: "FX인원", value: 5, site:1 },
    { label: "팀장", value: 10, site:1 },
  ];

  const authority: { rank: number; issue: boolean; report: boolean; editReport: boolean; editIssue: boolean;}[] = [
    { rank: 1, report: true, issue: false, editReport: false, editIssue: false },
    { rank: 2, report: false, issue: false, editReport: true, editIssue: false },
    { rank: 3, report: false, issue: false, editReport: true, editIssue: true },
    { rank: 4, report: false, issue: false, editReport: true, editIssue: true },
    // { rank: 5, report: false, issue: false, editReport: true, editIssue: true },
    { rank: 5, report: false, issue: false, editReport: true, editIssue: true },
  ];

  const Roles = Object.freeze({
    SUPER_ADMIN: "SUPER_ADMIN",
    MID_MANAGER: "MID_MANAGER", // 중간 관리자
    ADMIN: "ADMIN",
    USER: "USER",
    READ_ONLY: "READ_ONLY", // 읽기 전용 (최소 권한)
  });

  const [selectedPart, setSelectedPart] = useState<{
    label: string;
    value: number;
    site: number;
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
  const { isAuth, userId, userTeam, userRank, userSite, logout } = useAuth();
  // 우클릭 메뉴 상태
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const [rankAuthority, setRankAuthority] = useState<
    {rank: number, report: boolean, issue: boolean, editReport: boolean, editIssue: boolean} | null
  >(null);

  const [users, setUsers] = useState<
  { label: string; value: number, name: string, rank: number, id: number }[]
  >([]);//<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<
    { id: number; name: string; label: string; rank: number; value: number }[]
  >([]);
  const [selectUser, setSelectUser] = useState<
  { label: string; value: number, name: string, rank: number, id: number } | null
  >(null);
  const [error, fetchDataAction, isPending] = useActionState<
    Error | null,
    void
  >(async () => {
    //console.log('load board', userId, userTeam);

    try {
      await LoadUsers();
      const result = await LoadBoard(userId, userRank);
      //console.log('LoadBoard', result);
      
      setData(result); // API 데이터를 직접 useState에 저장
      setIsBoardLoaded(true);
    } catch (error) {
      return error as Error; // 명확한 에러 타입 캐스팅
    }
    return null; // 에러가 없을 경우 null 반환
  }, null);

  // 우클릭 이벤트 핸들러
  // const handleContextMenu = (event: React.MouseEvent<HTMLTableElement>) => {
  //   event.preventDefault(); // 기본 우클릭 메뉴 방지
  //   const target = event.target as HTMLElement;

  //   // 우클릭한 요소가 <thead> 내부라면 컨텍스트 메뉴 표시 안 함
  //   if (target.closest("thead")) {
  //     setContextMenu(null);
  //     return;
  //   }

  //   // 우클릭 위치 저장 후 삭제 버튼 표시
  //   setContextMenu({
  //     mouseX: event.clientX - 2,
  //     mouseY: event.clientY - 4,
  //   });
  // };

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
      pm: "",
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

  const handleDeleteRow = () => {
    if (!contextMenu) return;
  
    const index = contextMenu.rowIndex;
  
    if (reportData.length === 1) return;
  
    const defaultRow = {
      category: "",
      weeklyPlan: "",
      prevPlan: "",
      prevResult: "",
      completion: "202 . . ",
      progress: "0",
      allprogress: "0",
      pm: "",
    };
  
    const targetRow = reportData[index];
    const hasChanges = JSON.stringify(targetRow) !== JSON.stringify(defaultRow);
  
    if (hasChanges) {
      const confirmDelete = window.confirm("작성된 내용이 있습니다. 지우시겠습니까?");
      if (!confirmDelete) {
        setContextMenu(null);
        return;
      }
    }
  
    const newData = [...reportData];
    newData.splice(index, 1);
    setReportData(newData);
    setContextMenu(null);
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
      pm: "",
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
        pm: "",
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

    // 첫 번째 화요일 찾기
    const firstMonday = new Date(firstDayOfYear);
    firstMonday.setDate(
      firstDayOfYear.getDate() + ((2 - firstDayOfYear.getDay() + 7) % 7)
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
    //if (userTeam === 10) {
    const rank = authority.filter((rank) => rank.rank === userRank);
      
    setRankAuthority(rank[0]);
    if (rank[0].rank === 1) {
      const filterPart = parts.filter((part) => part.value !== 5);
      setFilteredParts(filterPart); // 모든 파트 표시
      setSelectedPart(filterPart[filterPart.length - 1]);
    } else if (rank[0].rank === 2) {
        const filterPart = parts.filter((part) => part.value !== 5);
      setFilteredParts(filterPart); // 모든 파트 표시
      setSelectedPart(filterPart[filterPart.length - 1]);
    } else if (rank[0].rank === 3) {
      const filterPart = parts.filter((part) => part.value === 10 || part.value === 3 || part.value === 4 || part.value === 6);
      setFilteredParts(filterPart); // 모든 파트 표시
      const first = filterPart.filter((part) => part.value === userTeam);
      //setSelectedPart(filterPart[0]);
      setSelectedPart(first[0]);
    } else if (rank[0].rank === 4 && userId === 1) {
      const filterPart = parts.filter((part) => part.value === 1 || part.value === 5);
      setFilteredParts(filterPart); // 모든 파트 표시
      setSelectedPart(filterPart[0]);
    } else if (rank[0].rank === 5) {
      const filterPart = parts.filter((part) => part.value === 3 || part.value === 4 || part.value === 7);
      setFilteredParts(filterPart); // 모든 파트 표시
      setSelectedPart(filterPart[0]);
    }
    else {
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
    if (!isBoardLoaded || !currentWeek || !data || !selectedPart || !selectUser) return;
    
    const loadData = data.filter(
      (data) =>
        data.title === getMonthWeekLabel(currentWeek) &&
        data.part === selectedPart?.value &&
        data.user.id === selectUser.id
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
          pm: "",
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
  }, [currentWeek, isBoardLoaded, selectedPart, selectUser]);

  useEffect(() => {
    if (!selectedPart) return;
    const filtered = users.filter(user => user.label === selectedPart.label);
    
    setFilteredUsers(filtered);
    setSelectUser(filtered[0]); // 선택 초기화 (선택사항)
  }, [isAuth, selectedPart, users]);

  const LoadUsers = async () => {
    const userData = await getUsers();
    //console.log('userData', userData.data);
    
    const mappedUsers = userData.data.map((user: { team: number; id: number; site: number; username:string; rank: number;  }) => {
      
      const teamInfo = parts.find(team => team.value === user.team);
      //console.log('teamInfo', teamInfo);
      

      return {
        id: user.id,
        name: user.username,
        value: user.site,
        rank: user.rank,
        label: teamInfo?.label ?? '팀 없음', // 매칭 실패 시 대비
      };
    });
    
    setUsers(mappedUsers);
    setSelectUser(mappedUsers[0]);
  }

  // 정보보고, 이슈, 메모 입력 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    type: string
  ) => {
    if (type === "info") setInfoContent(e.target.value);
    if (type === "issue") setIssueContent(e.target.value);
    if (type === "memo") setMemoContent(e.target.value);
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
      pm: reportData.map((obj) => obj.pm).join("^^"),
      report: infoContent,
      issue: issueContent,
      memo: memoContent,
    };

    //console.log("API 요청 데이터:", JSON.stringify(board, null, 2));

    //대표님이나 팀장님이 내용을 수정할때 해당 게시물의 유저는 작성한 사람이 되어야하므로 이렇게 추가함
    let user_id = 0;
    if (rankAuthority?.rank === 1)
      user_id = selectUser?.id ?? 0;
    else if (rankAuthority?.rank === 2 && selectedPart.label === "팀장") {
      user_id = userId;
    }
    else {
      user_id = selectUser?.id ?? userId;
    }
    
    const response = await SaveBoard(board, user_id);
    alert(response);

    //const result = await LoadBoard(userId, userTeam);
    const result = await LoadBoard(userId, userRank);
    setData(result); // API 데이터를 직접 useState에 저장
    setIsBoardLoaded(true);
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
      pm: reportData.map((obj) => obj.pm).join("^^"),
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
    if (currentWeek === 0) return;
    //console.log('선택 주차', copiedWeek);
    const isConfirmed = window.confirm(
      "이전 주차의 내용으로 업데이트 하시겠습니까? 진행시 작성된 내용이 사라집니다."
    );

    if (!isConfirmed) {
      alert("취소되었습니다.");
      return;
    }

    const title = getMonthWeekLabel(Number((currentWeek || 0) - 1));
    const filterData = data.filter(
      (data) => data.title === title && data.part === userTeam && data.user.id === selectUser?.id
    );
    console.log("filterData", filterData, userTeam);

    if (recentWeeks[recentWeeks.length - 1] !== currentWeek) {
      alert("이전 주차에는 붙여넣기가 안됩니다");
      return;
    }

    if (filterData.length <= 0) {
      alert("해당 주차의 데이터가 없습니다");
      return;
    }
    const transformedData = transData(filterData[0]);

    // 변환된 데이터를 setReportData에 저장
    setReportData(transformedData);

    setInfoContent(filterData[0].report);
    setIssueContent(filterData[0].issue);
    setMemoContent(filterData[0].memo);

    setSelectOriginalData(filterData[0]);
  };

  const escapeExcelFormula = (value: string | number) => {
    const strValue = String(value);
    const specialPrefixes = ["=", "+", "-", "@"];

    if (specialPrefixes.some((prefix) => strValue.startsWith(prefix))) {
      return ` ${strValue}`; // 수식 방지용 공백 추가
    }

    return strValue;
  };

  const toPercentString = (value: string | number) => {
    return `${escapeExcelFormula(value)}%`;
  };

  const onExportToExcel = () => {
    const exportData = reportData.map((row) => ({
      구분: escapeExcelFormula(row.category),
      계획업무_다음주: escapeExcelFormula(row.weeklyPlan),
      계획업무_이번주: escapeExcelFormula(row.prevPlan),
      수행실적: escapeExcelFormula(row.prevResult),
      완료예정일: escapeExcelFormula(row.completion),
      달성율_금주: toPercentString(row.progress),
      달성율_전체: toPercentString(row.allprogress),
      PM: escapeExcelFormula(row.pm),
    }));

    const worksheet = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, [[`${currentWeek} 주간 보고서`]], {
      origin: "A1",
    });
    XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: "A2" });

    XLSX.utils.sheet_add_json(worksheet, exportData, {
      origin: "A3",
      skipHeader: false,
    });

    // 🔍 여기가 포인트!
    const nextRow = exportData.length + 5; // 기존 +4 → 한 줄 더 띄워서 +5
    XLSX.utils.sheet_add_aoa(worksheet, [["정보보고", "이슈", "메모"]], {
      origin: `A${nextRow}`,
    });
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [
          escapeExcelFormula(infoContent),
          escapeExcelFormula(issueContent),
          escapeExcelFormula(memoContent),
        ],
      ],
      { origin: `A${nextRow + 1}` }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `${currentWeek} 주간 보고서`
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${currentWeek}_weekly_report.xlsx`);
  };

  const transData = (loadData: Board) => {
    // ✅ 쉼표(,)로 구분된 데이터를 개별 배열로 변환
    const categories = loadData.category.split("^^").map((item) => item.trim());
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
    const pm = loadData?.pm
      ? loadData.pm.split("^^").map((item) => item.trim())
      : [];

    // ✅ 배열을 순회하면서 개별 객체 생성
    const transformedData = categories.map((_, index) => ({
      category: categories[index] || "",
      weeklyPlan: weeklyPlan[index] || "",
      prevPlan: prevPlan[index] || "",
      prevResult: prevResult[index] || "",
      completion: completion[index] || "",
      progress: progress[index] || "",
      allprogress: allprogress[index] || "",
      pm: pm[index] || "",
    }));

    return transformedData;
  };

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

  const GetRankAuthorityReport = () => {
    if (userRank === 1) {
      return rankAuthority?.report
    } else if (userRank === 2) {
      return rankAuthority?.report
    } else if (userRank === 3 ) {
      if (selectedPart.value === userTeam)
        return rankAuthority?.report
      else return rankAuthority?.editReport
    } else if (userRank === 4 && userId === 1) {
      if (selectedPart.value === userTeam)
        return rankAuthority?.report
      else return rankAuthority?.editReport
    } else if (userRank === 5) {
      if (selectedPart.site === userSite)
        return rankAuthority?.report
      else return rankAuthority?.editReport
    }
    else {
      return rankAuthority?.report
    }
  }

  const GetRankAuthorityIssue = () => {
    if (userRank === 1) {
      return rankAuthority?.editIssue
    } else if (userRank === 2) {
      return rankAuthority?.issue
    } else if (userRank === 3 ) {
      if (selectedPart.value === userTeam)
        return rankAuthority?.issue
      else return rankAuthority?.editIssue
    } else if (userRank === 4 && userId === 1) {
      if (selectedPart.value === userTeam)
        return rankAuthority?.issue
      else return rankAuthority?.editIssue
    } else if (userRank === 5) {
      if (selectedPart.site === userSite)
        return rankAuthority?.issue
      else return rankAuthority?.editIssue
    } else {
      return rankAuthority?.issue
    }
  }

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

              {
              	// 유저명 사용 안함
                //filteredUsers.length > 0 && (
                false && (
                  <select defaultValue=""
                    onChange={(e) => {
                      const selectedValue = e.target.value; // string -> number 변환
                      //const selected = parts.find(
                      //  (part) => part.value === selectedValue
                      const userSelected = users.find(
                        (user) => user.name === selectedValue
                      );
                      if (userSelected) {
                        setSelectUser(userSelected);
                      }
                    }}
                  >
                    {
                      filteredUsers.map(user => (
                        <option key={user.id} value={user.name}>
                          {user.name}
                        </option>
                      ))
                    }
                  </select>
                )
              }

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
            {/*{userTeam === selectedPart.value && ( */}
            { userTeam === selectedPart?.value && 
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

          <div style={{ display: "flex" }}>
            {/* 행 추가 버튼 */}
            {/* <button className={styles.addButton} onClick={handleNewSheet}>
              New
            </button> */}
            {/* 행 추가 버튼 */}
            <button className={styles.excelButton} onClick={onExportToExcel}>
              엑셀 저장
            </button>

            {selectedPart?.value === userTeam && (
            <button className={styles.copyButton} onClick={onCopyAndPaste}>
              전 주차 Copy
            </button>
            )}
            {selectedPart?.value === userTeam && (
              <button className={styles.rowAddButton} onClick={handleAddRow}>
                Row Add
              </button>
            )}

            {/* 저장 버튼 */}
            {(selectedPart?.value === userTeam || userRank === 1 || userRank === 2 ) && (
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
            //onContextMenu={handleContextMenu} // 테이블에서 우클릭 감지
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
                <th rowSpan={2} className={styles.Progress}>
                  PM
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
                const isCompleted =
                  row.progress === "100" && row.allprogress === "100";
                  const isContextSelected = contextMenu?.rowIndex === index;
                return (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: isContextSelected
                      ? "#fdd" // 👉 우클릭으로 선택된 행 색상
                      : isCompleted
                      ? "#bfeeb3" // 완료된 행 색상
                      : "transparent",
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                  
                      const target = event.target as HTMLElement;
                      if (target.closest("thead")) return;
                  
                      setContextMenu({
                        mouseX: event.clientX - 2,
                        mouseY: event.clientY - 4,
                        rowIndex: index, // 여기서 인덱스를 기억!
                      });
                    }}
                  >
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
                               disabled={
                                GetRankAuthorityReport()
                               }
                            />
                            {(field === "progress" ||
                              field === "allprogress") && (
                              <span style={{ marginRight: "2px" }}>%</span>
                            )}
                          </div>
                        ) : (
                          <MemoTextarea
                            // ref={(el) => {
                            //   textareaRefs.current[`${index}-${field}`] = el;
                            //   if (el) adjustTextareaHeight(el);
                            // }}
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
                              alignContent: "center",
                            }}
                            className={
                              colIndex === 0
                                ? styles.FirstTextArea
                                : colIndex === 7 ? styles.PMArea
                                : styles.MaintextArea
                            }
                            value={row[field as keyof typeof row]}
                            onChange={(e) => {
                              handleMainChange(index, field, e.target.value);
                              //adjustTextareaHeight(e.target);
                            }}
                            // onInput={(e) =>
                            //   adjustTextareaHeight(
                            //     e.target as HTMLTextAreaElement
                            //   )
                            // }
                            // 입력 시 크기 조절
                            disabled={
                              GetRankAuthorityReport()
                            }
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
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
              onClick={handleDeleteRow} // 삭제 버튼 클릭 시 마지막 행 삭제
            >
              행 삭제
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
                  disabled={
                    GetRankAuthorityIssue()
                  }
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
                  disabled={
                    GetRankAuthorityIssue()
                  }
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
                  disabled={
                    GetRankAuthorityIssue()
                  }
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
