// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import UserDashboardLayout from './User/components/Header';
import { Outlet } from 'react-router-dom'; // Add this import
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {

  return (
    <>

            {/* Global elements that appear on every page */}
            <Outlet /> {/* This renders the matched child route */}
            <ToastContainer position="top-right" autoClose={2000} />
            
    </>
  )
}

export default App

