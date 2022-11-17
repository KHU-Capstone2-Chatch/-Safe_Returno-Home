import './App.css';
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Routes, Route} from "react-router-dom";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

import {IconButton, Snackbar} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';


const firebaseConfig = {
    apiKey: "AIzaSyCBmxBKexmyU8z32SLFEKJMyanvbgtgc5o",
    authDomain: "safe-return-home-9a990.firebaseapp.com",
    projectId: "safe-return-home-9a990",
    storageBucket: "safe-return-home-9a990.appspot.com",
    messagingSenderId: "77493074863",
    appId: "1:77493074863:web:abfeab5e3f725c8e498d5a",
    measurementId: "G-C4JZN5HQXR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')

    const openAlert = (message) => {
        setMessage(message);
        setOpen(true);
    }

    return (
        <div>
            <Routes>
                <Route path="/login" exact={true} element={<Login />} />
                <Route path="/signUp" exact={true} element={<SignUp db={db} openAlert={openAlert}/>} />
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
            </Routes>


            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={open}
                color='primary'
                autoHideDuration={5000}
                onClose={() => {setOpen(false)}}
                message={message}
                action={<IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={() => {setOpen(false)}}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>}
            />
        </div>
    );
}

export default App;
