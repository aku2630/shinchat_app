import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useDisclosure from "../../../hooks/useDisclosure";
import { ChatState } from "../../../context/ChatProvider";
import UserSearchItem from "../../UserSearchItem/UserSearchItem";
import Loader from "../../Loader/Loader";
import GroupMember from "../../GroupMember/GroupMember";
import Modal from "../Modal";
import styles from "./GroupChatModal.module.css";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { user, chats, setChats } = ChatState();
  const [selectedUser, setSelectedUser] = useState([
    { _id: user.user._id, name: user.user.name, email: user.user.email },
  ]);

  const handleSearch = async (query) => {
    if (!query) {
      // ? if query string is empty
      setSearchResult([]);
      return;
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(search);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleSelectUser = (_user) => {
    if (selectedUser.find((selected) => selected._id === _user._id)) {
      toast.info("User already added to the Group");
      return;
    }
    setSelectedUser([...selectedUser, _user]);
  };

  const handleRemoveUser = (_user) => {
    if (_user._id === user.user._id) {
      toast.info("You cannot remove yourself from the group");
      return;
    }
    setSelectedUser(selectedUser.filter((sel) => sel._id !== _user._id));
  };

  const handleSubmit = async () => {
    if (user.user.email === "guest@shinchan-chat.onrender.com") {
      toast.info("Guest cannot create groups");
      return;
    }
    if (
      selectedUser.map((u) => {
        if (u.email === "guest@shinchan-chat.onrender.com") {
          toast.info("Guest user can not be added in group");
        }
        return {};
      })
    )
      if (!groupChatName || !selectedUser) {
        toast.info("Please fill in all the required fields");
        return;
      }
    if (selectedUser.length <= 2) {
      toast.info("Group must have at least 3 members");
      return;
    }
    // create chat
    setSubmitLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const usersString = JSON.stringify(selectedUser.map((u) => u._id));
      const { data } = await axios.post(
        "/api/chats/group",
        { name: groupChatName, users: usersString },
        config
      );
      setChats([data, ...chats]);
      onClose();
      setSubmitLoading(false);
      toast.success(`${groupChatName} successfully created`);
      setSelectedUser([]);
    } catch (err) {
      toast.error(err);
      setSubmitLoading(false);
      return;
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal
        isOpen={isOpen}
        onClose={(e) => {
          setSelectedUser([]);
          setSearchResult([]);
          onClose();
        }}
      >
        <div className={styles.container}>
          <h2>Create Group</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formControl}>
              <label htmlFor="groupChatName">Group Name</label>
              <input
                type="text"
                id="groupChatName"
                placeholder="Enter Group Name"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="search">Add members to group</label>
              <input
                type="text"
                id="search"
                placeholder="Add members to group"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.selectedUsers}>
              {selectedUser.map((user) => (
                <GroupMember
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemoveUser(user)}
                />
              ))}
            </div>
            {(loading || searchResult?.length > 0) && (
              <div className={styles.searchResult}>
                {loading ? (
                  <Loader />
                ) : (
                  searchResult
                    ?.slice(0, 4)
                    .map((user) => (
                      <UserSearchItem
                        width="100%"
                        key={user._id}
                        user={user}
                        handleFunction={() => handleSelectUser(user)}
                      />
                    ))
                )}
              </div>
            )}
            <div className={styles.submit}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitLoading}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default GroupChatModal;
