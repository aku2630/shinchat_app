import React from "react";
import { IoMdClose } from "react-icons/io";
import styles from "./GroupMember.module.css";

const GroupMember = ({ user, handleFunction }) => {
  return (
    <div className={styles.container}>
      {user.name}
      <IoMdClose onClick={handleFunction} cursor="pointer" />
    </div>
  );
};

export default GroupMember;
