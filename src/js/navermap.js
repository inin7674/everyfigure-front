(function() {
    let map;
    let markers = [];
    let shopListContainer = null;
    let isEventBound = false;

    function initMap() {
        const mapOptions = {
            center: new naver.maps.LatLng(37.5665, 126.9780),
            zoom: 11,
        };
        
        map = new naver.maps.Map('map', mapOptions);
        
        if (!isEventBound) {
            naver.maps.Event.addListener(map, 'idle', debounce(updateShopList, 300));
            isEventBound = true;
        }
        
        fetchFigureShops();
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function fetchFigureShops() {
        fetch('http://localhost:8080/findall')
            .then(response => response.json())
            .then(shops => {
                const promises = shops.map(shop => geocodeAddress(shop));
                return Promise.all(promises);
            })
            .then(shopsWithCoords => {
                createMarkers(shopsWithCoords);
            })
            .catch(error => {
                console.error('피규어 샵 데이터 가져오기 실패:', error);
            });
    }

    function geocodeAddress(shop) {
        return new Promise((resolve, reject) => {
            naver.maps.Service.geocode({
                query: shop.address
            }, function(status, response) {
                if (status === naver.maps.Service.Status.ERROR) {
                    console.error('주소 변환 실패:', shop.address);
                    resolve(shop);
                    return;
                }

                if (response.v2.meta.totalCount > 0) {
                    const item = response.v2.addresses[0];
                    resolve({
                        ...shop,
                        latitude: parseFloat(item.y),
                        longitude: parseFloat(item.x)
                    });
                } else {
                    console.warn('주소를 찾을 수 없음:', shop.address);
                    resolve(shop);
                }
            });
        });
    }

    function createMarkers(shops) {
        markers.forEach(marker => marker.setMap(null));
        markers = [];

        shops.forEach(shop => {
            if (shop.latitude && shop.longitude) {
                const marker = new naver.maps.Marker({
                    position: new naver.maps.LatLng(shop.latitude, shop.longitude),
                    map: map
                });
                
                marker.shop = shop;
                markers.push(marker);
            }
        });

        updateShopList();
    }

    function updateShopList() {
        if (!shopListContainer) {
            shopListContainer = document.querySelector('.shop-list');
        }
        
        if (!shopListContainer) {
            console.warn('shop-list 요소를 찾을 수 없습니다.');
            return;
        }

        const bounds = map.getBounds();
        const visibleMarkers = markers.filter(marker => {
            return bounds.hasLatLng(marker.getPosition());
        });

        shopListContainer.innerHTML = '';
        visibleMarkers.forEach(marker => {
            const shop = marker.shop;
            const shopItem = `
                <div class="shop-item rounded-4 p-3 mb-3 border">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-4">
                            <div class="shop-img"></div>
                            <div class="shop-info">
                                <h5 class="shop-name mb-1">${shop.name || '없음'}</h5>
                                <p class="shop-desc mb-0 text-muted">${shop.address || '주소가 없습니다'}</p>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-4">
                            <button class="like border-0">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            shopListContainer.innerHTML += shopItem;
        });
    }

    // 페이지 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            shopListContainer = document.querySelector('.shop-list');
            if (shopListContainer) {
                initMap();
            }
        }, 1000);
    });
})();

