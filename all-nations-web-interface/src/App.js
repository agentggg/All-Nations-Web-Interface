import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./components/AuthContext";

import SendAll from "./components/send_all";
import Login from "./components/login";
import SendByCategory from "./components/send_by_category";
import SendBySelectedContacts from "./components/send_by_selected_contatc";
import SendByAmbassador from "./components/send_by_ambassador";
import NotFound from "./components/NotFound";
import Home from "./components/home";
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
  const { isAuthenticated } = useContext(AuthContext);

  const basename =
    process.env.NODE_ENV === "production"
      ? "/All-Nations-Web-Interface"
      : "/";

  const PrivateRoute = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

  return (
    <Router basename={basename}>
      <Routes>

        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/send_all"
          element={
            <PrivateRoute>
              <SendAll />
            </PrivateRoute>
          }
        />
        <Route
          path="/send_by_category"
          element={
            <PrivateRoute>
              <SendByCategory />
            </PrivateRoute>
          }
        />
        <Route
          path="/send_by_ambassador"
          element={
            <PrivateRoute>
              <SendByAmbassador />
            </PrivateRoute>
          }
        />
        <Route
          path="/send_by_selected_contact"
          element={
            <PrivateRoute>
              <SendBySelectedContacts />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;