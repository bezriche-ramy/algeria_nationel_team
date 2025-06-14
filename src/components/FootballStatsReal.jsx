import React, { useState, useEffect } from 'react';
import './FootballStats.css';
import realFootballService from '../services/realFootballService';

const FootballStats = () => {
  const [footballData, setFootballData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const initializeData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Initializing REAL football data...');
        
        // Get initial data
        const data = await realFootballService.getAllRealFootballData();
        console.log('📊 Received data:', data);
        console.log('📊 Data source:', data.dataSource);
        
        setFootballData(data);
        setLastUpdate(data.lastUpdate);
        setError(null);
        
        // Subscribe to real-time updates
        unsubscribe = realFootballService.subscribe((newData) => {
          console.log('🔄 Received real-time update:', newData);
          setFootballData(newData);
          setLastUpdate(newData.lastUpdate);
          
          // Show notification for important updates
          if (newData.isLive) {
            showNotification('🔴 LIVE: Algeria match in progress!');
          }
        });
        
      } catch (err) {
        console.error('❌ Error initializing football data:', err);
        setError('Failed to load football data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Show notification helper
  const showNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Algeria Football Update', {
        body: message,
        icon: '/vite.svg'
      });
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getResultClass = (result) => {
    switch (result) {
      case 'W': return 'result-win';
      case 'D': return 'result-draw';
      case 'L': return 'result-loss';
      default: return '';
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await realFootballService.getAllRealFootballData();
      setFootballData(data);
      setLastUpdate(data.lastUpdate);
      setError(null);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Force refresh data (clear cache and fetch fresh)
  const forceRefresh = async () => {
    try {
      setLoading(true);
      console.log('🔄 FORCE REFRESHING with verified data...');
      
      // Clear any cached data
      if (realFootballService.cachedData) {
        realFootballService.cachedData = null;
      }
      
      // Force fetch fresh data
      const data = await realFootballService.getAllRealFootballData();
      console.log('📊 FORCED REFRESH - New data:', data);
      console.log('📊 Data source:', data.dataSource);
      console.log('📊 Standings:', data.standings);
      console.log('🔥 STANDINGS LOST VALUE:', data.standings?.lost);
      
      setFootballData(data);
      setLastUpdate(data.lastUpdate);
      setError(null);
      
      // Show notification about the corrected data
      if (data.standings?.lost === 1) {
        console.log('✅ CORRECT: Displaying Lost: 1');
      } else {
        console.error('❌ INCORRECT: Lost value is', data.standings?.lost);
      }
      
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-force refresh on component mount to ensure latest data
  useEffect(() => {
    forceRefresh();
  }, []);

  if (loading) {
    return (
      <section id="stats" className="football-stats">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading REAL football data from APIs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="stats" className="football-stats">
        <div className="container">
          <div className="error-container">
            <h2>Unable to load football data</h2>
            <p>{error}</p>
            <button onClick={refreshData} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stats" className="football-stats">
      <div className="container">
        <div className="stats-header">
          <h2>🇩🇿 Algeria Football Statistics</h2>
          <p>Real-time match results, upcoming fixtures, and team performance</p>
          <div className="data-source">
            <span>📡 {footballData?.dataSource || 'Live Data'}</span>
            <span className="last-update">
              Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
            </span>
            <button onClick={forceRefresh} className="refresh-button" title="Force refresh data">
              🔄
            </button>
          </div>
          {footballData?.isLive && (
            <div className="live-indicator">
              <span className="live-dot"></span>
              LIVE MATCH IN PROGRESS
            </div>
          )}
        </div>

        {/* Next Match */}
        {footballData?.nextMatch && (
          <div className="next-match-section">
            <h3>⚽ Next Match</h3>
            <div className="next-match-card">
              <div className="match-date">
                <span className="date">{formatDate(footballData.nextMatch.date)}</span>
                <span className="time">{footballData.nextMatch.time}</span>
              </div>
              <div className="match-teams">
                <div className="team home-team">
                  <img 
                    src={footballData.nextMatch.homeFlag} 
                    alt={footballData.nextMatch.homeTeam} 
                    className="team-flag" 
                    onError={(e) => {
                      e.target.src = 'https://flagcdn.com/w320/dz.png';
                    }}
                  />
                  <span className="team-name">{footballData.nextMatch.homeTeam}</span>
                </div>
                <div className="vs">VS</div>
                <div className="team away-team">
                  <img 
                    src={footballData.nextMatch.awayFlag} 
                    alt={footballData.nextMatch.awayTeam} 
                    className="team-flag"
                    onError={(e) => {
                      e.target.src = 'https://flagcdn.com/w320/dz.png';
                    }}
                  />
                  <span className="team-name">{footballData.nextMatch.awayTeam}</span>
                </div>
              </div>
              <div className="match-details">
                <div className="competition">{footballData.nextMatch.competition}</div>
                <div className="venue">{footballData.nextMatch.venue}</div>
                <div className="status">{footballData.nextMatch.status}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Results */}
        {footballData?.recentResults && footballData.recentResults.length > 0 && (
          <div className="recent-results-section">
            <h3>📊 Recent Results</h3>
            <div className="results-grid">
              {footballData.recentResults.map(match => (
                <div key={match.id} className={`result-card ${getResultClass(match.result)}`}>
                  <div className="match-date">
                    {new Date(match.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="match-teams">
                    <span className="team">{match.homeTeam}</span>
                    <div className="score">
                      <span className="home-score">{match.homeScore}</span>
                      <span className="separator">-</span>
                      <span className="away-score">{match.awayScore}</span>
                    </div>
                    <span className="team">{match.awayTeam}</span>
                  </div>
                  <div className="competition">{match.competition}</div>
                  <div className={`result-badge ${getResultClass(match.result)}`}>
                    {match.result}
                  </div>
                  {match.isLive && (
                    <div className="live-badge">LIVE</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standings */}
        {footballData?.standings && (
          <div className="standings-section">
            <h3>🏆 Current Standing</h3>
            <div className="standings-card">
              <div className="standings-header">
                <h4>{footballData.standings.group}</h4>
                <div className="position">Position: #{footballData.standings.position}</div>
              </div>
              <div className="standings-stats">
                <div className="stat">
                  <span className="stat-label">Points</span>
                  <span className="stat-value">{footballData.standings.points}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Played</span>
                  <span className="stat-value">{footballData.standings.played}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Won</span>
                  <span className="stat-value stat-win">{footballData.standings.won}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Drawn</span>
                  <span className="stat-value stat-draw">{footballData.standings.drawn}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Lost</span>
                  <span className="stat-value stat-loss">
                    {footballData.standings.lost}
                    {footballData.standings.lost === 1 && <span style={{color: 'green', fontSize: '12px'}}> ✅</span>}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Goals For</span>
                  <span className="stat-value">{footballData.standings.goalsFor}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Goals Against</span>
                  <span className="stat-value">{footballData.standings.goalsAgainst}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Goal Diff</span>
                  <span className={`stat-value ${footballData.standings.goalDifference >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                    {footballData.standings.goalDifference >= 0 ? '+' : ''}{footballData.standings.goalDifference}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Performers */}
        {footballData?.playerStats && footballData.playerStats.length > 0 && (
          <div className="player-stats-section">
            <h3>🌟 Top Performers</h3>
            <div className="player-stats-grid">
              {footballData.playerStats.map((player, index) => (
                <div key={index} className="player-stat-card">
                  <div className="player-rank">#{index + 1}</div>
                  <div className="player-name">{player.name}</div>
                  <div className="player-position">{player.position}</div>
                  <div className="player-stats">
                    <div className="stat">
                      <span className="stat-value">{player.goals}</span>
                      <span className="stat-label">Goals</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{player.assists}</span>
                      <span className="stat-label">Assists</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{player.appearances}</span>
                      <span className="stat-label">Caps</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FootballStats;
