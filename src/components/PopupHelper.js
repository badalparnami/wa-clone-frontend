import React, { useRef, useEffect } from "react";

const PopupHelper = ({
  children,
  isPopupOpen,
  setIsPopupOpen,
  closeOnClick,
}) => {
  const node = useRef();

  useEffect(() => {
    if (isPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen]);

  const handleClickOutside = (e) => {
    if (closeOnClick) {
      // setIsPopupOpen(false);
      setTimeout(() => setIsPopupOpen(false), 200);
      return;
    }
    if (node.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click
    setIsPopupOpen(false);
  };

  return <div ref={node}>{children}</div>;
};

export default PopupHelper;
