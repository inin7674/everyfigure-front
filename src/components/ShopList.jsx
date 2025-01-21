import { useState, useEffect } from 'react';
import './ShopList.css';

const ShopList = () => {
    const [shops, setShops] = useState([]);

    useEffect(() => {
        // API 호출 또는 데이터 가져오기
        const fetchShops = async () => {
            try {
                // API 호출 코드
                const response = await fetch('http://localhost:8080/findall');
                const data = await response.json();
                setShops(data);
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };

        fetchShops();
    }, []);

    return (
        <div className="shop-list">
            {shops.map(shop => (
                <div key={shop.id} className="shop-item">
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