import {Fab, IconButton, TextField} from "@mui/material";
import React, {useEffect} from "react";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {useLocation, useNavigate} from "react-router-dom";

function User({user, close}) {
    const navigate = useNavigate();

    const goBack = () => {
        close();
    }

    useEffect(() => {
    }, [])

    return (
        <div>
            <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', height: 50, backgroundColor: '#AAC1F1'}}>
                <IconButton onClick={goBack} style={{width: 50}}>
                    <ArrowBackIosNewIcon color='#4270CC' fontSize="inherit" />
                </IconButton>
            </div>
            <div style={{padding: 20}}>
                <div style={{fontSize: 25, marginBottom: 30}}>
                    사용자 정보
                </div>
                <div>
                    <TextField id="outlined-basic" type="text" label="아이디" value={user ? user.id : '테스트 ID'} variant="outlined" fullWidth style={styles.textBox} disabled/>
                    {
                        user?.type === 'safeUser' ?
                            null
                            :
                            <TextField id="outlined-basic" type="text" label="보호자 ID" value={user ? user.safeUserId : '테스트 보호자 ID'} variant="outlined" fullWidth style={styles.textBox} disabled />
                    }
                </div>
            </div>
        </div>
    )
}

export default User;

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