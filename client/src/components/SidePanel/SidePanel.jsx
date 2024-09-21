import React from "react";
import styles from "./SidePanel.module.css";

const SidePanel = ({ children, onClose }) => {
  const sidePanelRef = React.useRef(null);
  const sidePanelWrapperRef = React.useRef(null);

  const closeSidePanel = (e) => {
    e.stopPropagation();
    sidePanelRef.current.classList.add(styles["sidePanel-close-animation"]);
    sidePanelWrapperRef.current.classList.add(
      styles["sidePanelWrapper-close-animation"]
    );
    setTimeout(() => {
      onClose();
    }, 190);
  };

  return (
    <div ref={sidePanelWrapperRef} className={styles.sidePanelWrapper}>
      <div ref={sidePanelRef} className={styles.sidePanel}>
        <div className={styles.close} onClick={closeSidePanel}>
          <span>&times;</span>
        </div>
        {children}
      </div>
    </div>
  );
};

export default SidePanel;
