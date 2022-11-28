import React, {useEffect, useState} from "react";
import {Box, Button, FormControlLabel, Radio, RadioGroup, Snackbar, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import '../styles/main.css';

function SignUp({db, openAlert}) {
    const navigate = useNavigate();

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState('user');
    const [safeUserId, setSafeUserId] = useState('');

    const signUp = () => {
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, id + '@gmail.com', password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user)
                createUserData();
                openAlert('회원가입 성공!', null);
                goToLogin();
            })
            .catch((error) => {
                console.log(error)
            });
    }

    const createUserData = async () => {
        try {
            await setDoc(doc(db, "Users", id), {
                id,
                type,
                safeUserId,
            });
        } catch (error) {
            console.error(error);
        }
    }

    const goToLogin = () => {
        navigate('/login', {
            state: {db, openAlert}
        })
    }

    return (
        <Box className='container'>
            <div style={{textAlign: 'center', fontSize: 25}}>회원가입</div>
            <Box width='100%' height='50%' style={{paddingTop: 60}}>
                <TextField id="outlined-basic" type="text" label="아이디" variant="outlined" onChange={(e) => {setId(e.target.value)}}  fullWidth style={styles.textBox} />
                <TextField id="outlined-basic" type="password" label="비밀번호" variant="outlined" onChange={(e) => {setPassword(e.target.value)}} fullWidth style={styles.textBox} />
                {/*<TextField id="outlined-basic" type="number" label="보호자 전화번호" variant="outlined" onChange={(e) => {setPhone(e.target.value)}} fullWidth style={styles.textBox} />*/}
                <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                >
                    <FormControlLabel value="user" control={<Radio />} label="사용자" checked={type === 'user'} onChange={() => {setType('user')}} />
                    <FormControlLabel value="safeUser" control={<Radio />} label="보호자" checked={type === 'safeUser'} onChange={() => {setType('safeUser')}} />
                </RadioGroup>
                {
                    type === 'user' ?
                    <TextField id="outlined-basic" type="text" label="보호자 ID" variant="outlined" onChange={(e) => {setSafeUserId(e.target.value)}} fullWidth style={styles.textBox} />
                    : null
                }
            </Box>
            <Box width='100%' style={{paddingTop: 10}}>
                <Button variant="contained" onClick={signUp} fullWidth style={styles.primaryButton} >회원가입 완료</Button>
                <Button variant="contained" onClick={goToLogin} fullWidth style={styles.secondButton} >로그인 돌아가기</Button>
            </Box>
        </Box>
    )
}

export default SignUp;

const styles = {
    textBox: {
        marginBottom: 20
    },
    primaryButton: {
        marginBottom: 20, backgroundColor: '#4270CC', color: '#fff'
    },
    secondButton: {
        marginBottom: 20, backgroundColor: '#49C7A1', color: '#000'
    }
}