import React, { useState, useEffect, useRef } from "react";
import Icon from "../../../components/Icon";
import PopupHelper from "../../../components/PopupHelper";
import AvatarUploader from "../../../components/AvatarUploader";

const attachButtons = [
  { icon: "attachRooms", label: "Choose room" },
  { icon: "attachContacts", label: "Choose contact" },
  { icon: "attachDocument", label: "Choose document" },
  { icon: "attachCamera", label: "Use camera" },
  { icon: "attachImage", label: "Choose image" },
];

const ChatInput = ({
  showAttach,
  setShowAttach,
  showEmojis,
  setShowEmojis,
  newMessage,
  setNewMessage,
  submitNewMessage,
  inputRef,
  socket,
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);

  let timer = useRef(null);

  useEffect(() => {
    timer.current = setTimeout(() => {
      isTyping && socket && socket.emit("typingStopped");
      setIsTyping(false);
    }, 3300);

    return () => clearTimeout(timer.current);
  }, [newMessage]);

  const detectEnterPress = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      if (newMessage.trim().length === 0) {
        setNewMessage("");
      } else {
        submitNewMessage();
        socket && socket.emit("typingStopped") && clearTimeout(timer.current);
        setIsTyping(false);
      }
    }
  };
  return (
    <div className="chat__input-wrapper">
      {showEmojis && (
        <button aria-label="Close emojis" onClick={() => setShowEmojis(false)}>
          <Icon id="cancel" className="chat__input-icon" />
        </button>
      )}
      <button aria-label="Emojis" onClick={() => setShowEmojis(true)}>
        <Icon
          id="smiley"
          className={`chat__input-icon ${
            showEmojis ? "chat__input-icon--highlight" : ""
          }`}
        />
      </button>
      {showEmojis && (
        <>
          <button aria-label="Choose GIF">
            <Icon id="gif" className="chat__input-icon" />
          </button>
          <button aria-label="Choose sticker">
            <Icon id="sticker" className="chat__input-icon" />
          </button>
        </>
      )}
      <div className="pos-rel">
        <button aria-label="Attach" onClick={() => setShowAttach(!showAttach)}>
          <Icon
            id="attach"
            className={`chat__input-icon ${
              showAttach ? "chat__input-icon--pressed" : ""
            }`}
          />
        </button>
        <AvatarUploader
          openPicker={openPicker}
          makeMeFalse={setOpenPicker}
          isImage={true}
        />

        <PopupHelper
          isPopupOpen={showAttach}
          setIsPopupOpen={setShowAttach}
          closeOnClick={true}
        >
          <div
            className={`chat__attach ${
              showAttach ? "chat__attach--active" : ""
            }`}
          >
            {attachButtons.map((btn) => (
              <button
                className="chat__attach-btn"
                aria-label={btn.label}
                key={btn.label}
                onClick={
                  btn.icon === "attachImage" ? () => setOpenPicker(true) : null
                }
              >
                <Icon id={btn.icon} className="chat__attach-icon" />
              </button>
            ))}
          </div>
        </PopupHelper>
      </div>
      <input
        className="chat__input"
        placeholder="Type a message"
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
          if (!isTyping) {
            socket && socket.emit("typingStarted");
            setIsTyping(true);
          }
        }}
        onKeyDown={detectEnterPress}
        autoFocus
        ref={inputRef}
        required
      />
      {newMessage ? (
        <button aria-label="Send message" onClick={submitNewMessage}>
          <Icon id="send" className="chat__input-icon" />
        </button>
      ) : (
        <button aria-label="Record voice note">
          <Icon id="microphone" className="chat__input-icon" />
        </button>
      )}
    </div>
  );
};

export default ChatInput;
