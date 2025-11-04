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

function App() {
  // "/" in dev, "/All-Nations-Web-Interface" in prod (GH Pages)
  const basename =
    process.env.NODE_ENV === "production" ? "/All-Nations-Web-Interface" : "/";

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/send_all" element={<SendAll />} />
        <Route path="/send_by_category" element={<SendByCategory />} />
        <Route path="/send_by_ambassador" element={<SendByAmbassador />} />
        <Route path="/send_by_selected_contact" element={<SendBySelectedContacts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
export default App;