document.addEventListener('DOMContentLoaded', async function() {
    const shopListContainer = document.querySelector('.shop-list');
  
    async function fetchShopList() {
      try {
        const response = await fetch('http://localhost:8080/findall');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching shop list:', error);
        return [];
      }
    }
  
    function renderShopList(shops) {
        const shopListContainer = document.querySelector('.shop-list');
        shopListContainer.innerHTML = '';
      
        shops.forEach(shop => {
          const shopItem = `
            <div class="shop-item rounded-4 p-3 mb-3 border">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-4">
                  <div class="shop-img""></div>
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
  
      function getLocation(address) {
        if (!address) return ''; // address가 undefined나 null일 경우 빈 문자열 반환
        const parts = address.split(' ');
        return parts[1] || ''; // 두 번째 부분을 지역명으로 가정
      }
  
    try {
      const shops = await fetchShopList();
      renderShopList(shops);
    } catch (error) {
      console.error('불러오기 실패:', error);
    }
  });
  