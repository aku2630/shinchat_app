import React, { useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import useDisclosure from "../../../hooks/useDisclosure";
import { toast } from "react-toastify";
import { ChatState } from "../../../context/ChatProvider";
import GroupMember from "../../GroupMember/GroupMember";
import axios from "axios";
import Loader from "../../Loader/Loader";
import UserSearchItem from "../../UserSearchItem/UserSearchItem";
import styles from "./UpdateGroupChatModal.module.css";
import Modal from "../Modal";

const UpdateGroupChatModal = ({
  fetchAgain,
  setFetchAgain,
  fetchAllMessages,
}) => {
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, user, setSelectedChat } = ChatState();

  const handleRemoveUser = async (userToBeRemoved) => {
    if (user.user._id !== selectedChat.groupAdmin._id) {
      toast.info("Only Admins can add/remove member");
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chats/groupremove`,
        {
          userId: userToBeRemoved._id,
          chatId: selectedChat._id,
        },
        config
      );

      userToBeRemoved._id === user._d
        ? setSelectedChat()
        : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchAllMessages();
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };
  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }
    setRenameLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chats/grouprename",
        { chatName: groupChatName, chatId: selectedChat._id },
        config
      );
      toast.info(`Group name successfully changed to ${data.chatName}`);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (err) {
      toast.error(err);
      setRenameLoading(false);
      return;
    }
    setGroupChatName("");
  };
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      // ? if query string is empty
      toast.info("please search to add users");
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
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };
  const handleAddMember = async (userToAdd) => {
    if (userToAdd.email === "guest@User.com") {
      toast.info("\nGuest user can not be a part of group");
      return;
    }
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      toast.info("User already present in the group");
      return;
    }
    if (user.user._id !== selectedChat.groupAdmin._id) {
      toast.info("Only Admins can add/remove member");
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chats/groupadd`,
        {
          userId: userToAdd._id,
          chatId: selectedChat._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };
  const handleRemove = async (userToBeRemoved) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(
        `/api/chats/groupremove`,
        {
          userId: userToBeRemoved.user._id,
          chatId: selectedChat._id,
        },
        config
      );
      setSelectedChat();
      setFetchAgain(!fetchAgain);
      fetchAllMessages();
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };
  return (
    <>
      <button className={styles.settingsBtn} onClick={onOpen}>
        <IoSettingsOutline fontSize="1.4rem" />
      </button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <div className={styles.container}>
          <h2>{selectedChat.chatName}</h2>
          <h4>Group Members</h4>
          <div className={styles.members}>
            {selectedChat.users.map((user) => (
              <GroupMember
                key={user._id}
                user={user}
                handleFunction={() => handleRemoveUser(user)}
              />
            ))}
          </div>
          <form>
            <div className={styles.formControl}>
              <input
                placeholder="Chat Name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <button
                isLoading={renameLoading}
                onClick={handleRename}
                className={styles.updateBtn}
              >
                Rename
              </button>
            </div>
            <div className={styles.formControl}>
              <input
                placeholder="Add members to group"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </form>

          {loading ? (
            <Loader />
          ) : (
            <div className={styles.searchResults}>
              {searchResult?.map((user) => (
                <UserSearchItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddMember(user)}
                />
              ))}
            </div>
          )}
          <button
            className={styles.leaveGroupButton}
            onClick={() => handleRemove(user)}
          >
            Leave Group
          </button>
        </div>
      </Modal>
    </>
  );
};
export default UpdateGroupChatModal;
