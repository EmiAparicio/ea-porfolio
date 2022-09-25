import "./LandingPage.css";
import { useEffect, useState } from "react";
import CircleType from "circletype";

import { IconContext } from "react-icons";
import { BsFillShareFill, BsFillHexagonFill } from "react-icons/bs";

import textFrame from "./textFrame.png";
import menuBtn from "./menuBtn.png";

export default function LandingPage() {
  useEffect(() => {
    const buttons = document.querySelectorAll("span.btn");
    const cursor = document.getElementById("cursor");
    const pointer = document.getElementById("pointer");

    const animateit = function (e) {
      pointer.style.backgroundColor = `#383838`;
      pointer.style.filter = `drop-shadow(0 0 3px #f0f0f0)`;

      if (e.type === "mouseout") {
        pointer.style.backgroundColor = `#f0f0f0`;
        pointer.style.filter = ``;
      }
    };

    buttons.forEach((b) => b.addEventListener("mousemove", animateit));
    buttons.forEach((b) => b.addEventListener("mouseout", animateit));

    const editCursor = (e) => {
      const { clientX: x, clientY: y } = e;

      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      pointer.style.left = x + "px";
      pointer.style.top = y + "px";
      pointer.style.transform = "translate(-50%, -50%) scale(1)";
    };

    const editCursorOut = (e) => {
      const { clientX: x, clientY: y } = e;
      if (
        x <= 0 ||
        y <= 0 ||
        x >= window.innerWidth ||
        y >= window.innerHeight
      ) {
        cursor.style.transform = "translate(-50%, -50%) scale(0)";
        pointer.style.transform = "translate(-50%, -50%) scale(0)";
      }
    };

    window.addEventListener("mousemove", editCursor);
    window.addEventListener("mouseout", editCursorOut);
  }, []);

  useEffect(() => {
    new CircleType(document.getElementById("menuCircle"));
  }, []);

  const [btnActive, setBtn] = useState(false);

  return (
    <>
      <div className="bg">
        <div className="bgImg">
          <div id="cursor" className="cursor" />
          <div id="pointer" className="pointer" />

          <div className="lighter" />
          <div className="lighter2" />
          <div className="lighter3" />

          <span
            className={btnActive ? "btnActive menuBtn" : "btn menuBtn"}
            onClick={() => {
              setBtn((prev) => !prev);
            }}
          >
            <div className="imgContainer">
              <img src={`${menuBtn}`} alt="menu" className="imgMenu" />
            </div>
          </span>
          <h3
            id={btnActive ? "btnCircleHidden" : "menuCircle"}
            className="rotation"
          >
            • Menu •• Menu •• Menu •• Menu •• Menu •• Menu •
          </h3>

          <div className="aboutContainer">
            <div className="aboutRel">
              <p className="about">
                I am a <b>bioengineer</b>, <b>full stack developer</b>, almost
                doctor of engineering, symphonic metal absolutist,{" "}
                <b>videogame designer</b> wannabe, and forever a cat lover. I'm
                interested in technology and programming since I can remember.
                Nowadays, I'm starting my own videogame project while working as
                a web dev.
              </p>
              <img className="aboutFrame" src={`${textFrame}`} alt="" />
              <img className="aboutFrame1" src={`${textFrame}`} alt="" />
            </div>
          </div>
        </div>
        <h1 className="title">EMILIANO APARICIO</h1>
        <h2 className="subtitle">Full Stack Web Developer</h2>
      </div>
    </>
  );
}

{
  /* <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "35px",
                  title: "menu",
                  className: "img",
                }}
              >
                <BsFillShareFill className="hexLink"/>
                <BsFillHexagonFill className="hex"/>
              </IconContext.Provider>
            </div> */
}
