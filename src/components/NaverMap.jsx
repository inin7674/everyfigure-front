import { useEffect, useState } from 'react';
import './NaverMap.css';

const NaverMap = () => {
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [infowindows, setInfowindows] = useState([]);

    useEffect(() => {
        const initMap = () => {
            const mapInstance = new naver.maps.Map('map', {
                center: new naver.maps.LatLng(37.5666805, 126.9784147),
                zoom: 14,
                mapTypeId: naver.maps.MapTypeId.NORMAL
            });

            setMap(mapInstance);

            // 매장 데이터 가져오기
            fetch('http://localhost:8080/findall')
                .then(response => response.json())
                .then(shops => {
                    const newMarkers = [];
                    const newInfowindows = [];

                    shops.forEach(shop => {
                        // 주소를 좌표로 변환
                        naver.maps.Service.geocode({
                            query: shop.address
                        }, function(status, response) {
                            if (status === naver.maps.Service.Status.ERROR) {
                                return alert('Something wrong!');
                            }

                            if (response.v2.meta.totalCount === 0) {
                                return alert('올바른 주소를 입력해주세요.');
                            }

                            const item = response.v2.addresses[0];
                            const point = new naver.maps.Point(item.x, item.y);

                            // 마커 생성
                            const marker = new naver.maps.Marker({
                                position: point,
                                map: mapInstance
                            });

                            // 정보창 생성
                            const infowindow = new naver.maps.InfoWindow({
                                content: `
                                    <div class="iw_inner" style="padding: 10px;">
                                        <h3>${shop.name}</h3>
                                        <p>${shop.address}</p>
                                    </div>
                                `
                            });

                            // 마커 클릭 이벤트
                            naver.maps.Event.addListener(marker, "click", function(e) {
                                if (infowindow.getMap()) {
                                    infowindow.close();
                                } else {
                                    infowindow.open(mapInstance, marker);
                                }
                            });

                            newMarkers.push(marker);
                            newInfowindows.push(infowindow);
                        });
                    });

                    setMarkers(newMarkers);
                    setInfowindows(newInfowindows);
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
            <code id="snippet" className="snippet"></code>
        </section>
    );
};

export default NaverMap; 