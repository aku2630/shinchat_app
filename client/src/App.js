import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage/HomePage";
import ChatPage from "./pages/ChatPage/ChatPage";
import Room from "./components/VidAudCall/Room"

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
        <Route path="/room" element = {<Room/>}/>
      </Routes>
    </div>
  );
}

export default App;
