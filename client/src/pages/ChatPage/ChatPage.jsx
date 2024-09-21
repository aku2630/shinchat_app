import React, { useState } from "react";
import { ChatState } from "./../../context/ChatProvider";
import Header from "./../../components/Header/Header";
import Chat_Logs from "./../../components/Chat_Logs/Chat_Logs";
import ChatsContainer from "../../components/Chatting_Area/ChatsContainer/ChatsContainer";
import { ToastContainer } from "react-toastify";
import styles from "./ChatPage.module.css";

const ChatPage = () => {
  const { user, selectedChat } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize, false);
    return () => {
      window.removeEventListener("resize", handleResize, false);
    };
  }, [isMobile]);

  return (
    <div className={styles.container}>
      {user && <Header />}
      <div className={styles.content}>
        {user && (selectedChat || !isMobile) && (
          <ChatsContainer
            className={styles.ChatsContainer}
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        )}
        {user && (!selectedChat || !isMobile) && (
          <Chat_Logs className={styles.sidebar} fetchAgain={fetchAgain} />
        )}
      </div>
      <ToastContainer theme="colored" />
    </div>
  );
};

export default ChatPage;
