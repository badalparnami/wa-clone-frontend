import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import Icon from "../../components/Icon";
import { formatDateForSidebar } from "../../utils/formatTime";
import defaultAvatar from "../../assets/default.png";

import useReq from "../../hook/useReq";

const Contact = ({ contact, addToConvo, setUserAsUnread, setSearchValue }) => {
  const { lastMessage } = contact;

  const { requestData, response } = useReq();

  const createConversation = () => {
    requestData("POST", "/user/conversation/create", {
      username: contact.username,
    });
  };

  useEffect(() => {
    if (response !== null) {
      const details = {
        id: response.id,
        about: contact.about,
        username: contact.username,
        avatar: contact.avatar,
        lastMessage: null,
        unread: 0,
      };
      addToConvo(details);
    }
  }, [response]);

  return (
    <Link
      className="sidebar-contact"
      to={contact.id ? `/chat/${contact.id}` : "#"}
      onClick={() => {
        if (contact.unread > 0) {
          setUserAsUnread(contact.id);
        }
        if (!contact.id) {
          createConversation();
        } else {
          setSearchValue("");
        }
      }}
    >
      <div className="sidebar-contact__avatar-wrapper">
        <img
          src={contact.avatar || defaultAvatar}
          alt={contact.username}
          className="avatar"
        />
      </div>
      <div className="sidebar-contact__content">
        <div className="sidebar-contact__top-content">
          <h2 className="sidebar-contact__name"> {contact.username} </h2>
          {!contact.typing && (
            <span className="sidebar-contact__time">
              {lastMessage?.date && formatDateForSidebar(lastMessage.date)}
            </span>
          )}
        </div>
        <div className="sidebar-contact__bottom-content">
          <p className="sidebar-contact__message-wrapper">
            {!contact.typing && lastMessage?.status && (
              <Icon
                id={
                  lastMessage?.status === "sent" ? "singleTick" : "doubleTick"
                }
                aria-label={lastMessage?.status}
                className={`sidebar-contact__message-icon ${
                  lastMessage?.status === "read"
                    ? "sidebar-contact__message-icon--blue"
                    : ""
                }`}
              />
            )}
            <span
              className={`sidebar-contact__message ${
                !!contact.unread ? "sidebar-contact__message--unread" : ""
              } ${contact.typing ? "typing-color" : ""}  ${
                lastMessage?.image ? "sidebar-photo" : ""
              }`}
            >
              {contact.typing === true ? (
                "typing ..."
              ) : lastMessage?.image ? (
                <>
                  <Icon id="photo" /> <span>Photo</span>
                </>
              ) : (
                lastMessage?.content || contact.about
              )}
            </span>
          </p>
          <div className="sidebar-contact__icons">
            {contact.pinned && (
              <Icon id="pinned" className="sidebar-contact__icon" />
            )}
            {!!contact.unread && (
              <span className="sidebar-contact__unread">{contact.unread}</span>
            )}
            <button aria-label="sidebar-contact__btn">
              <Icon
                id="downArrow"
                className="sidebar-contact__icon sidebar-contact__icon--dropdown"
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Contact;
