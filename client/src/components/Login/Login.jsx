import styles from "./Login.module.css";
import React, { useState } from "react";
import { validateEmail } from "../../Util/valid";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const initialState = {
    email: "",
    password: "",
  };
  const [userData, setUserData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const { email, password } = userData;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  const handleSubmit = async () => {
    setLoading(true);

    if (!email || !password) {
      toast.warn("Please enter all the required fields");
    }
    if (!validateEmail(email)) {
      toast.warn("Invalid Email");
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/users/login",
        { email, password },
        config
      );
      toast.success("User Logged In successfully");
      localStorage.setItem("User", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (err) {
      toast.error("Login Failed: Either the email or password is incorrect");
      setLoading(false);
      return;
    }
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Welcome Back</h1>
      <button
        className={styles.guest}
        onClick={() => {
          setUserData({
            email: "guest@shinchan-chat.onrender.com",
            password: "guest@123",
          });
        }}
        disabled={loading}
      >
        Continue as Guest
      </button>
      <div className={styles.divider}>
        <span className={styles.line}></span>
        <span className={styles.text}>Or login with username</span>
        <span className={styles.line}></span>
      </div>
      <div className={styles.form}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inputContainer}>
          <input
            type={show ? "text" : "password"}
            name="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
          />
          <span
            className={styles.showPassword}
            onClick={(e) => {
              userData.email !== "guest@shinchan-chat.onrender.com" &&
                handleClick(e);
            }}
          >
            {show ? "Hide" : "Show"}
          </span>
        </div>
        <button className={styles.loginButton} onClick={handleSubmit}>
          {loading ? "Loading..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Login;
