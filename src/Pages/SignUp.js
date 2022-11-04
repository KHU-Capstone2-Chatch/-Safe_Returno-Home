import React, {useState} from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {Box, Button, TextField} from "@mui/material";

function SignUp() {
    const [email, setEmail] = useState('r@gmail.com');
    const [password, setPassword] = useState('123456');
    const [phone, setPhone] = useState('1234');

    const signUp = () => {
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user)
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage)
                // ..
            });
    }

    return (
        <Box width='100%' display='flex' alignItems='center' >
            <Box style={{width: '70%'}}>
                <div style={{textAlign: 'center'}}>회원가입</div>
                <TextField id="outlined-basic" type="text" label="이메일" variant="outlined" onChange={(e) => {setEmail(e.target.value)}}  fullWidth />
                <TextField id="outlined-basic" type="password" label="비밀번호" variant="outlined" onChange={(e) => {setPassword(e.target.value)}} fullWidth />
                <TextField id="outlined-basic" type="number" label="보호자 전화번호" variant="outlined" onChange={(e) => {setPassword(e.target.value)}} fullWidth />
                <Button variant="contained" onClick={signUp} fullWidth >회원가입</Button>
            </Box>
        </Box>
    )
}

export default SignUp;