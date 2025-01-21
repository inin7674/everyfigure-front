import { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [showRegionPopup, setShowRegionPopup] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('전체');
    const [allShops, setAllShops] = useState([]); // 전체 매장 데이터 저장
    const dropdownRef = useRef(null);
    const regionRef = useRef(null);

    const regions = {
        수도권: ['서울', '경기', '인천'],
        강원도: ['강원'],
        충청도: ['대전', '세종', '충북', '충남'],
        전라도: ['광주', '전북', '전남'],
        경상도: ['부산', '대구', '울산', '경북', '경남'],
        제주도: ['제주']
    };

    // 컴포넌트 마운트 시 전체 매장 데이터 가져오기
    useEffect(() => {
        const fetchAllShops = async () => {
            try {
                const response = await fetch('http://localhost:8080/findall');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setAllShops(data);
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };
        fetchAllShops();
    }, []);

    // 검색어 입력 시 자동완성 처리
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim()) {
            // 로컬에서 매장명 필터링
            const filtered = allShops.filter(shop => 
                shop.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setIsDropdownVisible(filtered.length > 0);
        } else {
            setSuggestions([]);
            setIsDropdownVisible(false);
        }
    };

    // 검색 버튼 클릭 처리
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        try {
            const response = await fetch(`http://localhost:8080/search/${encodeURIComponent(searchTerm)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            // TODO: 검색 결과 처리 (예: 지도에 표시, 리스트 업데이트 등)
            console.log('Search results:', data);
            
            setIsDropdownVisible(false); // 드롭다운 닫기
        } catch (error) {
            console.error('Error searching shops:', error);
        }
    };

    // 지역 선택 처리
    const handleRegionSelect = (city) => {
        setSelectedRegion(city);
        setShowRegionPopup(false);
    };

    // 자동완성 항목 선택 처리
    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.name);
        setIsDropdownVisible(false);
        // TODO: 선택된 매장으로 지도 이동 또는 다른 처리
    };

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
            if (regionRef.current && !regionRef.current.contains(event.target)) {
                setShowRegionPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="search-div">
            <div className="region-dropdown" ref={regionRef}>
                <button 
                    className="dropdown-btn"
                    onClick={() => setShowRegionPopup(!showRegionPopup)}
                >
                    {selectedRegion}
                </button>
                {showRegionPopup && (
                    <div className="region-popup">
                        {Object.entries(regions).map(([region, cities]) => (
                            <div key={region} className="region-group">
                                <h3>{region}</h3>
                                <div className="cities">
                                    {cities.map(city => (
                                        <button
                                            key={city}
                                            className={selectedRegion === city ? 'active' : ''}
                                            onClick={() => handleRegionSelect(city)}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="search-container" ref={dropdownRef}>
                <input
                    type="text"
                    className="search-text"
                    placeholder="매장명을 입력하세요"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => searchTerm.trim() && setIsDropdownVisible(true)}
                />
                <button className="search-btn" onClick={handleSearch}>
                    <i className="fas fa-search"></i>
                </button>

                {isDropdownVisible && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <div className="suggestion-name">{suggestion.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar; 