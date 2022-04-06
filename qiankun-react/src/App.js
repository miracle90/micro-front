import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <BrowserRouter basename="/react">
      <Link to="/">首页</Link>
      <Link to="/about">关于</Link>
      <Routes>
        <Route path="/" element={<div>react子应用home页面</div>} />
        <Route path="/about" element={<div>react子应用about页面</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
