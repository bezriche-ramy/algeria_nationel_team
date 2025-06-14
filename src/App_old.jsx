import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import LatestNews from './components/LatestNews';
import History from './components/History';
import Squad from './components/Squad';
import FootballStatsReal from './components/FootballStatsReal';
import './App.css';eact from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import LatestNews from './components/LatestNews'
import History from './components/History'
import Squad from './components/Squad'
import FootballStats from './components/FootballStats'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <LatestNews />
      <History />
      <Squad />
      <FootballStats />
    </div>
  )
}

export default App
