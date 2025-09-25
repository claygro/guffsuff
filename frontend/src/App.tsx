import "./App.css";
import LayOut from "./Components/LayOut";
import MessageBox from "./Components/MessageBox";
import Signup from "./Components/Signup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/layout" element={<LayOut />}>
          <Route
            index
            element={
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a user to start chatting
              </div>
            }
          />
          <Route path="messageBox/:id" element={<MessageBox />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
