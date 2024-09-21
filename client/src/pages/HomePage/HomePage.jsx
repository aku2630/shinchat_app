import React, { useEffect } from "react";
import Login from "../../components/Login/Login";
import Register from "../../components/Register/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import loginImg from "./../../assets/login.svg";

const Homepage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = React.useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("User"));
    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <div className={styles.homepage}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.illustration}>
            <img src={loginImg} alt="login" />
          </div>
        </div>
        <div className={styles.right}>
          {isLogin ? (
            <>
              <Login />
              <div className={styles.info}>
                Don't have an account?{" "}
                <span className={styles.link} onClick={() => setIsLogin(false)}>
                  Register
                </span>
              </div>
            </>
          ) : (
            <>
              <Register />
              <div className={styles.info}>
                Already have an account?{" "}
                <span className={styles.link} onClick={() => setIsLogin(true)}>
                  Login
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <ToastContainer theme="colored" />
    </div>
  );
};

export default Homepage;
