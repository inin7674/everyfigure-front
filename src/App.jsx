import { useState } from 'react'
import '../src/css/my.css'
import './App.css'
import SearchBar from './components/SearchBar'
import NaverMap from './components/NaverMap'
import ShopList from './components/ShopList'
import Header from './components/Header'

function App() {
  return (
    <main>
      <div className="container py-4">
        <Header />
        <SearchBar />
        
        <div className="row align-items-md-stretch">
          <div className="col-md-6">
            <NaverMap />
          </div>
          <div className="col-md-6">
            <ShopList />
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
