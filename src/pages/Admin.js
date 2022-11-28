import React, {useEffect, useLayoutEffect, useMemo, useState} from "react";
import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Divider,
    Fab,
    IconButton, Snackbar,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import axios from "axios";
import {useNavigate, useLocation} from "react-router-dom";
import User from "./User";
import { collection, doc, query, where, onSnapshot } from "firebase/firestore";
import CloseIcon from "@mui/icons-material/Close";

axios.defaults.withCredentials = false;

let myMap;
let unsubscribe;

function Admin({db, openAlert}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [showUserModal, setShowUserModal] = useState(false);

    const [isRouting, setIsRouting] = useState(false);
    const [currentMarker, setCurrentMarker] = useState(null);

    const [showAlertModal, setShowAlertModal] = useState(false)

    const [currentLocation, setCurrentLocation] = useState(null);

    const [me, setMe] = useState(null);

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState(false);

    const initmap = () => {
        myMap = new window.Tmapv2.Map("map_div", {
            center: new window.Tmapv2.LatLng(37.52084364186228,127.058908811749),
            width: "100%",
            height: "100vh",
            zoom: 15,
            zoomControl : true,
        });
    }

    const initUser = () => {
        unsubscribe = onSnapshot(doc(db, "Routes", "test"), (snapshot) => {
            const data = snapshot.data();
            console.log(data)
            if (data?.currentLocation) {
                let {lat, lng} = data?.currentLocation
                if (!currentMarker) {
                    let myMarker = addMarker(lat, lng, 'current', 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_m.png')
                    setCurrentMarker({lat, lng, marker: myMarker})
                    myMap.setCenter(new window.Tmapv2.LatLng(lat, lng))
                    setOpen(true);
                    setMessage('사용자가 접속 중입니다.')
                } else {
                    currentMarker.marker.setPosition(new window.Tmapv2.LatLng(lat, lng))
                }
                setCurrentLocation({lat, lng})
            } else {
                setOpen(true);
                setMessage('사용자 미접속 상태입니다.')
            }
            if (data?.isRouting) {
                setMessage('사용자가 안전귀가를 시작했습니다.')
                if (data?.isDanger) {
                    openAlertModal()
                }
            }
        });
    }

    const addMarker = (lat, lng, name, imgUrl) => {
        let marker = new window.Tmapv2.Marker({
            position: new window.Tmapv2.LatLng(lat, lng),
            icon: imgUrl,
            iconSize : new window.Tmapv2.Size(24, 38),
            title: name,
            map: myMap
        })
        return marker
    }

    const goCurrentPosition = () => {
        myMap.setCenter(new window.Tmapv2.LatLng(currentLocation.lat, currentLocation.lng))
    }

    const openAlertModal = () => {
        setShowAlertModal(true);
    }

    const closeAlertModal = () => {
        setShowAlertModal(false);
    }

    const goUser = () => {
        setShowUserModal(true);
    }

    useEffect(() => {
        console.log(location.state)
        setMe(location.state?.user)
        if (!myMap) {
            initmap();
            initUser();
        }

        return () => {
        }
    }, [])

    return (
        <div>
            <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', height: 50, backgroundColor: '#AAC1F1'}}>
                <IconButton onClick={goUser} style={{width: 50}}>
                    <PersonIcon color='#4270CC' fontSize="inherit" />
                </IconButton>
            </div>

            <Fab size='medium' sx={{position: 'absolute', bottom: 20, left: 20}} onClick={goCurrentPosition}>
                <MyLocationIcon />
            </Fab>

            <Dialog
                fullScreen
                open={showUserModal}
            >
                <User user={me} close={() => {setShowUserModal(false)}} />
            </Dialog>

            <Dialog
                open={showAlertModal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" style={{textAlign: 'center'}}>
                    {"경로 이탈 알림"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" style={{textAlign: 'center'}}>
                        사용자에게 <br/>
                        위험이 감지되었습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color='error' onClick={closeAlertModal}>확인</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={open}
                color={'primary'}
                // autoHideDuration={5000}
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

            <div
                id='map_div'
            />
        </div>
    )
}

export default Admin;
