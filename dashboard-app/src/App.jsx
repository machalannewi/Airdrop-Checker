import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./User/context/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <Outlet />
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
    </AuthProvider>
  );
}

export default App;
