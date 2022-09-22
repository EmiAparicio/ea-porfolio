import { Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";

export function App() {
  return (
    <>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
        {/* <Route exact path="/*" element={<NavBar />}>
          <Route exact path="home" element={<Home />} />
          <Route path="*" element={<ErrorPage />} />
        </Route> */}
      </Routes>
    </>
  );
}
