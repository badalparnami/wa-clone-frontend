import React, { useState, useEffect, useRef, useContext } from "react";

import useReq from "../hook/useReq";
import { UsersContext } from "../context/usersContext";

const AvatarUploader = ({ makeMeFalse, openPicker, isImage }) => {
  const ctx = useContext(UsersContext);

  const [file, setFile] = useState(null);
  const filePickerRef = useRef();

  const { response, requestData, clear } = useReq();

  useEffect(() => {
    if (openPicker) {
      filePickerRef.current.click();
      makeMeFalse(false);
    }
  }, [openPicker, makeMeFalse]);

  useEffect(() => {
    if (file) {
      if (file.type === "image/png" || file.type === "image/jpeg") {
        if (!isImage) {
          const formData = new FormData();
          formData.append("image", file);
          requestData("post", "/user/avatar", formData);
        } else {
          var reader = new FileReader();
          reader.onload = function (evt) {
            var msg = {};
            msg.file = evt.target.result;
            msg.fileName = file.name;
            msg.image = true;
            ctx.showAlert("Image Uploading...");
            ctx.socket.emit("newMessage", msg);
          };
          reader.readAsDataURL(file);
        }
      } else {
        ctx.showAlert("Invalid type. Supported types are png and jpeg.");
      }
      setFile(null);
    }
  }, [file]);

  useEffect(() => {
    if (response !== null) {
      ctx.showAlert("Profile photo added.");
      ctx.setAvatar(response.avatar);
      clear();
    }
  }, [response]);

  const pickedHandler = (event) => {
    let pickedFile;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
    }
  };

  return (
    <input
      ref={filePickerRef}
      type="file"
      style={{ display: "none" }}
      accept=".jpg,.png,.jpeg"
      onChange={pickedHandler}
    />
  );
};

export default AvatarUploader;
