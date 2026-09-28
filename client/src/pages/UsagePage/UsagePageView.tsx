import { useAuth } from "../../context/AuthContext";
import styles from "./UsagePageView.module.css";

const UsagePageView = () => {
  const { isAuth, logout } = useAuth();

  

  
  return (
    <div className={styles.mainContainer}>
        view
    </div>
  );
};

export default UsagePageView;