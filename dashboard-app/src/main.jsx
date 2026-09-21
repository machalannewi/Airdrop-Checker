import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Landing from "./Public/Landing.jsx";
import UserDashboardLayout from "./User/components/Header.jsx";
import Login from "./User/components/Login.jsx";
import Register from "./User/components/Register.jsx";
import ErrorPage from "./User/components/ErrorPage.jsx";
import ProtectedRoute from "./User/components/ProtectedRoute.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Landing /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        {
          path: "dashboard",
          element: (
            <ProtectedRoute>
              <UserDashboardLayout />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ],
  { basename: "/" }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
