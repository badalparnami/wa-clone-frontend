import { createContext } from "react";

export const initialUserState = {
  token: null,
  name: null,
  email: null,
  username: null,
  about: null,
  avatar: null,
  logout: null, //fn
  socket: null,
  setAvatar: null, //fn () => {}

  showAlert: null, //fn
};

export const UsersContext = createContext(initialUserState);
