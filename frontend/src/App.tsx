import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import DragDrop from "./pages/DragDrop";
import View from "./pages/View";
import Download from "./pages/Download";
import Main from "./pages/Main";
import Registeration from "./pages/Registeration";
import Login from "./pages/Login";
import Archive from "./pages/Archive";
import Likes from "./pages/Likes";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "SmartADV - Upload";
        metaDescription = "AI기반 화면해설 방송 자동 생성 솔루션";
        break;
      case "/url":
      case "/examplesmain":
        title = "SmartADV - URL Input";
        metaDescription = "URL로 영상 해설 생성";
        break;
      case "/view":
      case "/examplesview":
        title = "SmartADV - View";
        metaDescription = "영상 시청";
        break;
      case "/download":
      case "/examplesdownload":
        title = "SmartADV - Download";
        metaDescription = "해설 오디오 다운로드";
        break;
      case "/login":
      case "/exampleslogin":
        title = "SmartADV - Login";
        metaDescription = "로그인";
        break;
      case "/register":
      case "/examplesregisteration":
        title = "SmartADV - Register";
        metaDescription = "회원가입";
        break;
      case "/archive":
        title = "SmartADV - Archive";
        metaDescription = "요청 기록";
        break;
      case "/likes":
        title = "SmartADV - Likes";
        metaDescription = "좋아요 목록";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
        'head > meta[name="description"]',
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<DragDrop />} />
      <Route path="/url" element={<Main />} />
      <Route path="/view" element={<View />} />
      <Route path="/download" element={<Download />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registeration />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="/likes" element={<Likes />} />
      {/* Legacy routes for backward compatibility */}
      <Route path="/examplesview" element={<View />} />
      <Route path="/examplesdownload" element={<Download />} />
      <Route path="/examplesmain" element={<Main />} />
      <Route path="/examplesregisteration" element={<Registeration />} />
      <Route path="/exampleslogin" element={<Login />} />
    </Routes>
  );
}
export default App;
