import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import UserDashboardLayout from './User/components/Header'
import Login from './User/components/Login.jsx'
import Register from './User/components/Register.jsx'

// 1. Create the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Your main app component
    children: [
        { index: true, element: <Register /> },
        { path: 'dashboard', element: <UserDashboardLayout /> },
        { path: 'login', element: <Login /> },
        // { path: 'register', element: <Register /> },
    ],
  }
])

// 2. Render with RouterProvider
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)