import { useState } from 'react'
import '../src/css/my.css'
import './App.css'
import SearchBar from './components/SearchBar'
import NaverMap from './components/NaverMap'
import ShopList from './components/ShopList'
import Header from './components/Header'

function App() {
  const [shops, setShops] = useState([]);
  const [visibleShops, setVisibleShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredShopId, setHoveredShopId] = useState(null);

  const handleVisibleShopsChange = (newVisibleShops) => {
    setVisibleShops(newVisibleShops);
    setIsLoading(false);
  };

  const handleShopHover = (shopId) => {
    setHoveredShopId(shopId);
  };

  const handleShopLeave = () => {
    setHoveredShopId(null);
  };

  return (
    <main>
      <div className="container py-4">
        <Header />
        <SearchBar />
        
        <div className="row align-items-md-stretch">
          <div className="col-md-6">
            <NaverMap 
              shops={shops} 
              setShops={setShops}
              onVisibleShopsChange={handleVisibleShopsChange}
              hoveredShopId={hoveredShopId}
            />
          </div>
          <div className="col-md-6">
            <ShopList 
              shops={isLoading ? shops : visibleShops} 
              isLoading={isLoading}
              onShopHover={handleShopHover}
              onShopLeave={handleShopLeave}
            />
          </div>
        </div>

        <footer className="pt-3 mt-4 text-body-secondary border-top">
          &copy; 2024
        </footer>
      </div>
    </main>
  )
}

export default App
