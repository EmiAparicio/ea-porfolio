import "./LandingPage.css";
import { useEffect } from "react";
import bgImg from "./hexBG.png";

export default function LandingPage() {
  useEffect(() => {
    // const link = document.querySelectorAll('nav > .hover-this');
    const cursor = document.getElementById("cursor");

    //       const animateit = function (e) {
    //             const span = this.querySelector('span');
    //             const { offsetX: x, offsetY: y } = e,
    //             { offsetWidth: width, offsetHeight: height } = this,

    //             move = 25,
    //             xMove = x / width * (move * 2) - move,
    //             yMove = y / height * (move * 2) - move;

    //             span.style.transform = `translate(${xMove}px, ${yMove}px)`;

    //             if (e.type === 'mouseleave') span.style.transform = '';
    //       };

    const editCursor = (e) => {
      const { clientX: x, clientY: y } = e;

      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
    };

    const editCursorOut = (e) => {
      const { clientX: x, clientY: y } = e;
      if (x <= 0 || y <= 0 || x >= window.innerWidth || y >= window.innerHeight)
        cursor.style.transform = "translate(-50%, -50%) scale(0)";
    };

    // link.forEach(b => b.addEventListener('mousemove', animateit));
    // link.forEach(b => b.addEventListener('mouseleave', animateit));
    window.addEventListener("mousemove", editCursor);
    window.addEventListener("mouseout", editCursorOut);
  }, []);

  return (
    <div className="bg">
      <div className="bgImg">
        <div id="cursor" className="cursor" />
        <div className="lighter" />
        <div className="lighter2" />
        <div className="lighter3" />
        {/* <div className="titleLighter" /> */}
      </div>
      <h1 className="title">EMILIANO APARICIO</h1>
      <h2 className="subtitle">Full Stack Web Developer</h2>
    </div>
  );
}
