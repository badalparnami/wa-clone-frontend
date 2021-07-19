import React, { useState, useEffect } from "react";

import "./main.css";
import useReq from "../../hook/useReq";
import Loader from "../../components/Loader";

const Auth = ({ update, makeMeFalse }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [appLoaded, setAppLoaded] = useState(false);
  const [startLoadProgress, setStartLoadProgress] = useState(false);

  const { error, loading, requestData, response, clear } = useReq();

  useEffect(() => {
    if (response !== null) {
      makeMeFalse(false);
      update({ ...response });
      localStorage.setItem("token", response.token);
    }
  }, [response]);

  useEffect(() => {
    if (loading) {
      setStartLoadProgress(true);
    } else if (loading === false) {
      setAppLoaded(true);
    }
  }, [loading]);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    clear();
    setAuthError("");
    if (!isLogin) {
      if (name.trim().length < 3) {
        setAuthError("Name should be of more than 3 letters");
        return;
      }

      if (!/^[a-zA-Z]([a-zA-Z]+){2,}(\s[a-zA-Z]([a-zA-Z]+)*)?$/.test(name)) {
        setAuthError(
          "Only alphabets allowed in name & only first and last name is allowed"
        );
      }

      if (username.trim().length < 3) {
        setAuthError("Username should be of more than 3 characters");
        return;
      }

      if (!/^[a-zA-Z0-9\\_.]+$/.test(username)) {
        setAuthError(
          "Username can contain only letters, numbers and symbols . or _ "
        );
        return;
      }
    }

    if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        email
      )
    ) {
      setAuthError("You have entered an invalid email address!");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password should be of minimum 6 characters");
      return;
    }

    if (isLogin) {
      requestData("POST", "/auth/login", { email, password });
    } else {
      requestData("POST", "/auth/signup", { name, username, email, password });
    }
  };

  if (!appLoaded && loading !== null) {
    return <Loader done={startLoadProgress} />;
  }

  return (
    <div className="auth-main">
      <div className="auth-sub">
        <form onSubmit={onSubmitHandler} className="signup" autoComplete="off">
          <h1>{isLogin ? "Login" : "Create account"}</h1>
          {isLogin ? (
            <h2>
              Don't have an account?{" "}
              <span onClick={() => setIsLogin(!isLogin)}>Sign up</span>
            </h2>
          ) : (
            <h2>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(!isLogin)}>Sign in</span>
            </h2>
          )}

          {!isLogin && (
            <>
              <div className="signup__field">
                <input
                  className="signup__input"
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setAuthError("");
                  }}
                />
                <label className="signup__label" htmlFor="name">
                  Name
                </label>
              </div>
              <div className="signup__field">
                <input
                  className="signup__input"
                  type="text"
                  name="username"
                  id="username"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setAuthError("");
                  }}
                />
                <label className="signup__label" htmlFor="username">
                  Username
                </label>
              </div>
            </>
          )}

          <div className="signup__field">
            <input
              className="signup__input"
              type="email"
              name="email"
              id="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setAuthError("");
              }}
            />
            <label className="signup__label" htmlFor="email">
              Email
            </label>
          </div>

          <div className="signup__field">
            <input
              className="signup__input"
              type="password"
              name="password"
              id="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError("");
              }}
            />
            <label className="signup__label" htmlFor="password">
              Password
            </label>
          </div>
          <button>{isLogin ? "Sign in" : "Sign up"}</button>
        </form>
        {authError && <p>({authError})</p>}
        {error && <p>({error})</p>}
      </div>
    </div>
  );
};

export default Auth;
