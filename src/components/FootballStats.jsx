import React, { useState, useEffect } from 'react';
import realTimeFootballService from '../services/realTimeFootballService';
import './FootballStats.css';

const FootballStats = () => {
  const [stats, setStats] = useState({
    nextMatch: null,
    recentResults: [],
    standings: null,
    playerStats: [],
    loading: true,
    error: null
  });

  // Fallback mock data for demonstration
  const mockData = {
    nextMatch: {
      date: "2025-01-15",
      time: "20:00",
      opponent: "Morocco",
      competition: "Africa Cup of Nations",
      venue: "Stade Mohammed V, Casablanca",
      homeTeam: "Algeria",
      awayTeam: "Morocco",
      homeFlag: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Algeria.svg/330px-Flag_of_Algeria.svg.png",
      awayFlag: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Morocco.svg/330px-Flag_of_Morocco.svg.png"
    },
    recentResults: [
      {
        id: 1,
        date: "2024-11-18",
        homeTeam: "Algeria",
        awayTeam: "Liberia",
        homeScore: 5,
        awayScore: 1,
        competition: "AFCON Qualifiers",
        result: "W"
      },
      {
        id: 2,
        date: "2024-11-14",
        homeTeam: "Togo",
        awayTeam: "Algeria",
        homeScore: 0,
        awayScore: 1,
        competition: "AFCON Qualifiers",
        result: "W"
      },
      {
        id: 3,
        date: "2024-10-14",
        homeTeam: "Algeria",
        awayTeam: "Equatorial Guinea",
        homeScore: 2,
        awayScore: 0,
        competition: "AFCON Qualifiers",
        result: "W"
      },
      {
        id: 4,
        date: "2024-10-10",
        homeTeam: "Liberia",
        awayTeam: "Algeria",
        homeScore: 1,
        awayScore: 2,
        competition: "AFCON Qualifiers",
        result: "W"
      },
      {
        id: 5,
        date: "2024-09-09",
        homeTeam: "Algeria",
        awayTeam: "Togo",
        homeScore: 3,
        awayScore: 1,
        competition: "AFCON Qualifiers",
        result: "W"
      }
    ],
    standings: {
      position: 1,
      points: 15,
      played: 5,
      won: 5,
      drawn: 0,
      lost: 0,
      goalsFor: 13,
      goalsAgainst: 3,
      goalDifference: 10,
      group: "AFCON Qualifiers Group H"
    },
    playerStats: [
      {
        name: "Riyad Mahrez",
        goals: 4,
        assists: 2,
        appearances: 5,
        position: "Winger"
      },
      {
        name: "Islam Slimani",
        goals: 3,
        assists: 1,
        appearances: 4,
        position: "Striker"
      },
      {
        name: "Yacine Brahimi",
        goals: 2,
        assists: 3,
        appearances: 5,
        position: "Midfielder"
      }
    ]
  };

  // Fetch football data with real-time updates
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prevStats => ({ ...prevStats, loading: true }));
        
        // Get initial data
        const data = await realTimeFootballService.getAllFootballData();
        
        setStats({
          nextMatch: data.nextMatch || mockData.nextMatch,
          recentResults: data.recentResults || mockData.recentResults,
          standings: data.standings || mockData.standings,
          playerStats: data.playerStats || mockData.playerStats,
          liveMatches: data.liveMatches || [],
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching football data:', error);
        // Fallback to mock data on error
        setStats({
          nextMatch: mockData.nextMatch,
          recentResults: mockData.recentResults,
          standings: mockData.standings,
          playerStats: mockData.playerStats,
          liveMatches: [],
          loading: false,
          error: null
        });
      }
    };

    // Initial fetch
    fetchStats();

    // Subscribe to real-time updates
    const unsubscribe = realTimeFootballService.subscribe((newData) => {
      console.log('🔔 Real-time update received!', newData);
      setStats(prevStats => ({
        ...prevStats,
        nextMatch: newData.nextMatch || prevStats.nextMatch,
        recentResults: newData.recentResults || prevStats.recentResults,
        standings: newData.standings || prevStats.standings,
        playerStats: newData.playerStats || prevStats.playerStats,
        liveMatches: newData.liveMatches || [],
        loading: false,
        error: null
      }));
      
      // Show notification for new updates
      if (newData.isLive) {
        showNotification('🔴 LIVE: Algeria match in progress!');
      } else if (newData.nextMatch) {
        showNotification('⚽ New match scheduled for Algeria!');
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Show notification helper
  const showNotification = (message) => {
    // Simple notification (you can enhance this with a toast library)
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

  if (stats.loading) {
    return (
      <section id="stats" className="football-stats">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading latest football data...</p>
          </div>
        </div>
      </section>
    );
  }

  if (stats.error) {
    return (
      <section id="stats" className="football-stats">
        <div className="container">
          <div className="error-container">
            <h2>Unable to load football data</h2>
            <p>{stats.error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stats" className="football-stats">
      <div className="container">
        <div className="stats-header">
          <h2>Algeria Football Statistics</h2>
          <p>Latest match results, upcoming fixtures, and team performance</p>
          {stats.liveMatches && stats.liveMatches.length > 0 && (
            <div className="live-indicator">
              <span className="live-dot"></span>
              LIVE MATCH IN PROGRESS
            </div>
          )}
        </div>

        {/* Live Matches */}
        {stats.liveMatches && stats.liveMatches.length > 0 && (
          <div className="live-matches-section">
            <h3>🔴 LIVE NOW</h3>
            {stats.liveMatches.map(match => (
              <div key={match.id} className="live-match-card">
                <div className="live-badge">LIVE</div>
                <div className="match-teams">
                  <div className="team">
                    <span className="team-name">{match.homeTeam}</span>
                    <span className="score">{match.homeScore}</span>
                  </div>
                  <div className="vs">-</div>
                  <div className="team">
                    <span className="score">{match.awayScore}</span>
                    <span className="team-name">{match.awayTeam}</span>
                  </div>
                </div>
                <div className="match-info">
                  <span className="minute">{match.minute}'</span>
                  <span className="competition">{match.competition}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Next Match */}
        {stats.nextMatch && (
          <div className="next-match-section">
            <h3>Next Match</h3>
            <div className="next-match-card">
              <div className="match-date">
                <span className="date">{formatDate(stats.nextMatch.date)}</span>
                <span className="time">{stats.nextMatch.time}</span>
              </div>
              <div className="match-teams">
                <div className="team home-team">
                  <img src={stats.nextMatch.homeFlag} alt="Algeria" className="team-flag" />
                  <span className="team-name">{stats.nextMatch.homeTeam}</span>
                </div>
                <div className="vs">VS</div>
                <div className="team away-team">
                  <img src={stats.nextMatch.awayFlag} alt={stats.nextMatch.awayTeam} className="team-flag" />
                  <span className="team-name">{stats.nextMatch.awayTeam}</span>
                </div>
              </div>
              <div className="match-details">
                <div className="competition">{stats.nextMatch.competition}</div>
                <div className="venue">{stats.nextMatch.venue}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Results */}
        <div className="recent-results-section">
          <h3>Recent Results</h3>
          <div className="results-grid">
            {stats.recentResults.map(match => (
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
              </div>
            ))}
          </div>
        </div>

        {/* Standings */}
        {stats.standings && (
          <div className="standings-section">
            <h3>Current Standing</h3>
            <div className="standings-card">
              <div className="standings-header">
                <h4>{stats.standings.group}</h4>
                <div className="position">Position: {stats.standings.position}</div>
              </div>
              <div className="standings-stats">
                <div className="stat">
                  <span className="stat-label">Points</span>
                  <span className="stat-value">{stats.standings.points}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Played</span>
                  <span className="stat-value">{stats.standings.played}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Won</span>
                  <span className="stat-value">{stats.standings.won}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Drawn</span>
                  <span className="stat-value">{stats.standings.drawn}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Lost</span>
                  <span className="stat-value">{stats.standings.lost}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">GF</span>
                  <span className="stat-value">{stats.standings.goalsFor}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">GA</span>
                  <span className="stat-value">{stats.standings.goalsAgainst}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">GD</span>
                  <span className="stat-value">+{stats.standings.goalDifference}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Performers */}
        {stats.playerStats && (
          <div className="player-stats-section">
            <h3>Top Performers</h3>
            <div className="player-stats-grid">
              {stats.playerStats.map((player, index) => (
                <div key={index} className="player-stat-card">
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
                      <span className="stat-label">Apps</span>
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
