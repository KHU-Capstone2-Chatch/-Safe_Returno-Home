import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button, TextField} from "@mui/material";

function Home() {
    let map;
    let routeLayer;
    let markerStartLayer, markerEndLayer;

    const initmap = () => {
        map = new window.Tmap.Map({
            div : 'map_div',
            width : "100%",
            height : "400px",
        });
        let tData = new window.Tmap.TData();//REST API 에서 제공되는 경로, 교통정보, POI 데이터를 쉽게 처리할 수 있는 클래스입니다.
        map.setCenter(new window.Tmap.LonLat("127.058908811749", "37.52084364186228").transform("EPSG:4326", "EPSG:3857"), 12);
        routeLayer = new window.Tmap.Layer.Vector("route");
        map.addLayer(routeLayer);

        markerStartLayer = new window.Tmap.Layer.Markers("start");
        markerEndLayer = new window.Tmap.Layer.Markers("end");

        tData.events.register("onComplete", tData, onComplete);//데이터 로드가 성공적으로 완료되었을 때 발생하는 이벤트를 등록합니다.
        tData.events.register("onProgress", tData, onProgress);//데이터 로드중에 발생하는 이벤트를 등록합니다.
        tData.events.register("onError", tData, onError);//데이터 로드가 실패했을 떄 발생하는 이벤트를 등록합니다.
    }

    const onComplete = () => {
        console.log(this.responseXML); //xml로 데이터를 받은 정보들을 콘솔창에서 확인할 수 있습니다.
    }

    const onProgress = () => {
        //alert("onComplete");
    }

    const onError = () => {
        alert("onError");
    }

    useEffect(() => {
        initmap();
    }, [initmap])

    return (
        <div>
            home
        </div>
    )
}

export default Home;