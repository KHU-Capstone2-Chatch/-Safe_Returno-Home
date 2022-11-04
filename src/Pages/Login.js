import React, {useState} from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {Box, Button, TextField} from "@mui/material";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('r@gmail.com');
    const [password, setPassword] = useState('1234');

    const signIn = () => {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage)
            });
    }

    return (
        <Box>
            <Box width='70%'>
                <div style={{textAlign: 'center'}}>로그인</div>
                <TextField id="outlined-basic" type="text" label="이메일" variant="outlined" onChange={(e) => {setEmail(e.target.value)}}  fullWidth />
                <TextField id="outlined-basic" type="password" label="비밀번호" variant="outlined" onChange={(e) => {setPassword(e.target.value)}} fullWidth />
                <Button variant="contained" onClick={signIn} fullWidth >회원가입</Button>
            </Box>
        </Box>
    )
}

export default Login;