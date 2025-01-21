import './ShopList.css';

const ShopList = ({ shops, isLoading, onShopSelect, onShopHover, onShopLeave }) => {
    if (isLoading) {
        return (
            <div className="shop-list">
                <div className="loading">매장 정보를 불러오는 중...</div>
            </div>
        );
    }

    if (!shops.length) {
        return (
            <div className="shop-list">
                <div className="no-shops">현재 지도 영역에 표시할 매장이 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="shop-list">
            {shops.map(shop => (
                <div 
                    key={shop.id} 
                    className="shop-item"
                    onMouseEnter={() => onShopHover(shop.id)}
                    onMouseLeave={() => onShopLeave(shop.id)}
                >
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4">
                            <div className="shop-img"></div>
                            <div className="shop-info">
                                <h5 className="shop-name">{shop.name}</h5>
                                <p className="shop-desc">{shop.address}</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                            <button className="like">
                                <i className="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShopList; 