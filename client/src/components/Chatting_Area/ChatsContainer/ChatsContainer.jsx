import React from "react";
import { ChatState } from "../../../context/ChatProvider";
import styles from "./ChatsContainer.module.css";
import ChatsSubContainer from "../ChatsSubContainer/ChatsSubContainer";

const ChatsContainer = ({ fetchAgain, setFetchAgain, className }) => {
  return (
    <div className={styles.ChatsContainer + " " + className}>
      <ChatsSubContainer
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />
    </div>
  );
};

export default ChatsContainer;
