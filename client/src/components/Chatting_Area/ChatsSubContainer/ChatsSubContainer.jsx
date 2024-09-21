import React, { useState, useEffect, useCallback } from "react";
import { ChatState } from "../../../context/ChatProvider";
import { IoIosArrowBack } from "react-icons/io";
import { getSender } from "../../../config/ChatLogics";
import ProfileModal from "../../Modal/ProfileModal/ProfileModal";
import UpdateGroupChatModal from "../../Modal/UpdateGroupChatModal/UpdateGroupChatModal";
import Loader from "../../Loader/Loader";
import { toast } from "react-toastify";
import axios from "axios";
import ChatMessages from "../ChatMessages/ChatMessages";
import styles from "./ChatsSubContainer.module.css";
import Avatar from "../../Avatar/Avatar";
import { IoSend } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  BsCameraVideoFill,
  BsEmojiDizzy,
  BsEmojiHeartEyes,
} from "react-icons/bs";
import { IoCall } from "react-icons/io5";
// for socket.io
import io from "socket.io-client";

// stickers
import Shinchan1 from "../../../assets/fun/shinchan-1.png";
const stickers = {
  "shinchan-1": Shinchan1,
};

const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
axios.defaults.baseURL = ENDPOINT;
var socket, selectedChatCompare;

const ChatsSubContainer = ({ fetchAgain, setFetchAgain }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    isAIChat,
    setIsAIChat,
  } = ChatState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState();
  const [isTyping, setIsTyping] = useState();
  const [isAITyping, setIsAITyping] = useState(false);

  const fetchAllMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
      return;
    }
  };

  const sendMessage = async (e) => {
    console.log("Send Message");
    socket.emit("stop typing", selectedChat._id);
    // optimistic update
    setNewMessage("");
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/message",
        {
          chatId: selectedChat._id,
          content: newMessage,
        },
        config
      );
      setMessages((prev) => [...prev, data]);
      socket.emit("new message", data);
    } catch (err) {
      toast.error(err);
      setMessages((prev) => prev.pop());
      return;
    }
  };

  const sendAIMessage = async (e) => {
    console.log("AI Send Message");
    socket.emit("stop typing", selectedChat._id);
    setNewMessage("");
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/message",
        {
          chatId: selectedChat._id,
          content: newMessage,
        },
        config
      );
      setMessages((prev) => [...prev, data]);
      socket.emit("new ai message", data);
    } catch (err) {
      toast.error(err);
      setMessages((prev) => prev.pop());
      return;
    }
  };

  const saveNotification = async () => {
    if (!notification.length) return;
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(
        "/api/notification",
        {
          notification: notification[0].chatId.latestMessage,
        },
        config
      );
    } catch (err) {
      toast.error(err);
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user.user);
    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", (id) => {
      if (selectedChat._id === id) {
        setIsTyping(true);
      }
    });
    socket.on("stop typing", () => setIsTyping(false));
    socket.on("ai typing", (chatId) => {
      if (selectedChat._id === chatId) setIsAITyping(true);
    });
    socket.on("ai stop typing", (chatId) => {
      if (selectedChat._id === chatId) setIsAITyping(false);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    fetchAllMessages();
    selectedChatCompare = selectedChat;
    socket.emit("join chat", selectedChat._id);
    setIsAIChat((prev) => {
      selectedChat.users.forEach((_user) => {
        if (_user._id === process.env.REACT_APP_AI_CHAT_USER_ID) prev = true;
      });
      return prev;
    });
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      console.log(newMessageReceived);
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chatId._id
      ) {
        if (!notification.includes(newMessageReceived.chatId._id)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    });
  }, []);

  useEffect(() => {
    saveNotification();
  }, [notification]);

  const typingHandler = (e) => {
    console.log("typing");
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
  };

  useEffect(() => {
    if (!socketConnected) return;
    if (typing) {
      const timeout = setTimeout(() => {
        setTyping(false);
        socket.emit("stop typing", selectedChat._id);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [typing]);

  useEffect(() => {
    if (isAIChat) console.log("AI Chat Activated");
    else console.log("AI Chat Deactivated");
  }, [isAIChat]);

  const navigate = useNavigate();
  const handleJoinRoomvideo = useCallback(() => {
    const propsToPass = {
      chat: selectedChat,
      chatId: selectedChat._id,
      userId: user.user._id,
      username: user.user.name,
      voice: false,
    };
    navigate("/room", { state: propsToPass });
  }, [navigate, selectedChat, user]);

  const handleJoinRoomvoice = useCallback(() => {
    const propsToPass = {
      chat: selectedChat,
      chatId: selectedChat._id,
      userId: user.user._id,
      username: user.user.name,
      voice: true,
    };
    navigate("/room", { state: propsToPass });
  }, [navigate, selectedChat, user]);

  return (
    <>
      {selectedChat ? (
        <>
          {!selectedChat.isGroupChat ? (
            <div className={styles.header}>
              <ProfileModal user={getSender(user?.user, selectedChat.users)}>
                <div className={styles.chatName}>
                  <div
                    className={styles.backBtn}
                    onClick={() => setSelectedChat("")}
                  >
                    <IoIosArrowBack />
                  </div>
                  <Avatar
                    size={40}
                    name={getSender(user?.user, selectedChat.users).name}
                    image={getSender(user?.user, selectedChat.users).image}
                  />
                  <div className={styles.info}>
                    {getSender(user?.user, selectedChat.users).name}
                    <span className={styles.typing}>
                      {(isTyping || isAITyping) && "Typing..."}
                    </span>
                  </div>
                </div>
              </ProfileModal>
            </div>
          ) : (
            <div className={styles.header}>
              <div className={styles.chatName}>
                <div
                  className={styles.backBtn}
                  onClick={() => setSelectedChat("")}
                >
                  <IoIosArrowBack />
                </div>
                <Avatar
                  isGroupChat={true}
                  size={40}
                  name={selectedChat.chatName}
                />
                <div>{selectedChat.chatName}</div>
              </div>
              {!isAIChat ? (
                <div className={styles.call}>
                  <span onClick={handleJoinRoomvideo}>
                    <BsCameraVideoFill />
                  </span>
                  <span onClick={handleJoinRoomvoice}>
                    <IoCall />
                  </span>
                </div>
              ) : null}
              <UpdateGroupChatModal
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
                fetchAllMessages={fetchAllMessages}
              />
            </div>
          )}
          <div className={styles.chats}>
            {loading ? (
              <Loader />
            ) : (
              <div className="message">
                {<ChatMessages messages={messages} />}
              </div>
            )}
          </div>
          <form
            className={styles.messageInput}
            onSubmit={(e) => {
              e.preventDefault();
              if (isAIChat) sendAIMessage(e);
              else sendMessage(e);
            }}
          >
            <button
              className={styles.emojiBtn}
              onClick={(e) => {
                const stickersArray = Object.keys(stickers);
                const randomIndex = Math.floor(
                  Math.random() * stickersArray.length
                );
                setNewMessage(`::${stickersArray[randomIndex]}::`);
              }}
            >
              <BsEmojiHeartEyes size={20} />
            </button>
            <input
              className={styles.textarea}
              placeholder="Enter a message..."
              onChange={typingHandler}
              value={newMessage}
            />
            <button className={styles.button} type="submit">
              <IoSend size={20} />
            </button>
          </form>
        </>
      ) : (
        <div className={styles.noChatSelected}>
          <h2>Shinchat</h2>
          <p>Select on a user to start chat</p>
        </div>
      )}
    </>
  );
};

export default ChatsSubContainer;
