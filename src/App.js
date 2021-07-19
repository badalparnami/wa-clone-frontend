import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import io from "socket.io-client";

import "./App.css";
import Loader from "./components/Loader";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import { UsersContext, initialUserState } from "./context/usersContext";
import useReq from "./hook/useReq";
import Snackbar from "./components/Snackbar/Snackbar";

const userPrefersDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [startLoadProgress, setStartLoadProgress] = useState(false);

  const [showLoader, setShowLoader] = useState(true);
  const [checkedTokenIsAvailable, setCheckedTokenIsAvailable] = useState(false);

  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertTicks, setAlertTicks] = useState(null);
  const [alertText, setAlertText] = useState(null);

  const socket = useRef();

  const { loading, requestData, response } = useReq();
  const { requestData: requestDataL, response: responseL } = useReq();

  const [userDetails, setUserDetails] = useState(initialUserState);

  const { token } = userDetails;

  useEffect(() => {
    console.log(`
    //////////////////////////////////////////////////////////////////

    https://github.com/badalparnami/

    //////////////////////////////////////////////////////////////////

    https://github.com/KarenOk/

    ///////////////////////////////////////////////////////////////////
    `);
  }, []);

  useEffect(() => {
    if (userPrefersDark) document.body.classList.add("dark-theme");

    const token = localStorage.getItem("token");
    if (token) {
      setUserDetails((ud) => ({ ...ud, token }));
    } else {
      setCheckedTokenIsAvailable(true);
    }
  }, []);

  useEffect(() => {
    if (token) {
      requestData("GET", "/user/profile", null, token);
    }
  }, [token]);

  useEffect(() => {
    if (showLoader) {
      if (loading) {
        setStartLoadProgress(true);
        setShowLoader(false);
      } else if (loading === false) {
        setAppLoaded(true);
        setShowLoader(false);
      }
    }
  }, [loading, showLoader]);

  useEffect(() => {
    if (response !== null) {
      setUserDetails((ud) => ({ ...ud, ...response }));

      if (!socket.current) {
        socket.current = io("http://localhost:8080");
      }

      if (socket.current) {
        socket.current.emit("join", { token });

        //RECONNECTION LOGIC

        socket.current.io.on("reconnect", (attempt) => {
          socket.current.emit("join", { token });

          const splitted = window.location.pathname.split("/");

          if (splitted.length === 3 && splitted[1] === "chat") {
            socket.current.emit("updatePage", {
              conversationId: splitted[2],
            });
          }
        });
      }
    }

    return () => {
      if (socket.current) {
        socket.current.off();
      }
    };
  }, [response]);

  useEffect(() => {
    if (responseL !== null) {
      localStorage.removeItem("token");
      setUserDetails({ ...initialUserState });
      socket.current.off();
      window.location.reload(false);
    }
  }, [responseL]);

  const logout = () => {
    requestDataL("POST", "/auth/logout", null, token);
  };

  const setAvatar = (av) => {
    setUserDetails({ ...userDetails, avatar: av });
  };

  const hideAlertHandler = () => {
    setIsAlertActive(false);
    setAlertText(null);
    setAlertTicks(null);
  };

  const showAlertHandler = (text) => {
    setIsAlertActive(true);
    setAlertText(text);
    setAlertTicks(Date.now());
  };

  const showAlert = (text) => {
    if (isAlertActive) {
      setTimeout(() => {
        setTimeout(() => {
          hideAlertHandler();
        }, 3000);
        showAlertHandler(text);
      }, 3000 - (Date.now() - alertTicks) + 500);
    } else {
      setTimeout(() => {
        hideAlertHandler();
      }, 3000);

      showAlertHandler(text);
    }
  };

  if (!token && checkedTokenIsAvailable) {
    return (
      <>
        <p className="app__mobile-message"> Only available on desktop 😊. </p>
        <div style={{ display: "block" }} className="app-content">
          <Auth update={setUserDetails} makeMeFalse={setShowLoader} />;
        </div>
      </>
    );
  }

  if (token && !appLoaded && showLoader)
    return <Loader done={startLoadProgress} />;

  return (
    <UsersContext.Provider
      value={{
        ...userDetails,
        logout,
        socket: socket.current,
        setAvatar,
        showAlert,
      }}
    >
      <div className="app">
        <p className="app__mobile-message"> Only available on desktop 😊. </p>
        {token && (
          <Router>
            <div className="app-content">
              <Snackbar text={alertText} ticks={alertTicks} />
              <Sidebar />
              <Switch>
                <Route path="/chat/:id" component={Chat} />
                <Route component={Home} />
              </Switch>
            </div>
          </Router>
        )}
      </div>
    </UsersContext.Provider>
  );
}

export default App;
