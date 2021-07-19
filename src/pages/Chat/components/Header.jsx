import React from "react";
import Icon from "../../../components/Icon";
import OptionsBtn from "../../../components/OptionsButton";
import defaultAvatar from "../../../assets/default.png";

import { lastSeenFormatter } from "../../../utils/formatTime";

const Header = ({
  user,
  openProfileSidebar,
  openSearchSidebar,
  isOnline,
  isTyping,
}) => {
  return (
    <header className="header chat__header">
      <div className="chat__avatar-wrapper" onClick={openProfileSidebar}>
        <img
          src={user.avatar || defaultAvatar}
          alt={user.username}
          className="avatar"
        />
      </div>

      <div className="chat__contact-wrapper" onClick={openProfileSidebar}>
        <h2 className="chat__contact-name"> {user.username}</h2>
        <p className={`chat__contact-desc ${isTyping ? "typing-color" : ""}`}>
          {isTyping
            ? "typing ..."
            : isOnline === true
            ? "Online"
            : lastSeenFormatter(isOnline)}
        </p>
      </div>
      <div className="chat__actions">
        <button
          className="chat__action"
          aria-label="Search"
          onClick={openSearchSidebar}
        >
          <Icon
            id="search"
            className="chat__action-icon chat__action-icon--search"
          />
        </button>
        <OptionsBtn
          className="chat__action"
          ariaLabel="Menu"
          iconId="menu"
          iconClassName="chat__action-icon"
          options={[
            { name: "Contact Info", fn: null },
            { name: "Select Messages", fn: null },
            { name: "Mute notifications", fn: null },
            { name: "Clear messages", fn: null },
            { name: "Delete chat", fn: null },
          ]}
        />
      </div>
    </header>
  );
};

export default Header;
