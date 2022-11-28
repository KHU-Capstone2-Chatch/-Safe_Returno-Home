import './App.css';
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Routes, Route, RouterProvider, createBrowserRouter} from "react-router-dom";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

// Import the functions you need from the SDKs you need
import { getMessaging, getToken } from 'firebase/messaging';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

import {IconButton, Snackbar} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
    const [open, setOpen] = useState(false)
    const [alertColor, setAlertColor] = useState('primary')
    const [message, setMessage] = useState('')

    const openAlert = (message, color) => {
        setMessage(message);
        setOpen(true);
        if (color) {
            setAlertColor('error')
        } else {
            setAlertColor('primary')
        }
    }

    const router = createBrowserRouter([
        {
            path: "/login",
            element: <Login openAlert={openAlert} db={db} />,
            errorElement: <NotFound />,
        },
        {
            path: "/",
            element: <Home openAlert={openAlert} db={db} />,
            errorElement: <NotFound />,
        },
        {
            path: "/admin",
            element: <Admin openAlert={openAlert} db={db} />,
            errorElement: <NotFound />,
        },
        {
            path: "/signUp",
            element: <SignUp openAlert={openAlert} db={db} />,
            errorElement: <NotFound />,
        },
    ]);

    return (
        <div>
            <RouterProvider router={router} />
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={open}
                color={alertColor}
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
