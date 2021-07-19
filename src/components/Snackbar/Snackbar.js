import React, { useRef, useEffect } from "react";

import "./Snackbar.css";

const Snackbar = ({ text, ticks }) => {
  const wrapperRef = useRef();

  useEffect(() => {
    if (text !== null) {
      wrapperRef.current.classList.add("show");
      setTimeout(() => {
        wrapperRef.current.classList.remove("show");
      }, 2900);
    }
  }, [ticks]);

  return (
    <>
      <div ref={wrapperRef} id="wrapper">
        <div className="data">{text}</div>
      </div>
    </>
  );
};

export default Snackbar;
