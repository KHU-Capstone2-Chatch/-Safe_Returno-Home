import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button, TextField} from "@mui/material";

function Home() {
    const mapRef = useRef(null);
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');
    let map, infoWindow;
    let directionsService, directionsRenderer;

    const initMap = useCallback(() => {
        map = new window.google.maps.Map(mapRef.current, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
        });

        infoWindow = new window.google.maps.InfoWindow();
        directionsService = new window.google.maps.DirectionsService();
        directionsRenderer = new window.google.maps.DirectionsRenderer({
            MarkerOptions: {clickable: false}
        });
        directionsRenderer.setMap(map);

        createCurrentLocationButton();
        showCurrentLocation();

        window.google.maps.event.addListener(map, 'click', function(event) {
            setEndAt(event.latLng)
            placeMarker(event.latLng);
        });
    }, [mapRef]);

    function placeMarker(location) {
        let marker = new window.google.maps.Marker({
            position: location,
            map: map
        });

        map.setCenter(location);
    }

    const showCurrentLocation = () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    infoWindow.setPosition(pos);
                    infoWindow.setContent("현재 위치");
                    infoWindow.open(map);
                    map.setCenter(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    }
    const createCurrentLocationButton = () => {
        const locationButton = document.createElement("button");

        locationButton.textContent = "내위치";
        locationButton.classList.add("custom-map-control-button");
        map.controls[window.google.maps.ControlPosition.LEFT_BOTTOM].push(locationButton);
        locationButton.addEventListener("click", showCurrentLocation);
    }

    const handleLocationError = (browserHasGeolocation, infoWindow, pos) => {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
            browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
        );
        infoWindow.open(map);
    }

    const calcRoute = () => {
        const request = {
            origin: startAt + ', kr',
            destination: endAt + ', kr',
            travelMode: 'TRANSIT',
        };
        console.log(startAt, endAt)
        directionsService.route(request, (result, status) => {
            console.log(result)
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
            }
        });
    }

    useEffect(() => {
        initMap();
    }, [initMap]);

    return (
        <div>
            <div>
                <TextField id="outlined-basic" type="text" label="출발지" variant="outlined" onChange={(e) => setStartAt(e.target.value)} />
                <TextField id="outlined-basic" type="text" label="도착지" variant="outlined" onChange={(e) => setEndAt(e.target.value)} />
                <Button variant="contained" onClick={calcRoute} >검색</Button>
            </div>
            <div
                className="map"
                style={{ width: "100%", height: "700px" }}
                ref={mapRef}
            />
        </div>
    );
}

export default Home;