import "./App.css";
import LayOut from "./Components/LayOut";
import Login from "./Components/Login";
import MessageBox from "./Components/MessageBox";
import Signup from "./Components/Signup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import guffsuff from "../public/guffsuff.png";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/layout" element={<LayOut />}>
          <Route
            index
            element={
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="flex items-start gap-4 ">
                  <div>
                    <h1 className="text-2xl ">
                      Connect with your friends, family with guffsuff.
                    </h1>
                    <h1 className="text-2xl mt-2">
                      Click to your friends and do some chatting
                    </h1>
                  </div>
                  <img
                    className="w-40 h-40 rounded-xl"
                    src={guffsuff}
                    alt="guffsuff logo"
                  />
                </div>
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
