import React, { useState, useEffect, useContext, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";

import "./styles/main.css";
import defaultAvatar from "../../assets/default.png";
import Icon from "../../components/Icon";
import Contact from "./Contact";
import OptionsBtn from "../../components/OptionsButton";
import { UsersContext } from "../../context/usersContext";
import useReq from "../../hook/useReq";
import AvatarUploader from "../../components/AvatarUploader";

const Sidebar = () => {
  const [conversations, setConversations] = useState([]);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [openPicker, setOpenPicker] = useState(false);

  const ctx = useContext(UsersContext);

  const location = useLocation();
  const history = useHistory();

  const { clear, response, requestData, loading } = useReq();

  const {
    requestData: requestDataConvos,
    response: responseConvos,
    clear: clearConvos,
  } = useReq();

  const {
    response: responseRemAvatar,
    requestData: requestDataRemAvatar,
    clear: clearRemAvatar,
  } = useReq();

  const { pathname } = location;
  const { socket, logout } = ctx;

  //for new message
  const updateSidebar = useCallback(
    (newData) => {
      const newConversations = [...conversations];
      let indexOf = conversations.findIndex(
        (conversation) => conversation.id === newData.id
      );

      if (indexOf === -1) {
        requestDataConvos("GET", "/user/conversations");
        return;
      }

      const newConversation = {
        ...newConversations[indexOf],
        lastMessage: newData.lastMessage,
        unread: newConversations[indexOf].unread + newData.unread,
        typing: false,
      };

      newConversations.splice(indexOf, 1);

      newConversations.unshift(newConversation);

      setConversations(newConversations);

      if (searchedUsers.length > 0) {
        const newSearchedUsers = [...searchedUsers];
        indexOf = searchedUsers.findIndex(
          (conversation) => conversation.id === newData.id
        );

        if (indexOf !== -1) {
          newSearchedUsers[indexOf] = {
            ...newSearchedUsers[indexOf],
            lastMessage: newData.lastMessage,
            unread: newData.unread,
            typing: false,
          };

          setSearchedUsers(newSearchedUsers);
        }
      }
    },
    [conversations, searchedUsers]
  );

  const updateSidebarMessageStatus = useCallback(
    ({ convoId, status }) => {
      const newConversations = [...conversations];
      let indexOf = conversations.findIndex(
        (conversation) => conversation.id === convoId
      );

      const newConversation = {
        ...newConversations[indexOf],
        lastMessage: {
          ...newConversations[indexOf].lastMessage,
          status,
        },
      };

      newConversations[indexOf] = newConversation;

      setConversations(newConversations);
    },
    [conversations]
  );

  const updateTypingMessage = useCallback(
    ({ convoId, status }) => {
      const newConversations = [...conversations];
      let indexOf = conversations.findIndex(
        (conversation) => conversation.id === convoId
      );

      const newConversation = {
        ...newConversations[indexOf],
        typing: status,
      };

      newConversations[indexOf] = newConversation;

      setConversations(newConversations);
    },
    [conversations]
  );

  useEffect(() => {
    const splitted = pathname.split("/");

    if (socket) {
      if (splitted.length === 3 && splitted[1] === "chat") {
        socket.emit("updatePage", { conversationId: splitted[2] });
      } else {
        socket.emit("updatePage", { conversationId: "noConvo" });
      }
    }
  }, [pathname, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("forSidebar", updateSidebar);
      socket.on("messageReadMain", updateSidebarMessageStatus);
      socket.on("forSidebarTyping", updateTypingMessage);

      return () => {
        socket.off("forSidebar", updateSidebar);
        socket.off("messageReadMain", updateSidebarMessageStatus);
        socket.off("forSidebarTyping", updateTypingMessage);
      };
    }
  }, [socket, updateSidebar, updateSidebarMessageStatus, updateTypingMessage]);

  useEffect(() => {
    requestDataConvos("GET", "/user/conversations");
  }, []);

  useEffect(() => {
    if (responseConvos !== null) {
      setConversations(responseConvos.conversations);
      clearConvos();
    }
  }, [responseConvos]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchValue.length === 0) {
        clear();
      }
      if (searchValue.length > 1) {
        clear();
        requestData("get", `/user/search/${searchValue}`);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchValue]);

  useEffect(() => {
    if (response !== null) {
      setSearchedUsers(response.users);
    }
  }, [response]);

  useEffect(() => {
    if (responseRemAvatar !== null) {
      ctx.showAlert("Profile photo removed.");
      ctx.setAvatar(null);
      clearRemAvatar();
    }
  }, [responseRemAvatar]);

  const removeAvatar = () => {
    if (ctx.avatar) {
      requestDataRemAvatar("delete", "/user/avatar");
    }
  };

  const addNewUserToConversation = (details) => {
    const isAlreadyAdded = conversations.findIndex(
      (conversation) => conversation.id === details.id
    );
    if (isAlreadyAdded === -1) {
      const newCoversations = [...conversations];
      newCoversations.unshift({ ...details });

      setSearchValue("");
      setSearchedUsers([]);
      setConversations(newCoversations);
      history.push(`/chat/${details.id}`);
    }
  };

  const setUserAsUnread = (convoId) => {
    let convoIndex = conversations.findIndex((convo) => convo.id === convoId);
    if (convoIndex !== -1) {
      const temp = [...conversations];
      const convoObject = temp[convoIndex];
      temp[convoIndex] = { ...convoObject, unread: 0 };
      setConversations(temp);
    }
  };

  return (
    <aside className="sidebar">
      <header className="header">
        <div className="sidebar__avatar-wrapper">
          <img
            src={ctx?.avatar || defaultAvatar}
            alt={ctx?.name}
            className="avatar"
            onClick={() => setOpenPicker(true)}
            style={{ cursor: "pointer" }}
          />
        </div>
        <AvatarUploader openPicker={openPicker} makeMeFalse={setOpenPicker} />
        <div className="sidebar__actions">
          <button className="sidebar__action" aria-label="Status">
            <Icon
              id="status"
              className="sidebar__action-icon sidebar__action-icon--status"
            />
          </button>
          <button className="sidebar__action" aria-label="New chat">
            <Icon id="chat" className="sidebar__action-icon" />
          </button>
          <OptionsBtn
            className="sidebar__action"
            ariaLabel="Menu"
            iconId="menu"
            iconClassName="sidebar__action-icon"
            options={[
              { name: "New group", fn: null },
              { name: "Profile", fn: null },
              { name: "Archived", fn: null },
              { name: "Starred", fn: null },
              { name: "Settings", fn: null },
              { name: "Remove Avatar", fn: removeAvatar },
              { name: "Log out", fn: logout },
            ]}
          />
        </div>
      </header>
      {/* <Alert /> */}
      <div className="search-wrapper">
        <input
          required
          className="search"
          placeholder="Search or start a new chat"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <div className="search-icons">
          <Icon id="search" className="search-icon" />
          <button
            onClick={() => setSearchValue("")}
            className="search__back-btn"
          >
            <Icon id="back" />
          </button>
        </div>
      </div>
      <div className="sidebar__contacts">
        {searchValue.length > 0 &&
          searchedUsers.map((contact) => (
            <Contact
              key={contact.username}
              contact={contact}
              addToConvo={addNewUserToConversation}
              setUserAsUnread={setUserAsUnread}
              setSearchValue={setSearchValue}
            />
          ))}
        {searchValue.length > 0 && loading === true && (
          <p className="no-results">Loading...</p>
        )}
        {searchValue.length > 0 &&
          searchedUsers.length === 0 &&
          loading === false && <p className="no-results">No Results Found.</p>}
        {searchValue.length === 0 &&
          conversations.map((contact) => (
            <Contact
              key={contact.username}
              contact={contact}
              addToConvo={() => {}}
              setUserAsUnread={setUserAsUnread}
              setSearchValue={setSearchValue}
            />
          ))}
      </div>
    </aside>
  );
};

export default Sidebar;
