let map;
let markers = [];
let geocoder;

function initMap() {
    if (!naver || !naver.maps) {
        console.error('네이버 지도 API가 완전히 로드되지 않았습니다.');
        return;
    }

    const mapOptions = {
        center: new naver.maps.LatLng(37.5665, 126.9780), // 서울 중심
        zoom: 11,
    };
    console.log('지도 초기화 완료');
    const mapDiv = document.getElementById('map');
    map = new naver.maps.Map(mapDiv, mapOptions);
    fetchFigureShops();
    naver.maps.Event.addListener(map, 'idle', updateShopList);
}


async function fetchFigureShops() {
    try {
      const response = await fetch('http://localhost:8080/findall');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const shops = await response.json();
      const shopsWithCoords = await Promise.all(shops.map(geocodeShop)); // 좌표 변환
      createMarkers(shopsWithCoords);
    } catch (error) {
      console.error('피규어 샵 데이터 가져오기 실패:', error);
    }
  }
  
  function geocodeShop(shop) {
    return new Promise((resolve, reject) => {
        naver.maps.Service.geocode({
            query: shop.address
        }, function(status, response) {
            if (status === naver.maps.Service.Status.ERROR) {
                console.error(`주소 변환 실패: ${shop.address}`);
                return resolve(shop); // 좌표를 찾지 못한 경우 원래 데이터 반환
            }

            if (response.v2.meta.totalCount > 0) {
                const item = response.v2.addresses[0];
                resolve({
                    ...shop,
                    latitude: parseFloat(item.y),
                    longitude: parseFloat(item.x),
                });
            } else {
                console.warn(`주소를 찾을 수 없음: ${shop.address}`);
                resolve(shop); // 좌표를 찾지 못한 경우 원래 데이터 반환
            }
        });
    });
}
  
  function createMarkers(shops) {
    shops.forEach(shop => {
      if (shop.latitude && shop.longitude) {
        const position = new naver.maps.LatLng(shop.latitude, shop.longitude);
        const marker = new naver.maps.Marker({
          position: position,
          map: map,
        });
        markers.push(marker);
      }
    });
  }

  naver.maps.onJSContentLoaded = initMap;
