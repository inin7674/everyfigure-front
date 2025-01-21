import { useState } from 'react';
import './SearchBar.css';

const SearchBar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('서울');

    const regions = {
        '수도권': ['서울', '경기', '인천'],
        '강원권': ['강원'],
        '충청권': ['대전', '충북', '충남'],
        '전라권': ['광주', '전북', '전남'],
        '경상권': ['부산', '대구', '울산', '경북', '경남'],
        '제주': ['제주']
    };

    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
        setIsDropdownOpen(false);
    };

    return (
        <div className="search-div">
            <div className="region-dropdown">
                <button 
                    className="dropdown-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    {selectedRegion}
                </button>
                {isDropdownOpen && (
                    <div className="region-popup">
                        {Object.entries(regions).map(([area, cities]) => (
                            <div key={area} className="region-group">
                                <h3>{area}</h3>
                                <div className="cities">
                                    {cities.map(city => (
                                        <button
                                            key={city}
                                            onClick={() => handleRegionSelect(city)}
                                            className={selectedRegion === city ? 'active' : ''}
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
            <input className="search-text" type="text" placeholder="검색어 입력" />
            <button className="search-btn" type="submit">
                <i className="fas fa-search"></i>
            </button>
        </div>
    );
};

export default SearchBar; 