import logo from './logo.svg';
import './App.css';
import React, { useCallback, useEffect, useRef } from "react";
import {Routes, Route} from "react-router-dom";
import axios from 'axios';

import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Home from "./Pages/Home";
import NotFound from "./Pages/NotFound";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBLfQFVnh6klFxxhFQqqFS31eBaKV4m91o",
    authDomain: "safe-return-home.firebaseapp.com",
    projectId: "safe-return-home",
    storageBucket: "safe-return-home.appspot.com",
    messagingSenderId: "710952552263",
    appId: "1:710952552263:web:fa679c633e7bc403e86e62",
    measurementId: "G-GSS2L75SDM"
};

const app = initializeApp(firebaseConfig);

function App() {
    return (
        <Routes>
            <Route path="/" exact={true} element={<Login />} />
            <Route path="/signUp" exact={true} element={<SignUp />} />
            <Route path="/home" element={<Home />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
