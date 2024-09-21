import React from "react";
import styles from "./Avatar.module.css";
import { IoMdPeople } from "react-icons/io";

const Avatar = ({ isGroupChat, size, name, image, className }) => {
  return (
    <div
      className={styles.avatar + " " + className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size / 2}px`,
      }}
    >
      {isGroupChat ? (
        <IoMdPeople size={20} />
      ) : image ? (
        <img src={image} alt="avatar" />
      ) : (
        <span>{name.split(" ").map((part) => part[0])}</span>
      )}
    </div>
  );
};

export default Avatar;
