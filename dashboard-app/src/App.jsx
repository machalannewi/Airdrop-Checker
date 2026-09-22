import { Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/sonner.jsx";
import { AuthProvider } from "./User/context/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
