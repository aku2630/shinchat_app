import React from "react";
import styles from "./Menu.module.css";

const Menu = ({ children, toggleComponent }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const node = React.useRef(null);

  const toggle = () => setIsOpen(!isOpen);

  const handleOutsideClick = (e) => {
    if (node.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div ref={node} className={styles.container} onClick={toggle}>
      {toggleComponent}
      <div
        className={styles.menu}
        style={{ visibility: isOpen ? "visible" : "hidden" }}
      >
        {children && Array.isArray(children)
          ? children.map((child, index) => (
              <div
                key={index}
                className={styles.menuItem}
                onClick={child.props.onClick}
              >
                {child}
              </div>
            ))
          : children}
      </div>
    </div>
  );
};

export default Menu;
