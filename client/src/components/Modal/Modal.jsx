import React from "react";
import styles from "./Modal.module.css";

const Modal = ({ onClose, children, isOpen }) => {
  const modalRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      modalRef.current.showModal();
    } else {
      modalRef.current.close();
    }
  }, [isOpen]);


  return (
    <dialog ref={modalRef} className={styles.modal}>
      <div className={styles.close} onClick={onClose}>
        <span>&times;</span>
      </div>
      {children}
    </dialog>
  );
};

export default Modal;
