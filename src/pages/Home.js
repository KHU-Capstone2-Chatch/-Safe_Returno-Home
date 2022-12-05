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
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField
} from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SearchIcon from '@mui/icons-material/Search';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import axios from "axios";
import { getMessaging } from "firebase/messaging";
import {useNavigate, useLocation} from "react-router-dom";
import User from "./User";
import {doc, setDoc, updateDoc} from "firebase/firestore";

axios.defaults.withCredentials = false;

let myMap;
let watchId;
let intervalId;

function Home({db, openAlert}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [startAt, setStartAt] = useState('');
    const [startMarker, setStartMarker] = useState(null);
    const [endAt, setEndAt] = useState('');
    const [endMarker, setEndMarker] = useState(null);

    const [searchMarkerList, setSearchMarkerList] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);

    const [searchType, setSearchType] = useState('start');
    const [searchKeyword, setSearchKeyword] = useState('');

    const [routeList, setRouteList] = useState([]);
    const [routeLine, setRouteLine] = useState();

    const [isRouting, setIsRouting] = useState(false);
    const [currentMarker, setCurrentMarker] = useState(null);

    const [showAlertModal, setShowAlertModal] = useState(false)
    const [count, setCount] = useState(10);

    const [currentLocation, setCurrentLocation] = useState(null);

    const [me, setMe] = useState(null);

    const [loading, setLoading] = useState(true)

    const initmap = () => {
        myMap = new window.Tmapv2.Map("map_div", {
            center: new window.Tmapv2.LatLng(37.52084364186228,127.058908811749),
            width: "100%",
            height: "100vh",
            zoom: 15,
            zoomControl : true,
        });

        let myMarker = addMarker(37.52084364186228,127.058908811749, 'current', 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_m.png')
        setCurrentMarker({lat: 37.52084364186228, lng: 127.058908811749, marker: myMarker})
    }

    const initUser = async () => {
        await setDoc(doc(db, "Routes", 'test'), {
            isDanger: false,
            isRouting: false,
            currentLocation: null
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

    const searchPosition = async () => {
        if (searchKeyword === '') {
            return;
        }
        deleteSearchMarkers();

        let params = {
            "appKey" : process.env.REACT_APP_TMAP_APP_KEY,
            "searchKeyword" : searchKeyword,
            "resCoordType" : "EPSG3857",
            "reqCoordType" : "WGS84GEO",
            "count" : 10
        };

        let query = Object.keys(params)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
            .join('&');

        let url = process.env.REACT_APP_TMAP_API_ROUTE + '/tmap/pois?version=1&format=json&callback=result&' + query;

        try {
            let response = await axios.get(url, {
                withCredentials: false,
            });
            console.log(response)
            let resultPositionData = response.data.searchPoiInfo.pois.poi;
            let positionBounds = new window.Tmapv2.LatLngBounds();		//맵에 결과물 확인 하기 위한 LatLngBounds객체 생성

            let searchMarkerList = []
            for (const k in resultPositionData) {
                let noorLat = Number(resultPositionData[k].noorLat);
                let noorLon = Number(resultPositionData[k].noorLon);
                let name = resultPositionData[k].name;

                let pointCng = new window.Tmapv2.Point(noorLon, noorLat);
                let projectionCng = new window.Tmapv2.Projection.convertEPSG3857ToWGS84GEO(pointCng);

                let lat = projectionCng._lat;
                let lng = projectionCng._lng;

                let markerPosition = new window.Tmapv2.LatLng(lat, lng);

                let marker = new window.Tmapv2.Marker({
                    position:markerPosition,
                    icon: 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_' + k +'.png',
                    iconSize : new window.Tmapv2.Size(24, 38),
                    title: name,
                    map: myMap
                });

                positionBounds.extend(markerPosition);
                searchMarkerList.push({
                    lat,
                    lng,
                    name,
                    marker
                })
            }
            setSearchMarkerList([...searchMarkerList]);
            myMap.panToBounds(positionBounds);	// 확장된 bounds의 중심으로 이동시키기
            myMap.zoomOut();
        } catch (e) {
            console.error(e)
        }
    }

    const selectPosition = (marker) => {
        if (searchType === 'start') {
            if (startMarker !== null) {
                startMarker.marker.setMap(null)
            }
            setStartAt(marker.name);
            let sMarker = addMarker(marker.lat, marker.lng, marker.name, 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png')
            setStartMarker({...marker, marker: sMarker});
        }
        if (searchType === 'end') {
            if (endMarker) {
                endMarker.marker.setMap(null)
            }
            setEndAt(marker.name);
            let eMarker = addMarker(marker.lat, marker.lng, marker.name, 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png')
            setEndMarker({...marker, marker: eMarker});
        }
        if (routeLine) {
            deleteLine();
        }
        setSearchKeyword('');
        focusOnMarker([marker])
        deleteSearchMarkers();
        closeSearchModal();
    }

    const closeSearchModal = () => {
        setShowSearchModal(false);
    }

    const stopSearchPosition = () => {
        setSearchKeyword('');
        setShowSearchModal(false);
        deleteSearchMarkers();
    }

    const deleteSearchMarkers = () => {
        searchMarkerList.forEach((searchMarker) => {
            searchMarker.marker.setMap(null);
        })
        setSearchMarkerList([]);
    }

    const setMarker = (lat, lng) => {
        currentMarker.marker.setPosition(new window.Tmapv2.LatLng(lat, lng))
        setCurrentMarker({...currentMarker, lat: 37.52084364186228, lng: 127.058908811749})
    }

    const getCurrentPosition = () => {
        if (window.navigator.geolocation) {
            watchId = window.navigator.geolocation.watchPosition((position) => {
                console.log(currentMarker)
                let lat = position.coords.latitude
                let lng = position.coords.longitude
                setCurrentLocation({lat, lng})
                myMap.setCenter(new window.Tmapv2.LatLng(lat, lng))
                setMarker(lat, lng)
                saveCurrentPosition({lat, lng});
            }, (error) => {
                console.error(error);
            }, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: Infinity,
            });
        } else {
            alert('GPS를 지원하지 않습니다');
        }
    }

    const saveCurrentPosition = async (location) => {
        await updateDoc(doc(db, "Routes", 'test'), {
            currentLocation: location
        });
    }

    const goCurrentPosition = () => {
        if (currentLocation) {
            myMap.setCenter(new window.Tmapv2.LatLng(currentLocation.lat, currentLocation.lng))
        }
    }

    const calcRoute = async () => {
        if (!startMarker || !endMarker) {
            return;
        }
        if (routeLine) {
            return;
        }
        try {
            let url = process.env.REACT_APP_TMAP_API_ROUTE + '/tmap/routes/pedestrian?version=1&format=json&callback=result&appKey=' + process.env.REACT_APP_TMAP_APP_KEY
            let response = await axios.post(url, {
                // appKey : "",
                "startX" : startMarker.lng.toString(),
                "startY" : startMarker.lat.toString(),
                "endX" : endMarker.lng.toString(),
                "endY" : endMarker.lat.toString(),
                "reqCoordType" : "WGS84GEO",
                "resCoordType" : "EPSG3857",
                "startName" : "출발지",
                "endName" : "도착지"
            },{
                withCredentials: false,
            });

            let drawInfoArr = [];
            let resultData = response.data.features;
            for (let i in resultData) {
                let geometry = resultData[i].geometry;

                if (geometry.type === "LineString") {
                    for (let j in geometry.coordinates) {
                        // 경로들의 결과값(구간)들을 포인트 객체로 변환
                        let latlng = new window.Tmapv2.Point(
                            geometry.coordinates[j][0],
                            geometry.coordinates[j][1]);
                        // 포인트 객체를 받아 좌표값으로 변환
                        let convertPoint = new window.Tmapv2.Projection.convertEPSG3857ToWGS84GEO(latlng);
                        // 포인트객체의 정보로 좌표값 변환 객체로 저장
                        let convertChange = new window.Tmapv2.LatLng(convertPoint._lat, convertPoint._lng);
                        // 배열에 담기
                        drawInfoArr.push(convertChange);
                    }
                }
            }
            setRouteList(drawInfoArr)
            focusOnMarker([startMarker, endMarker]);
            drawLine(drawInfoArr);
        } catch (e) {
            console.error(e)
        }
    }

    const focusOnMarker = (markers) => {
        let positionBounds = new window.Tmapv2.LatLngBounds();		//맵에 결과물 확인 하기 위한 LatLngBounds객체 생성

        markers.forEach((marker) => {
            positionBounds.extend(new window.Tmapv2.LatLng(marker.lat, marker.lng));
        })

        myMap.panToBounds(positionBounds);	// 확장된 bounds의 중심으로 이동시키기
        myMap.zoomOut();
    }

    const drawLine = (arrPoint) => {
        let polyline_;

        polyline_ = new window.Tmapv2.Polyline({
            path : arrPoint,
            strokeColor : "#DD0000",
            strokeWeight : 6,
            map : myMap
        });
        setRouteLine(polyline_);
    }

    const deleteLine = () => {
        if (routeLine) {
            routeLine.setMap(null);
            setRouteLine(null);
            setRouteList([]);
        }
    }

    const startRouting = async () => {
        setIsRouting(true);
        myMap.setCenter(new window.Tmapv2.LatLng(currentLocation.lat, currentLocation.lng))
        intervalId = setInterval(() => {
            if (checkOffPath()) {
                openAlertModal()
            }
        }, 1000)
        await updateDoc(doc(db, "Routes", 'test'), {
            isRouting: true
        });
    }

    const stopRouting = async () => {
        clearInterval(intervalId)
        setIsRouting(false);
    }

    const initState = () => {
        setSearchKeyword('');
        setStartAt('');
        if (startMarker) {
            startMarker.marker.setMap(null)
            setStartMarker(null);
        }
        setEndAt('');
        if (endMarker) {
            endMarker.marker.setMap(null)
            setEndMarker(null)
        }
        setRouteList([]);
        if (routeLine) {
            routeLine.setMap(null)
            setRouteLine(null);
        }
    }

    const checkOffPath = () => {
        let minDistance = 50;
        for (const route of routeList) {
            let lat = route._lat;
            let lng = route._lng;
            // addMarker(lat, lng, 'current', 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_m.png')
            let distance = computeDistance(currentMarker.lat, currentMarker.lng, lat, lng);
            // console.log(distance + 'm')
            if (minDistance > distance) {
                minDistance = distance
            }
            console.log(lat, lng, distance)
            // console.log(distance)
        }
        return minDistance >= 50;
    }

    function getDistance(lat1, lon1, lat2, lon2) {
        if ((lat1 === lat2) && (lon1 === lon2))
            return 0;

        var radLat1 = Math.PI * lat1 / 180;
        var radLat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radTheta = Math.PI * theta / 180;
        var dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
        if (dist > 1)
            dist = 1;

        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515 * 1.609344 * 1000;
        if (dist < 100) dist = Math.round(dist / 10) * 10;
        else dist = Math.round(dist / 100) * 100;

        return (1 / dist) * 1000;
    }

    function computeDistance(lat1, lng1, lat2, lng2) {
        let startLatRads = degreesToRadians(lat1);
        let startLongRads = degreesToRadians(lng1);
        let destLatRads = degreesToRadians(lat2);
        let destLongRads = degreesToRadians(lng2);

        let Radius = 6371; //지구의 반경(km)
        let distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) +
            Math.cos(startLatRads) * Math.cos(destLatRads) *
            Math.cos(startLongRads - destLongRads)) * Radius;

        return (1 / distance) * 1000;
    }

    function degreesToRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    const openAlertModal = () => {
        setShowAlertModal(true);
        let time = 10
        let refreshIntervalId  = setInterval(() => {
            time -= 1
            setCount(time)
            if (time <= 0) {
                clearInterval(refreshIntervalId);
                closeAlertModal();
                sendChatAlert();
                showNotification();
                stopRouting();
            }
        }, 1000)
    }

    const closeAlertModal = () => {
        setCount(10);
        setShowAlertModal(false);
    }

    const sendChatAlert = async () => {
        await updateDoc(doc(db, "Routes", 'test'), {
            isDanger: true
        });
    }

    const showNotification = () => {
        openAlert('🚨 사용자에게 위험이 감지 되었습니다!', 'error');
    };

    const goUser = () => {
        setShowUserModal(true);
    }

    useEffect(() => {
        setMe(location.state?.user)
        if (!myMap) {
            initmap();
            initUser();
        }

        return () => {
            window.navigator.geolocation.clearWatch(watchId);
            initUser();
            if (currentMarker) {
                currentMarker.marker.setMap(null)
            }
        }
    }, [])

    useEffect(() => {
        if (currentMarker !== null) {
            getCurrentPosition();
            setLoading(false)
        }
    }, [currentMarker])

    // useEffect(() => {
    //     if (currentLocation !== null && !loading) {
    //     }
    // }, [currentLocation])

    return (
        <div>
            {
                me?.type === 'safeUser' ?
                    <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', height: 50, backgroundColor: '#AAC1F1'}}>
                        <IconButton onClick={goUser} style={{width: 50}}>
                            <PersonIcon color='#4270CC' fontSize="inherit" />
                        </IconButton>
                    </div>
                    :
                    <div style={{position: 'fixed', zIndex: 1, backgroundColor: '#AAC1F1'}}>
                        <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', height: 50}}>
                            <IconButton onClick={goUser} style={{width: 50}}>
                                <PersonIcon color='#4270CC' fontSize="inherit" />
                            </IconButton>
                        </div>
                        <Divider/>
                        <div style={{display: isRouting ? 'none' : 'flex', flexDirection: 'row', justifyContent: 'center', padding: 10, paddingLeft: 20}}>
                            <div>
                                <TextField id="outlined-basic" type="text" placeholder="출발지" variant="outlined" size='small' fullWidth value={startAt} style={{marginBottom: 5}} onClick={() => {setShowSearchModal(true); setSearchType('start');}} />
                                <TextField id="outlined-basic" type="text" placeholder="도착지" variant="outlined" size='small' fullWidth value={endAt} style={{marginTop: 5}} onClick={() => {setShowSearchModal(true); setSearchType('end');}} />
                            </div>
                            <IconButton onClick={calcRoute} color='primary' style={{margin: 10}} disabled={routeLine === null}>
                                <AltRouteIcon color='#4270CC' fontSize="inherit"/>
                            </IconButton>
                            {
                                startMarker || endMarker || routeLine ?
                                    <Fab variant="extended" color='secondary' size='small' sx={{position: 'absolute', top: 180, left: 20}} onClick={initState}>
                                        <span style={{margin: 3}}>초기화</span>
                                    </Fab> : null
                            }
                        </div>
                    </div>
            }

            <Fab size='medium' sx={{position: 'absolute', bottom: 20, left: 20}} onClick={goCurrentPosition}>
                <MyLocationIcon />
            </Fab>
            <span style={{display: routeLine ? 'flex' : 'none'}}>
                {
                    isRouting ?
                        <Fab variant="extended" color='primary' size='medium' sx={{position: 'absolute', bottom: 20, right: 20}} onClick={stopRouting}>
                            <LocationOffIcon sx={{ mr: 1 }}/>
                            안전귀가 종료
                        </Fab>
                        :
                        <Fab variant="extended" color='primary' size='medium' sx={{position: 'absolute', bottom: 20, right: 20}} onClick={startRouting}>
                            <LocationOnIcon sx={{ mr: 1 }}/>
                            안전귀가 시작
                        </Fab>
                }
            </span>

            <Dialog
                fullScreen
                open={showSearchModal}
                onClose={closeSearchModal}
            >
                <AppBar style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: '#AAC1F1'}}>
                    <IconButton size="small" onClick={stopSearchPosition}>
                        <ArrowBackIosNewIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton onClick={closeSearchModal} style={{marginLeft: 10}}>
                        <MapIcon fontSize="inherit" />
                    </IconButton>
                    <TextField id="outlined-basic" type="text" placeholder="검색어" variant="outlined" size='small' fullWidth style={{marginRight: 10, marginLeft: 10}} value={searchKeyword} onChange={(e) => {setSearchKeyword(e.target.value)}} />
                    <IconButton onClick={searchPosition}>
                        <SearchIcon fontSize="inherit" />
                    </IconButton>
                </AppBar >
                <Box style={{paddingTop: 60}}>
                    <List style={{backgroundColor: 'white'}}>
                        {
                            searchMarkerList.map((marker, index) => {
                                return (
                                    <ListItem key={index} disablePadding>
                                        <ListItemButton onClick={() => {selectPosition(marker)}}>
                                            <ListItemIcon>
                                                <img src={'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_'+ index +'.png'} alt=""/>
                                            </ListItemIcon>
                                            <ListItemText primary={marker.name} />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                </Box>
            </Dialog>

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
                        설정 경로에서 벗어났습니다.<br/>
                        10초 후 보호자에게 자동으로<br/>
                        위치가 공유됩니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color='error' onClick={() => {setShowAlertModal(false)}}>{`취소 (${count}초)`}</Button>
                </DialogActions>
            </Dialog>

            <div
                id='map_div'
            />
        </div>
    )
}

export default Home;
