// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SendAll from "./components/send_all";
import Login from "./components/login";
import SendByCategory from "./components/send_by_category";
import SendBySelectedContacts from "./components/send_by_selected_contatc";
import SendByAmbassador from "./components/send_by_ambassador";
import NotFound from "./components/NotFound";
import Home from "./components/home";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const basename =
    process.env.NODE_ENV === "production" ? "/All-Nations-Web-Interface" : "/";
  useEffect(()=>{
    const tokenCheck = localStorage.getItem("authToken");
    const tokenCheckObject = JSON.parse(tokenCheck)
    console.log(tokenCheckObject)
    if (tokenCheckObject === null){
      setIsAuthenticated(false)
    }
  })
  return (
    <Router basename={basename}>

        {isAuthenticated ? 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/send_all" element={<SendAll />} />
          <Route path="/send_by_category" element={<SendByCategory />} />
          <Route path="/send_by_ambassador" element={<SendByAmbassador />} />
          <Route path="/send_by_selected_contact" element={<SendBySelectedContacts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
            :
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        }
    </Router>
  );
}
export default App;