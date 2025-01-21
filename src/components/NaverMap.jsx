import { useEffect, useState, useRef } from 'react';
import './NaverMap.css';

const NaverMap = ({ shops, setShops, onVisibleShopsChange, hoveredShopId }) => {
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [infowindows, setInfowindows] = useState([]);
    const mapRef = useRef(null);  // map div에 대한 ref 추가

    // 마커 생성 함수
    const createMarker = (position, shopId, mapInstance) => {
        const marker = new naver.maps.Marker({
            position: position,
            map: mapInstance,
            icon: {
                content: `
                    <div class="marker" id="marker-${shopId}">
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

    // 마커 hover 효과와 정보창 표시
    useEffect(() => {
        markers.forEach(marker => {
            if (marker.shopId === hoveredShopId) {
                // 리스트에서 hover 시 마커 애니메이션과 정보창 표시
                marker.setIcon({
                    content: `
                        <div class="marker hover" id="marker-${marker.shopId}">
                            <div class="marker-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                        </div>
                    `,
                    size: new naver.maps.Size(40, 40),
                    anchor: new naver.maps.Point(20, 40)
                });
                
                const infowindow = infowindows.find(
                    iw => iw.getContent().includes(`id="${marker.shopId}"`)
                );
                if (infowindow) {
                    infowindow.open(map, marker);
                }
            } else {
                // hover가 해제되면 마커 원래 상태로 복구하고 정보창 닫기
                marker.setIcon({
                    content: `
                        <div class="marker" id="marker-${marker.shopId}">
                            <div class="marker-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                        </div>
                    `,
                    size: new naver.maps.Size(40, 40),
                    anchor: new naver.maps.Point(20, 40)
                });
                
                const infowindow = infowindows.find(
                    iw => iw.getContent().includes(`id="${marker.shopId}"`)
                );
                if (infowindow) {
                    infowindow.close();
                }
            }
        });
    }, [hoveredShopId, markers, infowindows, map]);

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
        const loadMap = () => {
            if (!window.naver || !window.naver.maps) return;
            
            // 이전 지도 인스턴스가 있다면 제거
            if (mapRef.current) {
                mapRef.current.innerHTML = '';
            }

            const mapOptions = {
                center: new naver.maps.LatLng(37.557527, 126.925595),
                zoom: 14,
                mapTypeId: naver.maps.MapTypeId.NORMAL,
                scaleControl: false,  // 기본 스케일바 비활성화
                logoControl: true,
                mapDataControl: true,
                zoomControl: true,
                minZoom: 6,
                maxZoom: 21
            };

            const mapInstance = new naver.maps.Map(mapRef.current, mapOptions);

            // 커스텀 스케일바 추가
            const scaleControl = new naver.maps.ScaleControl({
                position: naver.maps.Position.BOTTOM_RIGHT
            });
            scaleControl.setMap(mapInstance);

            setMap(mapInstance);

            // 매장 데이터 로드 및 마커 생성
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
                                        <div class="iw_inner" style="padding: 10px;" id="${shop.id}">
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
                                const { marker, infowindow } = result;
                                
                                // 마커에 직접 hover 이벤트 리스너 추가
                                naver.maps.Event.addListener(marker, 'mouseover', function() {
                                    marker.setIcon({
                                        content: `
                                            <div class="marker hover" id="marker-${marker.shopId}">
                                                <div class="marker-icon">
                                                    <i class="fas fa-robot"></i>
                                                </div>
                                            </div>
                                        `,
                                        size: new naver.maps.Size(40, 40),
                                        anchor: new naver.maps.Point(20, 40)
                                    });
                                    infowindow.open(mapInstance, marker);
                                });

                                naver.maps.Event.addListener(marker, 'mouseout', function() {
                                    if (marker.shopId !== hoveredShopId) {
                                        marker.setIcon({
                                            content: `
                                                <div class="marker" id="marker-${marker.shopId}">
                                                    <div class="marker-icon">
                                                        <i class="fas fa-robot"></i>
                                                    </div>
                                                </div>
                                            `,
                                            size: new naver.maps.Size(40, 40),
                                            anchor: new naver.maps.Point(20, 40)
                                        });
                                        infowindow.close();
                                    }
                                });

                                newMarkers.push(marker);
                                newInfowindows.push(infowindow);
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

        // 스크립트 로드 처리
        if (!window.naver) {
            const script = document.createElement('script');
            script.src = "https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=6y0uggrmlp&submodules=geocoder";
            script.async = true;
            script.onload = loadMap;
            document.head.appendChild(script);
        } else {
            loadMap();
        }

        // cleanup
        return () => {
            if (map) {
                markers.forEach(marker => marker.setMap(null));
                infowindows.forEach(infowindow => infowindow.close());
                setMarkers([]);
                setInfowindows([]);
                setMap(null);
            }
        };
    }, []);

    return (
        <section className="navermap" id="section-3">
            <div ref={mapRef} id="map"></div>
        </section>
    );
};

export default NaverMap;