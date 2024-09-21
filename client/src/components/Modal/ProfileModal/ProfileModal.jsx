import React, { useEffect } from "react";
import { IoEyeSharp } from "react-icons/io5";
import styles from "./ProfileModal.module.css";
import useDisclosure from "../../../hooks/useDisclosure";
import Modal from "../Modal";
import Avatar from "../../Avatar/Avatar";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      {children ? (
        <span className={styles.children} onClick={onOpen}>
          {children}
        </span>
      ) : (
        <IoEyeSharp onClick={onOpen} />
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className={styles.container}>
          <h2>{user.name}</h2>
          <div className={styles.imageContainer}>
            <Avatar size={150} image={user.image} name={user.name} />
          </div>
          <p>Email: {user.email}</p>
        </div>
      </Modal>
    </>
  );
};

export default ProfileModal;
