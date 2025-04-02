import { useState } from "react";
import styles from "./ChangePassword.module.css";
import { Eye, EyeOff } from "lucide-react";
import { changePassword } from "../../utils/userApi";

interface ChangePasswordProps {
  onClose: () => void;
}

export default function ChangePassword({ onClose }: ChangePasswordProps) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }

    if (newPw.length < 6 || confirmPw.length < 6) {
      alert("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (newPw !== confirmPw) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    const res = await changePassword(currentPw, newPw);



    // // 🔍 응답 전체 출력
    // console.log("[ChangePassword] 응답 전체:", res);

    // // 🔍 상태 코드 출력
    // console.log("[ChangePassword] 응답 status:", res.status);

    // // 🔍 실제 데이터 출력
    // console.log("[ChangePassword] 응답 data:", res.data.success);

    //GET /api/user/1 → 200 OK
    //POST /api/users → 201 Created
    if (res.status === 201 && res.data.success) {
      alert(res.data.message);
      console.log("✅ onClose 실행 전");
      onClose();
      console.log("✅ onClose 실행 후");
    } else if (res.data.success === false) {
      alert(res.data.message);
    }

    // TODO: API 요청
    //alert("비밀번호가 성공적으로 변경되었습니다!");
  };

  const toggleShowPassword = () => setShowPw(!showPw);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>비밀번호 변경</h2>
      <p className={styles.subtitle}>
        현재 비밀번호가 일치하는 경우 새 비밀번호로 변경할 수 있습니다.
      </p>

      <div className={styles.formGroup}>
        <label className={styles.label}>현재 비밀번호</label>
        <div className={styles.inputWrapper}>
          <input
            type={showPw ? "text" : "password"}
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            className={styles.input}
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={toggleShowPassword}
          >
            {showPw ? <EyeOff size={25} /> : <Eye size={25} />}
          </button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>새 비밀번호</label>
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>새 비밀번호 확인</label>
        <input
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          className={styles.input}
        />
      </div>

      <button className={styles.submitButton} onClick={handleChangePassword}>
        변경하기
      </button>
    </div>
  );
}
