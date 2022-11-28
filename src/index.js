import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, createBrowserRouter, RouterProvider} from "react-router-dom";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import User from "./pages/User";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <App/>
      {/*<BrowserRouter>*/}
      {/*    */}
      {/*</BrowserRouter>*/}
      {/*<RouterProvider router={router}>*/}
      {/*    <App />*/}
      {/*</RouterProvider>*/}
  </React.StrictMode>
);

reportWebVitals();
