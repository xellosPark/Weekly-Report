import styles from "./page.module.css";
import { redirect } from "next/navigation";

export default function HomePage() {
  // // 페이지 로드 시 리다이렉트
  // redirect("/login");
  // return <div className={styles.page}>Redirecting...</div>;
  return <h1>Hello, Next.js!</h1>;
}
