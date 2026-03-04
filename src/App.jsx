import { useEffect } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import LiveMatch from './components/LiveMatch/LiveMatch';
import News from './components/News/News';
import History from './components/History/History';
import SquadGrid from './components/Squad/SquadGrid';
import Footer from './components/Footer/Footer';
import useFootballStore from './store/useFootballStore';
import './App.css';

function App() {
  const fetchDashboard = useFootballStore((state) => state.fetchDashboard);
  const refreshMatches = useFootballStore((state) => state.refreshMatches);

  useEffect(() => {
    fetchDashboard();
    const timer = window.setInterval(() => {
      refreshMatches();
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [fetchDashboard, refreshMatches]);

  return (
    <div className="app">
      <Header />
      <Hero />
      <LiveMatch />
      <News />
      <History />
      <SquadGrid />
      <Footer />
    </div>
  );
}

export default App;
