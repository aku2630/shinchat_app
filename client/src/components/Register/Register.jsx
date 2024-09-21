import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { valid } from "../../Util/valid";
import { toast } from "react-toastify";
import axios from "axios";
import Loader from "../Loader/Loader";
import styles from "./Register.module.css";

const Register = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const initialState = {
    name: "",
    email: "",
    password: "",
    cf_password: "",
    pic: "",
  };
  const [userData, setUserData] = useState(initialState);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { name, email, password, cf_password, pic } = userData;

  const postDetails = (pics) => {
    setUploadingImage(true);
    if (pics === undefined) {
      toast.warn("Please add a Profile Picture");
      return;
    }
    if (pics.type === "image/png" || pics.type === "image/jpeg") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dq7nisjbh");
      fetch("https://api.cloudinary.com/v1_1/dq7nisjbh/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setUserData({ ...userData, ["pic"]: data.url.toString() });
          setUploadingImage(false);
        })
        .catch((err) => {
          toast.error(err);
          setUploadingImage(false);
        });
    } else {
      toast.error("Invalid format of Image.");
      setUploadingImage(false);
      return;
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    const message = valid(name, email, password, cf_password);
    if (message) {
      toast.warn(message);
      setIsLoading(false);
      return;
    }
    // ? request
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/users",
        { name, email, password, pic },
        config
      );
      toast.info("User Registered Successfully");
      localStorage.setItem("User", JSON.stringify(data));
      setIsLoading(false);
      navigate("/chats");
    } catch (err) {
      toast.error(err);
      setIsLoading(false);
      return;
    }
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Create Account</h1>
      <div className={styles.form}>
        <div className={styles.input}>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
            placeholder="Name"
          />
        </div>
        <div className={styles.input}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Email"
          />
        </div>
        <div className={styles.input}>
          <input
            type={show ? "text" : "password"}
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="Password"
          />
          <span className={styles.showPassword} onClick={handleClick}>
            {show ? "Hide" : "Show"}
          </span>
        </div>
        <div className={styles.input}>
          <input
            type={show ? "text" : "password"}
            name="cf_password"
            value={cf_password}
            onChange={handleChange}
            placeholder="Confirm Password"
          />
        </div>
        <div className={styles.input}>
          <input
            type="file"
            name="pic"
            onChange={(e) => postDetails(e.target.files[0])}
          />
        </div>
        {isLoading && <Loader />}
        <button className={styles.registerButton} onClick={handleSubmit}>
          {uploadingImage ? "Uploading..." : "Register"}
        </button>
      </div>
    </div>
  );
};

export default Register;
