import React, {useEffect, useState} from "react";
import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
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

axios.defaults. withCredentials = true;

let myMap;
let watchId;

function Home() {
    const [startAt, setStartAt] = useState('');
    const [startMarker, setStartMarker] = useState(null);
    const [endAt, setEndAt] = useState('');
    const [endMarker, setEndMarker] = useState(null);
    const [searchMarkerList, setSearchMarkerList] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchType, setSearchType] = useState('start');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [routeList, setRouteList] = useState([]);
    const [routeLine, setRouteLine] = useState();
    const [isRouting, setIsRouting] = useState(false);
    const [currentMarker, setCurrentMarker] = useState(null);

    const [showAlertModal, setShowAlertModal] = useState(false)
    const [count, setCount] = useState(10);

    const initmap = () => {
        myMap = new window.Tmapv2.Map("map_div", {
            center: new window.Tmapv2.LatLng(37.52084364186228,127.058908811749),
            width: "100%",
            height: "100vh",
            zoom: 15,
            zoomControl : true,
        });
        setTimeout(() => {
            getCurrentPosition();
        }, 0)
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
            "appKey" : "l7xx30fc88d17c88405290230f63192bccdc",
            "searchKeyword" : searchKeyword,
            "resCoordType" : "EPSG3857",
            "reqCoordType" : "WGS84GEO",
            "count" : 10
        };

        let query = Object.keys(params)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
            .join('&');

        let url = '/tmap/pois?version=1&format=json&callback=result&' + query;

        try {
            let response = await axios.get(url, {
                withCredentials: true,
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

    const getCurrentPosition = () => {
        if (isRouting) {
            myMap.setCenter(new window.Tmapv2.LatLng(currentMarker.lat, currentMarker.lng))
            return;
        }
        if (window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition((position) => {
                let lat = position.coords.latitude
                let lng = position.coords.longitude
                if (!currentMarker) {
                    let myMarker = addMarker(lat, lng, 'current', 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_m.png')
                    setCurrentMarker({lat, lng, marker: myMarker})
                } else {
                    currentMarker.marker.setPosition(new window.Tmapv2.LatLng(lat, lng))
                }
                myMap.setCenter(new window.Tmapv2.LatLng(lat, lng))
            }, (error) => {
                console.error(error);
            }, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: Infinity
            });
        } else {
            alert('GPS를 지원하지 않습니다');
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
            let url = '/tmap/routes/pedestrian?version=1&format=json&callback=result&appKey=l7xx30fc88d17c88405290230f63192bccdc'
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
                withCredentials: true,
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

    const startRouting = () => {
        setIsRouting(true);
        if (window.navigator.geolocation) {
            watchId = window.navigator.geolocation.watchPosition((position) => {
                let lat = position.coords.latitude
                let lng = position.coords.longitude
                console.log(position.coords.latitude, position.coords.longitude)
                if (!currentMarker) {
                    let myMarker = addMarker(lat, lng, 'current', 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_0.png')
                    setCurrentMarker({lat, lng, marker: myMarker})
                } else {
                    currentMarker.marker.setPosition(new window.Tmapv2.LatLng(lat, lng))
                }
                myMap.setCenter(new window.Tmapv2.LatLng(lat, lng))
                focusOnMarker([{lat, lng}])
            }, (error) => {
                console.error(error);
            }, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: Infinity
            });
        } else {
            alert('GPS를 지원하지 않습니다');
        }
    }

    const stopRouting = () => {
        setIsRouting(false);
        setCurrentMarker(null)
        window.navigator.geolocation.clearWatch(watchId);
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
        let minDistance = 500;
        for (const route of routeList) {
            let lat = route._lat;
            let lng = route._lng;

            let distance = computeDistance(currentMarker, {lat, lng});
            // console.log(distance + 'm')
            if (minDistance > distance) {
                minDistance = distance
            }
        }
        console.log(minDistance)
        return minDistance >= 500;
    }

    function computeDistance(startCoords, destCoords) {
        let startLatRads = degreesToRadians(startCoords.lat);
        let startLongRads = degreesToRadians(startCoords.lng);
        let destLatRads = degreesToRadians(destCoords.lat);
        let destLongRads = degreesToRadians(destCoords.lng);

        let Radius = 6371; //지구의 반경(km)
        let distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) +
            Math.cos(startLatRads) * Math.cos(destLatRads) *
            Math.cos(startLongRads - destLongRads)) * Radius;

        return distance * 1000;
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
                clearInterval(refreshIntervalId)
                closeAlertModal()
            }
        }, 1000)
    }

    const closeAlertModal = () => {
        setCount(10);
        setShowAlertModal(false);
    }

    const sendChatAlert = async () => {
        try {
            let url = '/v2/api/talk/memo/send'
            const res = await axios.post(url, {
                'template_id' : '85793',
                'template_args' : {
                    'userName': '김서영',
                    'UserCurrentPosition': '경희대학교 국제캠퍼스'
                }
            }, {
                headers: {
                    "Authorization": "Bearer " + '093f5a5a8f8ae8a043ff32f4e25a4d6b'
                },
                withCredentials: true
            })
            console.log(res)
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        if (!myMap) {
            initmap();
        }
    }, [])

    return (
        <div>
            <div style={{position: 'fixed', zIndex: 1}}>
                <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', height: 50, backgroundColor: '#AAC1F1'}}>
                    <IconButton onClick={sendChatAlert} style={{width: 50}}>
                        <PersonIcon color='#4270CC' fontSize="inherit" />
                    </IconButton>
                </div>
                <div style={{display: isRouting ? 'none' : 'flex', flexDirection: 'row', justifyContent: 'center', padding: 10, paddingLeft: 20, backgroundColor: '#fff'}}>
                    <div>
                        <TextField id="outlined-basic" type="text" placeholder="출발지" variant="outlined" size='small' fullWidth value={startAt} style={{backgroundColor: 'white', marginBottom: 5}} onClick={() => {setShowSearchModal(true); setSearchType('start');}} />
                        <TextField id="outlined-basic" type="text" placeholder="도착지" variant="outlined" size='small' fullWidth value={endAt} style={{backgroundColor: 'white', marginTop: 5}} onClick={() => {setShowSearchModal(true); setSearchType('end');}} />
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

            <Fab size='medium' sx={{position: 'absolute', bottom: 20, left: 20}} onClick={getCurrentPosition}>
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
            <div>
            </div>
        </div>
    )
}

export default Home;

// NCS9LF06DUJYWFHQ
//
// LDEWK2QENQE6RAJVRAFM0JIOTUJMTUDE