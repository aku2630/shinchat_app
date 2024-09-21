import React from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../../config/ChatLogics";
import { ChatState } from "../../../context/ChatProvider";
import Avatar from "../../Avatar/Avatar";
import styles from "./ChatMessages.module.css";

// stickers
import Shinchan1 from "../../../assets/fun/shinchan-1.png";
const stickers = {
  "shinchan-1": Shinchan1,
};

/** @param {string} message */
const isSticker = (message) => {
  const stickerRegex = new RegExp("::.*::");
  return stickerRegex.test(message);
};

/** @param {string} message */
const getSticker = (message) => {
  const stickerRegex = new RegExp("::(.*)::");
  if (!stickers[message.match(stickerRegex)?.[1]]) return message;
  return message.match(stickerRegex)?.[1] ? (
    <img
      src={stickers[message.match(stickerRegex)?.[1]]}
      alt={message.match(stickerRegex)?.[1]}
      style={{
        width: "80px",
        height: "80px",
        objectFit: "contain",
      }}
    />
  ) : (
    message
  );
};

const ChatMessages = ({ messages }) => {
  const { user } = ChatState();
  const bottomRef = React.useRef(null);

  const scrollFeedRef = React.useCallback((node) => {
    if (node !== null) {
      node.scrollTop = node.scrollHeight;
    }
  }, []);

  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div ref={scrollFeedRef} className={styles.scrollableFeed}>
      {messages &&
        messages.map((message, index) => (
          <div
            ref={index === messages.length - 1 ? bottomRef : null}
            className={styles.message}
            key={index}
          >
            {isSameSender(messages, message, index, user.user._id) ||
            isLastMessage(messages, index, user.user._id) ? (
              <Avatar
                className={styles.avatar}
                size={25}
                name={message.sender.name}
                image={message.sender.image}
              />
            ) : (
              <div style={{ width: 3 }} />
            )}
            <span
              className={styles.messageContent}
              style={{
                color:
                  message.sender._id === user.user._id
                    ? "var(--color-text)"
                    : message.error
                    ? "var(--color-error)"
                    : "var(--color-background)",
                backgroundColor:
                  message.sender._id === user.user._id
                    ? "var(--color-background)"
                    : message.error
                    ? "var(--color-background)"
                    : "var(--color-primary-400)",
                borderRadius:
                  message.sender._id !== user.user._id
                    ? "0.8rem 0.8rem 0.8rem 0"
                    : "0.8rem 0.8rem 0 0.8rem",
                marginLeft: isSameSenderMargin(
                  messages,
                  message,
                  index,
                  user.user._id
                ),
                marginTop: isSameUser(messages, message, index, user.user._id)
                  ? 3
                  : 10,
              }}
            >
              {getSticker(message.content)}
            </span>
          </div>
        ))}
    </div>
  );
};

export default ChatMessages;
