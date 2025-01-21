import { useEffect, useState } from 'react';
import './NaverMap.css';

const NaverMap = ({ shops, setShops, onVisibleShopsChange, hoveredShopId }) => {
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [infowindows, setInfowindows] = useState([]);

    // 마커 생성 함수
    const createMarker = (position, shopId, mapInstance) => {
        const marker = new naver.maps.Marker({
            position: position,
            map: mapInstance,
            icon: {
                content: `
                    <div class="marker">
                        <div class="marker-icon">
                            <i class="fas fa-robot"></i>
                        </div>
                    </div>
                `,
                size: new naver.maps.Size(40, 40),
                anchor: new naver.maps.Point(20, 40)
            }
        });
        marker.shopId = shopId;
        return marker;
    };

    // 마커 hover 효과
    useEffect(() => {
        markers.forEach(marker => {
            if (marker.shopId === hoveredShopId) {
                marker.setIcon({
                    content: `
                        <div class="marker hover">
                            <div class="marker-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                        </div>
                    `,
                    size: new naver.maps.Size(40, 40),
                    anchor: new naver.maps.Point(20, 50)
                });
            } else {
                marker.setIcon({
                    content: `
                        <div class="marker">
                            <div class="marker-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                        </div>
                    `,
                    size: new naver.maps.Size(40, 40),
                    anchor: new naver.maps.Point(20, 40)
                });
            }
        });
    }, [hoveredShopId, markers]);

    // 지도의 보이는 영역이 변경될 때 호출되는 함수
    const updateVisibleShops = (mapInstance, currentMarkers, allShops) => {
        if (!mapInstance || !currentMarkers.length || !allShops.length) {
            console.log('Missing required data:', { 
                hasMap: !!mapInstance, 
                markersLength: currentMarkers.length, 
                shopsLength: allShops.length 
            });
            return;
        }
        
        const bounds = mapInstance.getBounds();
        console.log('Current bounds:', bounds);

        const visibleShops = allShops.filter(shop => {
            const marker = currentMarkers.find(m => m.shopId === shop.id);
            if (marker) {
                const position = marker.getPosition();
                const isVisible = bounds.hasLatLng(position);
                console.log(`Shop ${shop.name} is ${isVisible ? 'visible' : 'not visible'}`);
                return isVisible;
            }
            return false;
        });
        
        console.log('Visible shops:', visibleShops.length);
        onVisibleShopsChange(visibleShops);
    };

    useEffect(() => {
        const initMap = () => {
            const mapInstance = new naver.maps.Map('map', {
                center: new naver.maps.LatLng(37.5666805, 126.9784147),
                zoom: 14,
                mapTypeId: naver.maps.MapTypeId.NORMAL
            });

            setMap(mapInstance);

            fetch('http://localhost:8080/findall')
                .then(response => response.json())
                .then(data => {
                    setShops(data);
                    const newMarkers = [];
                    const newInfowindows = [];

                    const geocodePromises = data.map(shop => {
                        return new Promise((resolve) => {
                            naver.maps.Service.geocode({
                                query: shop.address
                            }, function(status, response) {
                                if (status === naver.maps.Service.Status.ERROR) {
                                    resolve(null);
                                    return;
                                }

                                if (response.v2.meta.totalCount === 0) {
                                    resolve(null);
                                    return;
                                }

                                const item = response.v2.addresses[0];
                                const point = new naver.maps.Point(item.x, item.y);
                                const marker = createMarker(point, shop.id, mapInstance);

                                const infowindow = new naver.maps.InfoWindow({
                                    content: `
                                        <div class="iw_inner" style="padding: 10px;">
                                            <h3>${shop.name}</h3>
                                            <p>${shop.address}</p>
                                        </div>
                                    `
                                });

                                naver.maps.Event.addListener(marker, "click", function(e) {
                                    if (infowindow.getMap()) {
                                        infowindow.close();
                                    } else {
                                        infowindow.open(mapInstance, marker);
                                    }
                                });

                                resolve({ marker, infowindow });
                            });
                        });
                    });

                    Promise.all(geocodePromises).then(results => {
                        results.forEach(result => {
                            if (result) {
                                newMarkers.push(result.marker);
                                newInfowindows.push(result.infowindow);
                            }
                        });

                        setMarkers(newMarkers);
                        setInfowindows(newInfowindows);
                        
                        // 초기 보이는 매장 업데이트
                        updateVisibleShops(mapInstance, newMarkers, data);

                        // 여기로 이벤트 리스너 이동
                        naver.maps.Event.addListener(mapInstance, 'idle', () => {
                            updateVisibleShops(mapInstance, newMarkers, data);
                        });
                    });
                })
                .catch(error => console.error('Error fetching shops:', error));
        };

        const script = document.createElement('script');
        script.src = "https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=6y0uggrmlp&submodules=geocoder";
        script.async = true;
        script.onload = initMap;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
            markers.forEach(marker => marker.setMap(null));
            infowindows.forEach(infowindow => infowindow.close());
        };
    }, []);

    return (
        <section className="navermap" id="section-3">
            <div id="map"></div>
        </section>
    );
};

export default NaverMap;