import "./LandingPage.css";
import { useEffect, useState } from "react";
import CircleType from "circletype";

import CV from "../EmilianoAparicio-CV.pdf";

import { IconContext } from "react-icons";
import { BsLinkedin } from "react-icons/bs";
import { SiMusicbrainz, SiGmail } from "react-icons/si";
import {
  GiTechnoHeart,
  GiHeadshot,
  GiBiceps,
  GiBrain,
  GiConsoleController,
  GiDiploma,
  GiDna1,
  GiLaptop,
  GiProcessor,
} from "react-icons/gi";
import { FaGraduationCap, FaFileDownload, FaGithub } from "react-icons/fa";

import textFrame from "./textFrame.png";
import menuBtn from "./menuBtn.png";
import hexLink1 from "./hexLink1.png";
import hexLink2 from "./hexLink2.png";

export default function LandingPage() {
  useEffect(() => {
    const buttons = document.querySelectorAll(".btn");
    const smallButtons = document.querySelectorAll(".smallBtn");
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
    smallButtons.forEach((b) => b.addEventListener("mousemove", animateit));
    smallButtons.forEach((b) => b.addEventListener("mouseout", animateit));

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
    new CircleType(document.getElementById("CVCircle"));
    new CircleType(document.getElementById("menuCircle"));
    new CircleType(document.getElementById("skillsCircle"));
    new CircleType(document.getElementById("followCircle"));
    new CircleType(document.getElementById("linkedinCircle"));
    new CircleType(document.getElementById("githubCircle"));
    new CircleType(document.getElementById("mailCircle"));
  }, []);

  const [btnMenuActive, setMenuBtn] = useState(false);
  const [btnSkillsActive, setSkillsBtn] = useState(false);
  const [btnFollowActive, setFollowBtn] = useState(false);
  const [btnMailActive, setMailBtn] = useState(false);

  return (
    <>
      <div className="bg">
        <div className="bgImg">
          <div id="cursor" className="cursor" />
          <div id="pointer" className="pointer" />

          <div className="lighter" />
          <div className="lighter2" />
          <div className="lighter3" />

          {/* CV Button */}
          <a
            href={`${CV}`}
            className="smallBtn CVBtnDefault"
            download="EmilianoAparicio-CV"
            draggable="false"
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "38px",
                  title: "CV",
                  className: "img",
                }}
              >
                <FaFileDownload className="imgCV" />
              </IconContext.Provider>
            </div>
          </a>
          <h3 id="CVCircle" className="rotation">
            • Download CV •• Download CV •• Download CV •
          </h3>
          {/* CV Button */}

          {/* Menu Button */}
          <span
            className={btnMenuActive ? "btnActive menuBtn" : "btn menuBtn"}
            onClick={() => {
              setMenuBtn((prev) => {
                if (prev) {
                  setFollowBtn(false);
                  setSkillsBtn(false);
                }
                return !prev;
              });
            }}
          >
            <div className="imgContainer">
              <img src={`${menuBtn}`} alt="menu" className="imgMenu" />
            </div>
          </span>
          <h3
            id={btnMenuActive ? "btnCircleHidden" : "menuCircle"}
            className="rotation"
          >
            • Menu •• Menu •• Menu •• Menu •• Menu •• Menu •
          </h3>
          {/* Menu Button */}

          {/* Skills Button */}
          <span
            className={
              btnSkillsActive && btnMenuActive
                ? "btnActive skillsBtn"
                : !btnMenuActive
                ? "btn skillsBtn invisible"
                : "btn skillsBtn"
            }
            onClick={() => {
              setSkillsBtn((prev) => !prev);
            }}
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "55px",
                  title: "skills",
                  className: "img",
                }}
              >
                <GiBrain className="imgSkills" />
              </IconContext.Provider>
            </div>
          </span>
          <h3
            id={btnSkillsActive ? "btnCircleHidden" : "skillsCircle"}
            className="rotation"
          >
            • Skills •• Skills •• Skills •• Skills •• Skills •• Skills •
          </h3>

          {btnMenuActive ? (
            <img src={`${hexLink1}`} alt="" className="hexLink1Skills" />
          ) : (
            <></>
          )}
          {/* Skills Button */}

          {/* Follow Button */}
          <span
            className={
              btnFollowActive && btnMenuActive
                ? "btnActive followBtn"
                : !btnMenuActive
                ? "btn followBtn invisible"
                : "btn followBtn"
            }
            onClick={() => {
              setFollowBtn((prev) => {
                if (prev) setMailBtn(false);
                return !prev;
              });
            }}
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "55px",
                  title: "follow",
                  className: "img",
                }}
              >
                <GiTechnoHeart className="imgFollow" />
              </IconContext.Provider>
            </div>
          </span>
          <h3
            id={btnSkillsActive ? "btnCircleHidden" : "followCircle"}
            className="rotation"
          >
            • Follow Me •• Follow Me •• Follow Me •• Follow Me •
          </h3>

          {btnMenuActive ? (
            <img src={`${hexLink1}`} alt="" className="hexLink1Follow" />
          ) : (
            <></>
          )}
          {/* ****** Follow Options */}
          <a
            href="https://www.linkedin.com/in/emiliano-aparicio-8b9757236/"
            target="_blank"
            className={
              btnFollowActive
                ? "smallBtn linkedinBtn"
                : "smallBtn linkedinBtn invisible"
            }
            rel="noreferrer"
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "39px",
                  title: "linkedin",
                  className: "img",
                }}
              >
                <BsLinkedin className="imgLinkedin" />
              </IconContext.Provider>
            </div>
          </a>
          <h3 id="linkedinCircle" className="rotation">
            • LinkedIn •• LinkedIn •• LinkedIn •
          </h3>

          <a
            href="https://github.com/NoahReaver"
            target="_blank"
            className={
              btnFollowActive
                ? "smallBtn githubBtn"
                : "smallBtn githubBtn invisible"
            }
            rel="noreferrer"
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "39px",
                  title: "linkedin",
                  className: "img",
                }}
              >
                <FaGithub className="imgGithub" />
              </IconContext.Provider>
            </div>
          </a>
          <h3 id="githubCircle" className="rotation">
            • GitHub •• GitHub •• GitHub •• GitHub •
          </h3>

          <span
            className={
              btnFollowActive && btnMailActive
                ? "smallBtnActive mailBtn"
                : !btnFollowActive
                ? "smallBtn mailBtn invisible"
                : "smallBtn mailBtn"
            }
            onClick={() => {
              setMailBtn((prev) => !prev);
            }}
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "40px",
                  title: "mail",
                  className: "img",
                }}
              >
                <SiGmail className="imgMail" />
              </IconContext.Provider>
            </div>
          </span>
          <h3
            id={btnMailActive ? "btnCircleHidden" : "mailCircle"}
            className="rotation"
          >
            • E-mail •• E-mail •• E-mail •• E-mail •
          </h3>

          {btnFollowActive ? (
            <img src={`${hexLink2}`} alt="" className="hexLink2Follow" />
          ) : (
            <></>
          )}
          {/* ****** Follow Options */}
          {/* Follow Button */}

          {/* About Section */}
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
