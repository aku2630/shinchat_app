import React, { useState, useEffect } from "react";
import ProfileModal from "../Modal/ProfileModal/ProfileModal";
import UserSearchItem from "../UserSearchItem/UserSearchItem";
import Loader from "../Loader/Loader";
import { IoSearch, IoNotificationsSharp } from "react-icons/io5";
import { ChatState } from "../../context/ChatProvider.js";
import { useNavigate } from "react-router-dom";
import useDisclosure from "../../hooks/useDisclosure";
import { toast } from "react-toastify";
import styles from "./Header.module.css";
import axios from "axios";
import Avatar from "../Avatar/Avatar";
import Menu from "../Menu/Menu";
import SidePanel from "../SidePanel/SidePanel";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
    setIsAIChat,
  } = ChatState();
  const [theme, setTheme] = useState(
    localStorage.getItem("shinchan-chat-theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("shinchan-chat-theme", theme); 
    document.body.setAttribute("aria-theme", theme);
  }, [theme]);

  const logoutHandler = () => {
    localStorage.removeItem("User");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      return toast.info("Please enter a query");
    }
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/users?search=${search}`, config);
      setSearchResult(data.users);
      setLoading(false);
    } catch (err){
      toast.error(err);
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    setLoading(true);
    setLoadingChat(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chats`, { userId }, config);
      if (!chats.find((item) => item._id === data._id))
        setChats([data, ...chats]);

      setSelectedChat(data);
      setIsAIChat(userId === process.env.REACT_APP_AI_CHAT_USER_ID);
      setLoading(false);
      setLoadingChat(false);
      onClose();
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };

  const removeNotification = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`/api/notification/${id}`, config);
    } catch (err) {
      toast.error(err);
    }
  };
  const getPrevNotification = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/notification", config);
      setNotification(data.map((item) => item.notificationId));
    } catch (err) {
      toast.error(err);
    }
  };
  useEffect(() => {
    getPrevNotification();
  }, []);
  return (
    <>
      <div className={styles.navbar}>
        <button className={styles.searchButton} onClick={onOpen}>
          <IoSearch />
          <span>Search People</span>
        </button>
        <div className={styles.logo}>Shinchat</div>
        <div className={styles.actions}>
          <Menu
            toggleComponent={
              theme == "light" ? (
                <BsFillMoonStarsFill className={styles.theme} />
              ) : (
                <BsFillSunFill className={styles.theme} />
              )
            }
          >
            <span onClick={() => setTheme("light")}>Light</span>
            <span onClick={() => setTheme("dark")}>Dark</span>
          </Menu>
          <Menu
            toggleComponent={
              <div className={styles.notification}>
                {notification.length > 0 && (
                  <span className={styles.notificationCount}>
                    {notification.length}
                  </span>
                )}
                <IoNotificationsSharp />
              </div>
            }
          >
            {!notification.length ? (
              <div className={styles.noNotification}>No Notification</div>
            ) : (
              notification.map((notify) => (
                <div
                  key={notify._id}
                  className={styles.notificationItem}
                  onClick={() => {
                    removeNotification(notify.chatId._id);
                    setSelectedChat(notify.chatId);
                    setNotification(notification.filter((n) => n !== notify));
                  }}
                >
                  {notify.chatId.isGroupChat
                    ? `New Message in ${notify.chatId.chatName}`
                    : `New Message from ${notify.sender.name}`}
                </div>
              ))
            )}
          </Menu>
          <Menu
            toggleComponent={
              <Avatar size={30} name={user.user.name} image={user.user.image} />
            }
          >
            <ProfileModal user={user.user}>My Profile</ProfileModal>
            <div className={styles.logout} onClick={logoutHandler}>
              Logout
            </div>
          </Menu>
        </div>
      </div>
      {isOpen && (
        <SidePanel onClose={onClose}>
          <h2 className={styles.sidepanelTitle}>Search Users</h2>
          <div className={styles.sidepanelSearch}>
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={handleSearch}>
              <IoSearch />
            </button>
          </div>
          <div className={styles.searchResults}>
            {loading ? (
              <Loader />
            ) : (
              searchResult?.map((user) => (
                <UserSearchItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
          </div>
        </SidePanel>
      )}
    </>
  );
};

export default Header;
