import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import "./styles/main.css";
import EmojiTray from "./components/EmojiTray";
import ChatInput from "./components/ChatInput";
import Header from "./components/Header";
import ChatSidebar from "./components/ChatSidebar";
import Icon from "../../components/Icon";
import Search from "./components/Search";
import Profile from "./components/Profile";
import Convo from "./components/Convo";
import { UsersContext } from "../../context/usersContext";
import useReq from "../../hook/useReq";
import { sameDay, MONTH } from "../../utils/formatTime";

const Chat = ({ match }) => {
  const ctx = useContext(UsersContext);

  const [messages, setMessages] = useState({});
  const [totalMessages, setTotalMessages] = useState(0);
  const [userDetails, setUserDetails] = useState({
    about: null,
    lastSeen: null,
    username: null,
    avatar: null,
    name: null,
  });
  const [username, setUsername] = useState("");
  const [lastMessageId, setLastMessageId] = useState(null);
  const [previouslastMessageId, setPreviouslastMessageId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentMessageSize, setCurrentMessageSize] = useState(0);

  const [showAttach, setShowAttach] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showSearchSidebar, setShowSearchSidebar] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const [isOnline, setIsOnline] = useState(false);

  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const [isScrolled, setIsScrolled] = useState(true);

  const lastMsgRef = useRef(null);
  const inputRef = useRef(null);
  const scrollToMe = useRef(null);

  const { response, requestData } = useReq();
  const { response: responseMore, requestData: requestDataMore } = useReq();

  const conversationId = match.params.id;

  const { socket } = ctx;

  useEffect(() => {
    if (scrollToMe.current && previouslastMessageId !== null) {
      scrollToMe.current.scrollIntoView();
      setIsScrolled(true);
    }
  }, [previouslastMessageId]);

  const updateIsOnline = useCallback(
    (un) => {
      if (username === un) {
        setIsOnline(true);
      }
    },
    [username]
  );

  const updateMessages = useCallback(
    (newMessage) => {
      const updateMessages2 = (newMessage) => {
        const newMessages = { ...messages };
        if (!newMessages["Today"]) {
          newMessages["Today"] = [];
        }
        newMessages["Today"].push(newMessage);
        setMessages(newMessages);
        setTotalMessages((prev) => prev + 1);
      };

      const messageDate = new Date(newMessage.time);
      const isTodayKeyAvailable = Object.keys(messages).findIndex(
        (m) => m === "Today"
      );

      if (isTodayKeyAvailable !== -1) {
        const firstMessageOfToday = messages["Today"][0];
        const timeOfMessage = new Date(firstMessageOfToday.time);

        if (sameDay(messageDate, timeOfMessage)) {
          updateMessages2(newMessage);
        } else {
          const newMessages = { ...messages };
          const isYesterdayKeyAvailable = Object.keys(messages).findIndex(
            (m) => m === "Yesterday"
          );

          if (isYesterdayKeyAvailable !== -1) {
            const firstMessageOfYesterday = messages["Yesterday"][0];
            const timeOfMessageY = new Date(firstMessageOfYesterday.time);

            const key = `${
              MONTH[timeOfMessageY.getMonth()]
            } ${timeOfMessageY.getDate()}, ${timeOfMessageY.getFullYear()}`;

            newMessages[key] = { ...newMessages["Yesterday"] };

            delete newMessages["Yesterday"];
          }

          newMessages["Yesterday"] = { ...newMessages["Today"] };

          delete newMessages["Today"];

          updateMessages2(newMessage);
        }
      } else {
        updateMessages2(newMessage);
      }
    },
    [messages]
  );

  const updateMessagesStatus = useCallback(
    ({ convoId, status }) => {
      if (conversationId === convoId) {
        const messagesKey = Object.keys(messages);
        const newMessages = { ...messages };
        for (let i = 0; i < messagesKey.length; i++) {
          newMessages[messagesKey[i]].forEach((message) => {
            if (status === "read") {
              message.status = status;
            } else if (status === "double") {
              message.status =
                message.status === "sent" ? "double" : message.status;
            }
          });
        }

        setMessages(newMessages);
      }
    },
    [conversationId, messages]
  );

  const updateOtherUserTypingStatus = useCallback(
    ({ convoId, status }) => {
      if (conversationId === convoId) {
        setOtherUserTyping(status);
      }
    },
    [conversationId]
  );

  const hasMoreMessages = useCallback(() => {
    const keys = Object.keys(messages);
    const arrayOfArray = [];

    keys.forEach((key) => arrayOfArray.push([...messages[key]]));

    const merged = [].concat.apply([], arrayOfArray);
    setCurrentMessageSize(merged.length);
    setTimeout(() => {
      setHasMore(totalMessages > merged.length);
    }, 10);
  }, [messages, totalMessages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversationId]);

  useEffect(() => {
    if (socket && username) {
      setTimeout(() => {
        socket.emit("isOnline");
      }, 1);
    }

    return () => setIsOnline(false);
  }, [socket, username]);

  useEffect(() => {
    if (socket && username) {
      socket.on("online", updateIsOnline);
      // socket.off("online", updateIsOnline).on("online", updateIsOnline);

      socket.on("lastSeen", (UN) => {
        if (username === UN) {
          setUserDetails((prev) => ({ ...prev, lastSeen: new Date() }));
          setIsOnline(false);
        }
      });

      socket.on("forChat", updateMessages);

      socket.on("messageReadChat", updateMessagesStatus);

      socket.on("forChatTyping", updateOtherUserTypingStatus);

      return () => {
        socket.removeAllListeners("online");
        // socket.off("online");
        socket.off("lastSeen");
        socket.off("forChat", updateMessages);
        socket.off("messageReadChat", updateMessagesStatus);
        socket.off("forChatTyping", updateOtherUserTypingStatus);
        // setIsOnline(false);
        setOtherUserTyping(false);
      };
    }
  }, [
    username,
    updateMessages,
    updateMessagesStatus,
    socket,
    updateIsOnline,
    updateOtherUserTypingStatus,
  ]);

  useEffect(() => {
    if (conversationId) {
      requestData("GET", `/user/conversation/${conversationId}`);
    }
  }, [conversationId]);

  useEffect(() => {
    if (response !== null) {
      setMessages(response.messages);
      setTotalMessages(response.total);
      // setUserDetails((prev) => ({ ...prev, ...response.userDetails }));
      setUserDetails({ ...response.userDetails });
      setUsername(response.userDetails.username);
      setLastMessageId(response.mId);

      if (socket) {
        socket.emit("updateUsername", response.userDetails.username);
      }
    }
  }, [response, socket]);

  useEffect(() => {
    if (currentMessageSize <= 20 && currentMessageSize !== 0) {
      scrollToLastMsg();
    }
  }, [currentMessageSize]);

  useEffect(() => {
    if (responseMore !== null) {
      setIsScrolled(false);
      mergeMessages(responseMore.messages);
      if (lastMessageId) {
        setPreviouslastMessageId(lastMessageId);
        setLastMessageId(responseMore.mId);
      }
    }
  }, [responseMore]);

  useEffect(() => {
    if (isScrolled) {
      hasMoreMessages();
    }
  }, [totalMessages, messages, hasMoreMessages, isScrolled]);

  const fetchMoreMessages = () => {
    if (lastMessageId !== null && hasMore) {
      setHasMore(false);
      requestDataMore(
        "GET",
        `/user/conversation/${conversationId}/${lastMessageId}`
      );
    }
  };

  const openSidebar = (cb) => {
    // close any open sidebar first
    setShowProfileSidebar(false);
    setShowSearchSidebar(false);

    // call callback fn
    cb(true);
  };

  const scrollToLastMsg = () => {
    if (Object.keys(messages).length !== 0) {
      lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const submitNewMessage = () => {
    socket.emit("newMessage", newMessage);
    setNewMessage("");
    scrollToLastMsg();
  };

  const mergeMessages = (two) => {
    const one = { ...messages };
    const third = { ...two, ...one };
    const firstKeys = Object.keys(one);
    const secondKeys = Object.keys(two);
    const common = firstKeys.filter((value) => secondKeys.includes(value));

    common.forEach((c) => (third[c] = [...two[c], ...one[c]]));

    setMessages(third);
  };

  return (
    <div className="chat">
      <div className="chat__body">
        <div className="chat__bg"></div>

        <Header
          user={userDetails}
          isOnline={isOnline ? true : userDetails.lastSeen}
          openProfileSidebar={() => openSidebar(setShowProfileSidebar)}
          openSearchSidebar={() => openSidebar(setShowSearchSidebar)}
          isTyping={otherUserTyping}
        />
        <div
          id="scrollableDiv"
          className="chat__content"
          style={{
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          <InfiniteScroll
            dataLength={currentMessageSize}
            next={fetchMoreMessages}
            inverse={true}
            hasMore={hasMore}
            scrollableTarget="scrollableDiv"
            scrollThreshold={"120px"}
          >
            <Convo
              lastMsgRef={lastMsgRef}
              messages={messages}
              scrollToMe={scrollToMe}
              messageId={previouslastMessageId}
              showEncryptionMessage={totalMessages === currentMessageSize}
            />
          </InfiniteScroll>
        </div>
        <footer className="chat__footer">
          <button
            className="chat__scroll-btn"
            aria-label="scroll down"
            onClick={scrollToLastMsg}
          >
            <Icon id="downArrow" />
          </button>
          {showEmojis && (
            <EmojiTray
              showEmojis={showEmojis}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
            />
          )}
          <ChatInput
            showEmojis={showEmojis}
            setShowEmojis={setShowEmojis}
            showAttach={showAttach}
            setShowAttach={setShowAttach}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            submitNewMessage={submitNewMessage}
            inputRef={inputRef}
            socket={socket}
          />
        </footer>
      </div>

      <ChatSidebar
        heading="Search Messages"
        active={showSearchSidebar}
        closeSidebar={() => setShowSearchSidebar(false)}
      >
        <Search user={userDetails} />
      </ChatSidebar>

      <ChatSidebar
        heading="Contact Info"
        active={showProfileSidebar}
        closeSidebar={() => setShowProfileSidebar(false)}
      >
        <Profile
          isOnline={isOnline ? true : userDetails.lastSeen}
          isTyping={otherUserTyping}
          user={userDetails}
        />
      </ChatSidebar>
    </div>
  );
};

export default Chat;
