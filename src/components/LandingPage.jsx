import "./LandingPage.css";
// import nodemailer from "nodemailer";
import { useEffect, useState } from "react";
import CircleType from "circletype";
import dotenv from "dotenv";

import CV from "../EmilianoAparicio-CV.pdf";

import { IconContext } from "react-icons";
import { BsLinkedin } from "react-icons/bs";
// import { SiMusicbrainz, SiGmail } from "react-icons/si";
import {
  GiTechnoHeart,
  GiBrain,
  GiConsoleController,
  GiDna1,
  GiLaptop,
  GiGearHammer,
} from "react-icons/gi";
import { FaFileDownload, FaGithub, FaWhatsapp, FaPlane } from "react-icons/fa";
import { MdWork } from "react-icons/md";

import textFrame from "./textFrame.svg";
import menuBtn from "./menuBtn.svg";
import starcraft from "./starcraft.svg";
import hexLink1 from "./hexLink1.svg";
import hexLink2 from "./hexLink2.svg";
import hexLink3 from "./hexLink3.svg";
import lab from "./lab.svg";
import paper from "./paper.svg";

const copiedText = { bool: false };
const timeOut = { id: null };
const invasionTours = "https://youtu.be/LpUk5ruzUlI";
const starCards = "https://youtu.be/KbUT9VvM3X8";

export default function LandingPage() {
  dotenv.config();
  // const mailPW = process.env.GMAIL_PW;

  // function sendMails(){
  //   nodemailer.createTestAccount((err, account) => {
  //     try {
  //       const htmlEmail = `
  //           <img src="https://i.ibb.co/SfKhMg2/Sin-t-tulo-1-Mesa-de-trabajo-1.png" width="1100" height="200" title="Logo">
  //           <h3 style="text-align:center">--> STARCARDS <--</h3>

  //           <h3 style="text-align:center">TOKEN:</h3>
  //           <h2 style="text-align:center; border: 1px solid red; height: 200; background-color: rgba(0, 0, 0, 0.167)
  //           ;
  //           " >${tokenValid}</h2>
  //           <h4 style="text-align:center">No comparta esta informacion con NADIE. TOKEN de acceso UNICO</h4>
  //         `;

  //       let transporter = nodemailer.createTransport({
  //         host: "smtp.gmail.com",
  //         port: 587,
  //         auth: {
  //           user: "emilianojaparicio@gmail.com", //El email del servicio SMTP que va a utilizar (en este caso Gmail)
  //           pass: mailPW, // La contraseña de dicho SMTP
  //         },
  //       });

  //       let mailOptions = {
  //         from: "emilianojaparicio@gmail.com", // Quien manda el email
  //         to: contactMail, // El email de destino
  //         replyTo: "emilianojaparicio@gmail.com",
  //         subject: "Contact Emiliano Aparicio", // El asunto del email
  //         // text: contactMsg, // El mensaje
  //         html: htmlEmail, // La parte HTML del email
  //       };

  //       transporter.sendMail(mailOptions, (err, info) => {
  //         if (err) {
  //           return console.log("err");
  //         }
  //         res.send(tokenValid);
  //         console.log("Mensaje enviado");
  //       });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   });
  // }

  // const [copiedText, setCopiedText] = useState({bool: false});

  // useEffect(() => {
  //   console.log(copiedText);
  //   if (copiedText)
  //     setTimeout(() => {
  //       setCopiedText(false);
  //     }, 1000);
  // }, [copiedText]);

  const [btnCVmoved, setBtnCV] = useState(false);
  const [btnMenuActive, setMenuBtn] = useState(false);
  const [btnSkillsActive, setSkillsBtn] = useState(false);
  const [btnFollowActive, setFollowBtn] = useState(false);
  // const [btnMailActive, setMailBtn] = useState(false);
  const [btnWebActive, setWebBtn] = useState(false);
  const [btnBioActive, setBioBtn] = useState(false);
  const [btnGameActive, setGameBtn] = useState(false);
  const [btnProjectsActive, setProjectsBtn] = useState(false);
  const [btnPj1Active, setPj1Btn] = useState(false);
  const [btnPj2Active, setPj2Btn] = useState(false);
  const [btnPubsActive, setPubsBtn] = useState(false);
  const [btnObmActive, setObmBtn] = useState(false);

  useEffect(() => {
    new CircleType(document.querySelectorAll('[roundedtext="CVCircle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="menuCircle"]')[0]);
    new CircleType(
      document.querySelectorAll('[roundedtext="skillsCircle"]')[0]
    );
    new CircleType(
      document.querySelectorAll('[roundedtext="followCircle"]')[0]
    );
    new CircleType(
      document.querySelectorAll('[roundedtext="linkedinCircle"]')[0]
    );
    new CircleType(
      document.querySelectorAll('[roundedtext="githubCircle"]')[0]
    );
    new CircleType(document.querySelectorAll('[roundedtext="wppCircle"]')[0]);
    // new CircleType(document.querySelectorAll('[roundedtext="mailCircle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="webCircle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="bioCircle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="gameCircle"]')[0]);
    new CircleType(
      document.querySelectorAll('[roundedtext="projectsCircle"]')[0]
    );
    new CircleType(document.querySelectorAll('[roundedtext="pj1Circle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="pj2Circle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="PICircle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="PGCircle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="pubsCircle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="P1Circle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="P2Circle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="P3Circle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="P4Circle"]')[0]);
    new CircleType(document.querySelectorAll('[roundedtext="obmCircle"]')[0]);
  }, []);

  // useEffect(() => {
  //   if (btnWebActive) {
  //     const buttons = document.querySelectorAll(".btn");
  //     const smallButtons = document.querySelectorAll(".smallBtn");
  //     const cursor = document.querySelectorAll("cursor");
  //     const pointer = document.querySelectorAll("pointer");
  //     const henryLink = document.querySelectorAll("henry");

  //     const animateit = function (e) {
  //       pointer.style.backgroundColor = `#383838`;
  //       pointer.style.filter = `drop-shadow(0 0 3px #f0f0f0)`;

  //       if (pointer.className !== "pointer" && e.target.className !== "mail") {
  //         clearTimeout(timeOut.id);
  //         const pointerText = document.getElementById("copiedBtn");
  //         pointer.className = "pointer";
  //         pointerText.className = "invisibleText";
  //         pointer.style.backgroundColor = `#383838`;
  //         pointer.style.filter = `drop-shadow(0 0 3px #f0f0f0)`;
  //         copiedText.bool = false;
  //       }

  //       if (e.type === "mouseout") {
  //         const pointerText = document.getElementById("copiedBtn");
  //         if (copiedText.bool) {
  //           timeOut.id = setTimeout(() => {
  //             pointer.className = "pointer";
  //             pointerText.className = "invisibleText";
  //             pointer.style.backgroundColor = `#f0f0f0`;
  //             pointer.style.filter = ``;
  //             copiedText.bool = false;
  //             console.log("asd");
  //           }, 500);
  //         } else {
  //           pointer.style.backgroundColor = `#f0f0f0`;
  //           pointer.style.filter = ``;
  //         }
  //       }
  //     };

  //     buttons.forEach((b) => b.addEventListener("mousemove", animateit));
  //     buttons.forEach((b) => b.addEventListener("mouseout", animateit));
  //     smallButtons.forEach((b) => b.addEventListener("mousemove", animateit));
  //     smallButtons.forEach((b) => b.addEventListener("mouseout", animateit));
  //     henryLink.addEventListener("mousemove", animateit);
  //     henryLink.addEventListener("mouseout", animateit);

  //     const editCursor = (e) => {
  //       const { clientX: x, clientY: y } = e;

  //       cursor.style.left = x + "px";
  //       cursor.style.top = y + "px";
  //       cursor.style.transform = "translate(-50%, -50%) scale(1)";
  //       pointer.style.left = x + "px";
  //       pointer.style.top = y + "px";
  //       pointer.style.transform = "translate(-50%, -50%) scale(1)";
  //     };

  //     const editCursorOut = (e) => {
  //       const { clientX: x, clientY: y } = e;
  //       if (
  //         x <= 0 ||
  //         y <= 0 ||
  //         x >= window.innerWidth ||
  //         y >= window.innerHeight
  //       ) {
  //         cursor.style.transform = "translate(-50%, -50%) scale(0)";
  //         pointer.style.transform = "translate(-50%, -50%) scale(0)";
  //       }
  //     };

  //     window.addEventListener("mousemove", editCursor);
  //     window.addEventListener("mouseout", editCursorOut);
  //   } else if (btnBioActive) {
  //     const buttons = document.querySelectorAll(".btn");
  //     const smallButtons = document.querySelectorAll(".smallBtn");
  //     const cursor = document.querySelectorAll("cursor");
  //     const pointer = document.querySelectorAll("pointer");
  //     const umLink = document.querySelectorAll("um");

  //     const animateit = function (e) {
  //       pointer.style.backgroundColor = `#383838`;
  //       pointer.style.filter = `drop-shadow(0 0 3px #f0f0f0)`;

  //       if (pointer.className !== "pointer" && e.target.className !== "mail") {
  //         clearTimeout(timeOut.id);
  //         const pointerText = document.getElementById("copiedBtn");
  //         pointer.className = "pointer";
  //         pointerText.className = "invisibleText";
  //         pointer.style.backgroundColor = `#383838`;
  //         pointer.style.filter = `drop-shadow(0 0 3px #f0f0f0)`;
  //         copiedText.bool = false;
  //       }

  //       if (e.type === "mouseout") {
  //         const pointerText = document.getElementById("copiedBtn");
  //         if (copiedText.bool) {
  //           timeOut.id = setTimeout(() => {
  //             pointer.className = "pointer";
  //             pointerText.className = "invisibleText";
  //             pointer.style.backgroundColor = `#f0f0f0`;
  //             pointer.style.filter = ``;
  //             copiedText.bool = false;
  //             console.log("asd");
  //           }, 500);
  //         } else {
  //           pointer.style.backgroundColor = `#f0f0f0`;
  //           pointer.style.filter = ``;
  //         }
  //       }
  //     };

  //     buttons.forEach((b) => b.addEventListener("mousemove", animateit));
  //     buttons.forEach((b) => b.addEventListener("mouseout", animateit));
  //     smallButtons.forEach((b) => b.addEventListener("mousemove", animateit));
  //     smallButtons.forEach((b) => b.addEventListener("mouseout", animateit));
  //     umLink.addEventListener("mousemove", animateit);
  //     umLink.addEventListener("mouseout", animateit);

  //     const editCursor = (e) => {
  //       const { clientX: x, clientY: y } = e;

  //       cursor.style.left = x + "px";
  //       cursor.style.top = y + "px";
  //       cursor.style.transform = "translate(-50%, -50%) scale(1)";
  //       pointer.style.left = x + "px";
  //       pointer.style.top = y + "px";
  //       pointer.style.transform = "translate(-50%, -50%) scale(1)";
  //     };

  //     const editCursorOut = (e) => {
  //       const { clientX: x, clientY: y } = e;
  //       if (
  //         x <= 0 ||
  //         y <= 0 ||
  //         x >= window.innerWidth ||
  //         y >= window.innerHeight
  //       ) {
  //         cursor.style.transform = "translate(-50%, -50%) scale(0)";
  //         pointer.style.transform = "translate(-50%, -50%) scale(0)";
  //       }
  //     };

  //     window.addEventListener("mousemove", editCursor);
  //     window.addEventListener("mouseout", editCursorOut);
  //   }
  // }, [btnWebActive, btnBioActive]);

  // useEffect(() => {
  //   if (!btnBioActive && !btnWebActive && !btnGameActive) {
  //     const cursor = document.getElementById("cursor");
  //     const pointer = document.getElementById("pointer");
  //     const email = document.querySelector(".mail");

  //     const animateit = function (e) {
  //       pointer.style.backgroundColor = `#383838`;
  //       pointer.style.filter = `drop-shadow(0 0 3px #f0f0f0)`;

  //       if (pointer.className !== "pointer" && e.target.className !== "mail") {
  //         clearTimeout(timeOut.id);
  //         const pointerText = document.getElementById("copiedBtn");
  //         pointer.className = "pointer";
  //         pointerText.className = "invisibleText";
  //         pointer.style.backgroundColor = `#383838`;
  //         pointer.style.filter = `drop-shadow(0 0 3px #f0f0f0)`;
  //         copiedText.bool = false;
  //       }

  //       if (e.type === "mouseout") {
  //         const pointerText = document.getElementById("copiedBtn");
  //         if (copiedText.bool) {
  //           timeOut.id = setTimeout(() => {
  //             pointer.className = "pointer";
  //             pointerText.className = "invisibleText";
  //             pointer.style.backgroundColor = `#f0f0f0`;
  //             pointer.style.filter = ``;
  //             copiedText.bool = false;
  //           }, 500);
  //         } else {
  //           pointer.style.backgroundColor = `#f0f0f0`;
  //           pointer.style.filter = ``;
  //         }
  //       }
  //     };

  //     email.addEventListener("mousemove", animateit);
  //     email.addEventListener("mouseout", animateit);

  //     const editCursor = (e) => {
  //       const { clientX: x, clientY: y } = e;

  //       cursor.style.left = x + "px";
  //       cursor.style.top = y + "px";
  //       cursor.style.transform = "translate(-50%, -50%) scale(1)";
  //       pointer.style.left = x + "px";
  //       pointer.style.top = y + "px";
  //       pointer.style.transform = "translate(-50%, -50%) scale(1)";
  //     };

  //     const editCursorOut = (e) => {
  //       const { clientX: x, clientY: y } = e;
  //       if (
  //         x <= 0 ||
  //         y <= 0 ||
  //         x >= window.innerWidth ||
  //         y >= window.innerHeight
  //       ) {
  //         cursor.style.transform = "translate(-50%, -50%) scale(0)";
  //         pointer.style.transform = "translate(-50%, -50%) scale(0)";
  //       }
  //     };

  //     window.addEventListener("mousemove", editCursor);
  //     window.addEventListener("mouseout", editCursorOut);
  //   }
  // }, [btnBioActive, btnWebActive, btnGameActive]);

  useEffect(() => {
    const buttons = document.querySelectorAll(".btn");
    const smallButtons = document.querySelectorAll(".smallBtn");
    const cursor = document.getElementById("cursor");
    const pointer = document.getElementById("pointer");
    const henryLink = document.getElementById("henry");
    const umLink = document.getElementById("um");
    const email = document.querySelector(".mail");

    const animateit = function (e) {
      pointer.style.backgroundColor = `#383838`;
      pointer.style.filter = `drop-shadow(0 0 3px #f0f0f0)`;

      if (pointer.className !== "pointer" && e.target.className !== "mail") {
        clearTimeout(timeOut.id);
        const pointerText = document.getElementById("copiedBtn");
        pointer.className = "pointer";
        pointerText.className = "invisibleText";
        pointer.style.backgroundColor = `#383838`;
        pointer.style.filter = `drop-shadow(0 0 3px #f0f0f0)`;
        copiedText.bool = false;
      }

      if (e.type === "mouseout") {
        const pointerText = document.getElementById("copiedBtn");
        if (copiedText.bool) {
          timeOut.id = setTimeout(() => {
            pointer.className = "pointer";
            pointerText.className = "invisibleText";
            pointer.style.backgroundColor = `#f0f0f0`;
            pointer.style.filter = ``;
            copiedText.bool = false;
          }, 500);
        } else {
          pointer.style.backgroundColor = `#f0f0f0`;
          pointer.style.filter = ``;
        }
      }
    };

    buttons.forEach((b) => b.addEventListener("mousemove", animateit));
    buttons.forEach((b) => b.addEventListener("mouseout", animateit));
    smallButtons.forEach((b) => b.addEventListener("mousemove", animateit));
    smallButtons.forEach((b) => b.addEventListener("mouseout", animateit));
    email.addEventListener("mousemove", animateit);
    email.addEventListener("mouseout", animateit);
    henryLink.addEventListener("mousemove", animateit);
    henryLink.addEventListener("mouseout", animateit);
    umLink.addEventListener("mousemove", animateit);
    umLink.addEventListener("mouseout", animateit);

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
    setProjectsBtn(false);
    setPubsBtn(false);
  }, [btnBioActive, btnWebActive, btnGameActive]);

  const subtitle = btnBioActive
    ? "Bioengineer (PhD)"
    : btnGameActive
    ? "Game Designer"
    : "Jr. Full Stack Web Developer";

  const subtitleClass = btnBioActive
    ? "bioSubtitle"
    : btnGameActive
    ? "gameSubtitle"
    : "webSubtitle";

  return (
    <>
      <div className="bg">
        <div className="bgImg">
          <div id="cursor" className="cursor" />
          <div id="pointer" className="pointer">
            <span id="copiedBtn" className="invisibleText">
              Copied!
            </span>
          </div>

          <div className="lighter" />
          <div className="lighter2" />
          <div className="lighter3" />

          {/* Buttons*/}
          <>
            {/* CV Button */}
            <a
              href={`${CV}`}
              className={
                btnCVmoved ? "smallBtn CVBtnReplace" : "smallBtn CVBtnDefault"
              }
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
            <h3 id="CVCircle" roundedtext="CVCircle" className="rotation">
              • Download CV •• Download CV •• Download CV •
            </h3>
            {/* CV Button */}

            {/* Menu Button */}
            <span
              className={btnMenuActive ? "btnActive menuBtn" : "btn menuBtn"}
              onClick={() => {
                setMenuBtn((prev) => !prev);
                setFollowBtn(false);
                setSkillsBtn(false);
                setWebBtn(false);
                setBioBtn(false);
                setGameBtn(false);
                // setMailBtn(false);
                setBtnCV(false);
              }}
            >
              <div className="imgContainer">
                <img src={`${menuBtn}`} alt="menu" className="imgMenu" />
              </div>
            </span>
            <h3
              id={btnMenuActive ? "btnCircleHidden" : "menuCircle"}
              className="rotation"
              roundedtext="menuCircle"
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
                setWebBtn(false);
                setBioBtn(false);
                setGameBtn(false);
                setBtnCV(false);
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
              roundedtext="skillsCircle"
            >
              • Skills •• Skills •• Skills •• Skills •• Skills •• Skills •
            </h3>

            <img
              src={`${hexLink1}`}
              alt=""
              className={
                btnMenuActive ? "hexLink1Skills" : "hexLink1Skills invisible"
              }
            />
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
                setFollowBtn((prev) => !prev);
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
              id={btnFollowActive ? "btnCircleHidden" : "followCircle"}
              className="rotation"
              roundedtext="followCircle"
            >
              • Follow Me •• Follow Me •• Follow Me •• Follow Me •
            </h3>

            <img
              src={`${hexLink1}`}
              alt=""
              className={
                btnMenuActive ? "hexLink1Follow" : "hexLink1Follow invisible"
              }
            />

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
            <h3
              id="linkedinCircle"
              roundedtext="linkedinCircle"
              className="rotation"
            >
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
                    title: "github",
                    className: "img",
                  }}
                >
                  <FaGithub className="imgGithub" />
                </IconContext.Provider>
              </div>
            </a>
            <h3
              id="githubCircle"
              roundedtext="githubCircle"
              className="rotation"
            >
              • GitHub •• GitHub •• GitHub •• GitHub •
            </h3>

            <a
              href="https://wa.me/542616060053"
              target="_blank"
              className={
                btnFollowActive
                  ? "smallBtn wppBtn"
                  : "smallBtn wppBtn invisible"
              }
              rel="noreferrer"
            >
              <div className="imgContainer">
                <IconContext.Provider
                  value={{
                    color: "#383838",
                    size: "39px",
                    title: "whatsapp",
                    className: "img",
                  }}
                >
                  <FaWhatsapp className="imgWpp" />
                </IconContext.Provider>
              </div>
            </a>
            <h3 id="wppCircle" roundedtext="wppCircle" className="rotation">
              • WhatsApp •• WhatsApp •• WhatsApp •
            </h3>

            {/* <span
              className={
                btnFollowActive && btnMailActive
                  ? "smallBtnActive mailBtn"
                  : !btnFollowActive
                  ? "smallBtn mailBtn invisible"
                  : "smallBtn mailBtn"
              }
              onClick={() => {
                setMailBtn((prev) => {
                  if (!prev) {
                    setBtnCV(true);
                    setBioBtn(false);
                    setGameBtn(false);
                    setWebBtn(false);
                  } else setBtnCV(false);
                  return !prev;
                });
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
              roundedtext="mailCircle"
              className="rotation"
            >
              • E-mail •• E-mail •• E-mail •• E-mail •
            </h3> */}

            <img
              src={`${hexLink2}`}
              alt=""
              className={
                btnFollowActive ? "hexLink2Follow" : "hexLink2Follow invisible"
              }
            />

            {/* ****** Follow Options */}
            {/* Follow Button */}

            {/* ****** Skills Options */}
            <span
              className={
                btnSkillsActive && btnWebActive
                  ? "smallBtnActive webBtn"
                  : !btnSkillsActive
                  ? "smallBtn webBtn invisible"
                  : "smallBtn webBtn"
              }
              onClick={() => {
                setWebBtn((prev) => {
                  if (!prev) {
                    setBtnCV(true);
                  } else setBtnCV(false);
                  return !prev;
                });
                setBioBtn(false);
                setGameBtn(false);
                // setMailBtn(false);
              }}
            >
              <div className="imgContainer">
                <IconContext.Provider
                  value={{
                    color: "#383838",
                    size: "40px",
                    title: "web",
                    className: "img",
                  }}
                >
                  <GiLaptop className="imgWeb" />
                </IconContext.Provider>
              </div>
            </span>
            <h3
              id={btnWebActive ? "btnCircleHidden" : "webCircle"}
              className="rotation"
              roundedtext="webCircle"
            >
              • Web Development •• Web Development •
            </h3>

            <span
              className={
                btnSkillsActive && btnBioActive
                  ? "smallBtnActive bioBtn"
                  : !btnSkillsActive
                  ? "smallBtn bioBtn invisible"
                  : "smallBtn bioBtn"
              }
              onClick={() => {
                setBioBtn((prev) => {
                  if (!prev) {
                    setBtnCV(true);
                  } else setBtnCV(false);
                  return !prev;
                });
                // setMailBtn(false);
                setGameBtn(false);
                setWebBtn(false);
              }}
            >
              <div className="imgContainer">
                <IconContext.Provider
                  value={{
                    color: "#383838",
                    size: "40px",
                    title: "bio",
                    className: "img",
                  }}
                >
                  <GiDna1 className="imgBio" />
                </IconContext.Provider>
              </div>
            </span>
            <h3
              id={btnBioActive ? "btnCircleHidden" : "bioCircle"}
              className="rotation"
              roundedtext="bioCircle"
            >
              • Bioengineering •• Bioengineering •
            </h3>

            <span
              className={
                btnSkillsActive && btnGameActive
                  ? "smallBtnActive gameBtn"
                  : !btnSkillsActive
                  ? "smallBtn gameBtn invisible"
                  : "smallBtn gameBtn"
              }
              onClick={() => {
                setGameBtn((prev) => {
                  if (!prev) {
                    setBtnCV(true);
                  } else setBtnCV(false);
                  return !prev;
                });
                setBioBtn(false);
                // setMailBtn(false);
                setWebBtn(false);
              }}
            >
              <div className="imgContainer">
                <IconContext.Provider
                  value={{
                    color: "#383838",
                    size: "40px",
                    title: "game",
                    className: "img",
                  }}
                >
                  <GiConsoleController className="imgGame" />
                </IconContext.Provider>
              </div>
            </span>
            <h3
              id={btnGameActive ? "btnCircleHidden" : "gameCircle"}
              className="rotation"
              roundedtext="gameCircle"
            >
              • GameDesign •• GameDesign •• GameDesign •
            </h3>

            <img
              src={`${hexLink2}`}
              alt=""
              className={
                btnSkillsActive ? "hexLink2Skills" : "hexLink2Skills invisible"
              }
            />

            {/* ****** Skills Options */}
            {/* Skills Button */}
          </>

          {/* About Section */}

          <div
            className={
              !btnGameActive && !btnWebActive && !btnBioActive
                ? "aboutContainer"
                : "aboutContainer invisible"
            }
          >
            <div className="aboutRel">
              <p className="about">
                I am a <b>bioengineer</b>, <b>full stack developer</b>, almost
                doctor of engineering, symphonic metal absolutist,{" "}
                <b>videogame designer</b> wannabe, and forever a cat lover. I'm
                interested in technology and programming since I can remember.
                Nowadays, I'm starting my own videogame project while working as
                a web dev.
                <br />
                <br />
                <span className="email">
                  <span className="mailText">Reach me at: </span>
                  <span>
                    <b
                      className="mail"
                      onClick={(e) => {
                        navigator.clipboard.writeText(e.target.innerText);

                        const pointer = document.getElementById("pointer");
                        const pointerText =
                          document.getElementById("copiedBtn");

                        pointer.className = "copiedPointer";
                        pointerText.className = "copiedText";
                        copiedText.bool = true;
                      }}
                    >
                      emilianojaparicio@gmail.com
                    </b>
                  </span>
                </span>
              </p>
              <img className="aboutFrame" src={`${textFrame}`} alt="" />
              <img className="aboutFrame1" src={`${textFrame}`} alt="" />
            </div>
          </div>

          <div
            className={
              btnWebActive ? "aboutContainerWeb" : "aboutContainerWeb invisible"
            }
          >
            <div className="aboutRel">
              <p className="aboutWeb">
                Graduated from{" "}
                <b>
                  <a
                    href="https://www.soyhenry.com/"
                    id="henry"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Henry
                  </a>
                </b>
                . My set of abilities:
                <br />
                <br />• <b>Technologies (PERN)</b>: HTML, CSS, JavaScript,
                ReactJS, NodeJS, Redux, Sequelize, Express and PostgreSQL.
                <br />
                <br />• <b>Complementary</b>: Git, Trello and ThunderClient.
                <br />
                <br /> • <b>Main soft skills</b>: leadership, creativity,
                problem solving, logical and critical thinking.
              </p>
              <img className="aboutFrameWeb" src={`${textFrame}`} alt="" />
              <img className="aboutFrameWeb1" src={`${textFrame}`} alt="" />
            </div>
          </div>
          {/* Projects Button */}
          <span
            className={
              btnWebActive && !btnProjectsActive
                ? "btn projectsBtn"
                : btnProjectsActive
                ? "btnActive projectsBtn"
                : "invisible"
            }
            onClick={() => {
              setProjectsBtn((prev) => !prev);
              setPj1Btn(false);
              setPj2Btn(false);
            }}
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "55px",
                  title: "projects",
                  className: "img",
                }}
              >
                <MdWork className="imgProjects" />
              </IconContext.Provider>
            </div>
          </span>
          <h3
            id={btnProjectsActive ? "btnCircleHidden" : "projectsCircle"}
            className="rotation"
            roundedtext="projectsCircle"
          >
            • Projects •• Projects •• Projects •• Projects •
          </h3>

          <img
            src={`${hexLink3}`}
            alt=""
            className={
              btnProjectsActive
                ? "hexLink1Projects"
                : "hexLink1Projects invisible"
            }
          />

          <img
            src={`${hexLink3}`}
            alt=""
            className={
              btnProjectsActive
                ? "hexLink2Projects"
                : "hexLink2Projects invisible"
            }
          />

          <a
            href={invasionTours}
            target="_blank"
            className={
              btnProjectsActive
                ? "smallBtn pj1Btn"
                : "smallBtn pj1Btn invisible"
            }
            rel="noreferrer"
          >
            {/* <span
            className={
              btnProjectsActive && btnPj1Active
                ? "smallBtnActive pj1Btn"
                : !btnProjectsActive
                ? "smallBtn pj1Btn invisible"
                : "smallBtn pj1Btn"
            }
            onClick={() => {
              setPj1Btn((prev) => !prev);
              setPj2Btn(false);
            }}
          > */}
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "40px",
                  title: "CountriesApp",
                  className: "img",
                }}
              >
                <FaPlane className="imgPj1" />
              </IconContext.Provider>
            </div>
          </a>
          <h3
            id={btnPj1Active ? "btnCircleHidden" : "pj1Circle"}
            className="rotation"
            roundedtext="pj1Circle"
          >
            • Invasion Tours •• Invasion Tours •
          </h3>

          <a
            href={starCards}
            target="_blank"
            className={
              btnProjectsActive
                ? "smallBtn pj2Btn"
                : "smallBtn pj2Btn invisible"
            }
            rel="noreferrer"
          >
            {/* <span
            className={
              btnProjectsActive && btnPj2Active
                ? "smallBtnActive pj2Btn"
                : !btnProjectsActive
                ? "smallBtn pj2Btn invisible"
                : "smallBtn pj2Btn"
            }
            onClick={() => {
              setPj2Btn((prev) => !prev);
              setPj1Btn(false);
            }}
          > */}
            <div className="imgContainer">
              <img src={`${starcraft}`} alt="StarCards" className="imgPj2" />
            </div>
          </a>
          <h3
            id={btnPj2Active ? "btnCircleHidden" : "pj2Circle"}
            className="rotation"
            roundedtext="pj2Circle"
          >
            • StarCards •• StarCards •• StarCards •
          </h3>

          <a
            href="https://github.com/NoahReaver/HenryCountriesPI-InvasionTours"
            target="_blank"
            className={
              btnProjectsActive ? "smallBtn PIBtn" : "smallBtn PIBtn invisible"
            }
            rel="noreferrer"
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "39px",
                  title: "PI",
                  className: "img",
                }}
              >
                <FaGithub className="imgPI" />
              </IconContext.Provider>
            </div>
          </a>
          <h3 id="PICircle" roundedtext="PICircle" className="rotation">
            • Invasion Tours ••• GitHub ••
          </h3>

          <a
            href="https://github.com/NoahReaver/Henry-PG-StarCards"
            target="_blank"
            className={
              btnProjectsActive ? "smallBtn PGBtn" : "smallBtn PGBtn invisible"
            }
            rel="noreferrer"
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "39px",
                  title: "PI",
                  className: "img",
                }}
              >
                <FaGithub className="imgPG" />
              </IconContext.Provider>
            </div>
          </a>
          <h3 id="PGCircle" roundedtext="PGCircle" className="rotation">
            • StarCards ••• GitHub ••
          </h3>
          {/* Projects Button */}

          <div
            className={
              btnBioActive ? "aboutContainerBio" : "aboutContainerBio invisible"
            }
          >
            <div className="aboutRel">
              <p className="aboutBio">
                Graduated from{" "}
                <b>
                  <a
                    href="https://um.edu.ar/"
                    id="um"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Universidad de Mendoza
                  </a>
                </b>
                , Argentina. My background:
                <br />
                <br />• <b>Academic</b>: National Standard Bearer 2014, with a
                gold medal and the best engineering graduate (National Academy
                of Engineering) awards.
                <br />
                <br />• <b>Professional</b>: PhD CONICET Scholarship, professor
                of biomaterials (bioengineering career) and physics
                (pre-university level).
                <br />
                <br /> • <b>Researcher</b>: four scientific publications about
                atomistic simulations.
              </p>
              <img className="aboutFrameBio" src={`${textFrame}`} alt="" />
              <img className="aboutFrameBio1" src={`${textFrame}`} alt="" />
            </div>
          </div>
          {/* Publications Button */}
          <span
            className={
              btnBioActive && !btnPubsActive
                ? "btn pubsBtn"
                : btnPubsActive
                ? "btnActive pubsBtn"
                : "invisible"
            }
            onClick={() => {
              setPubsBtn((prev) => !prev);
            }}
          >
            <div className="imgContainer">
              <img src={`${lab}`} alt="Pubs" className="imgPubs" />
            </div>
          </span>
          <h3
            id={btnPubsActive ? "btnCircleHidden" : "pubsCircle"}
            className="rotation"
            roundedtext="pubsCircle"
          >
            • Publications •• Publications •• Publications •
          </h3>

          <img
            src={`${hexLink3}`}
            alt=""
            className={
              btnPubsActive ? "hexLink1Pubs" : "hexLink1Pubs invisible"
            }
          />

          <img
            src={`${hexLink3}`}
            alt=""
            className={
              btnPubsActive ? "hexLink2Pubs" : "hexLink2Pubs invisible"
            }
          />

          <a
            href="https://iopscience.iop.org/article/10.1088/1361-6528/abc036/meta"
            target="_blank"
            className={
              btnPubsActive ? "smallBtn P1Btn" : "smallBtn P1Btn invisible"
            }
            rel="noreferrer"
          >
            <div className="imgContainer">
              <img src={`${paper}`} alt="Pub1" className="imgP1" />
            </div>
          </a>
          <h3 id="P1Circle" roundedtext="P1Circle" className="rotation">
            •• GNR mechanical properties ••
          </h3>

          <a
            href="https://www.sciencedirect.com/science/article/abs/pii/S092702562030433X"
            target="_blank"
            className={
              btnPubsActive ? "smallBtn P2Btn" : "smallBtn P2Btn invisible"
            }
            rel="noreferrer"
          >
            <div className="imgContainer">
              <img src={`${paper}`} alt="Pub2" className="imgP2" />
            </div>
          </a>
          <h3 id="P2Circle" roundedtext="P2Circle" className="rotation">
            • FoamExplorer analysis software •
          </h3>

          <a
            href="https://pubs.rsc.org/en/content/articlelanding/2022/cp/d2cp00038e/unauth"
            target="_blank"
            className={
              btnPubsActive ? "smallBtn P3Btn" : "smallBtn P3Btn invisible"
            }
            rel="noreferrer"
          >
            <div className="imgContainer">
              <img src={`${paper}`} alt="Pub3" className="imgP3" />
            </div>
          </a>
          <h3 id="P3Circle" roundedtext="P3Circle" className="rotation">
            • Modulated graphene nanoribbons •
          </h3>

          <a
            href="https://www.sciencedirect.com/science/article/abs/pii/S0927025618301022"
            target="_blank"
            className={
              btnPubsActive ? "smallBtn P4Btn" : "smallBtn P4Btn invisible"
            }
            rel="noreferrer"
          >
            <div className="imgContainer">
              <img src={`${paper}`} alt="Pub4" className="imgP4" />
            </div>
          </a>
          <h3 id="P4Circle" roundedtext="P4Circle" className="rotation">
            • AU foams under indentation •
          </h3>
          {/* Publications Button */}

          <div
            className={
              btnGameActive
                ? "aboutContainerGame"
                : "aboutContainerGame invisible"
            }
          >
            <div className="aboutRel">
              <p className="aboutGame">
                Self-taught game and videogame <b>mechanics designer</b>. My
                strengths:
                <br />
                <br />• <b>Developing perspective</b>: my knowledge as a
                programmer helps me create base concepts compatible with the
                required computational logic.
                <br />
                <br />• <b>Economics</b>: my designs are focused on resource
                management, which makes them a perfect match for models such as
                play-to-earn (P2E) or microtransaction based systems.
                <br />
                <br /> • <b>Biomimetics</b>: I apply mathematical and
                computational models inspired in natural environments and
                ecosystems, which leads to evolutional self-balancing mechanics.
              </p>
              <img className="aboutFrameGame" src={`${textFrame}`} alt="" />
              <img className="aboutFrameGame1" src={`${textFrame}`} alt="" />
            </div>
          </div>
          {/* Oblivion Button */}
          <span
            className={
              btnGameActive && !btnObmActive
                ? "btn obmBtn"
                : btnObmActive
                ? "btnActive obmBtn"
                : "invisible"
            }
            // onClick={() => {
            //   setObmBtn((prev) => !prev);
            // }}
          >
            <div className="imgContainer">
              <IconContext.Provider
                value={{
                  color: "#383838",
                  size: "60px",
                  title: "game",
                  className: "img",
                }}
              >
                <GiGearHammer className="imgObm" />
              </IconContext.Provider>
            </div>
          </span>
          <h3
            id={btnObmActive ? "btnCircleHidden" : "obmCircle"}
            className="rotation"
            roundedtext="obmCircle"
          >
            • Oblivion Mechanics •• Coming Soon •
          </h3>
          {/* Oblivion Button */}
        </div>

        <h1 className="title">EMILIANO APARICIO</h1>
        <h2 className={subtitleClass}>{subtitle}</h2>
      </div>
    </>
  );
}
