import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SendAll from "./components/send_all";
import Login from "./components/login";
import SendByCategory from "./components/send_by_category";
// import SendAll from "./views/SendAll";
import SendBySelectedContacts from "./components/send_by_selected_contatc";
import SendByAmbassador from "./components/send_by_ambassador";
// import SendByOutreach from "./views/SendByOutreach";
import Home from "./components/home";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/send_all" element={<SendAll />} />
        <Route path="/send_by_category" element={<SendByCategory />}/>
        <Route path="/send_by_ambassador" element={<SendByAmbassador />} />
         <Route path="/send_by_selected_contact" element={<SendBySelectedContacts />} /> 
      </Routes>
    </Router>
  );
}

export default App;