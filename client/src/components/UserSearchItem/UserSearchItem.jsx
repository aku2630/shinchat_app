import React from "react";
import Avatar from "../Avatar/Avatar";
import styles from "./UserSearchItem.module.css";

const UserSearchItem = ({ user, handleFunction }) => {
  return (
    <div className={styles.listItem} onClick={handleFunction}>
      <Avatar size={40} name={user.name} image={user.image} />
      <div className={styles.info}>
        <p className={styles.title}>{user.name} </p>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default UserSearchItem;
