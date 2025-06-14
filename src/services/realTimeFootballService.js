import axios from 'axios';

class RealTimeFootballService {
  constructor() {
    // Multiple API sources for real data
    this.apis = {
      footballData: {
        baseURL: 'https://api.football-data.org/v4',
        key: import.meta.env.VITE_FOOTBALL_API_KEY,
        teamId: 5616
      },
      sportsDb: {
        baseURL: 'https://www.thesportsdb.com/api/v1/json/3',
        teamId: '135074' // Algeria team ID in SportsDB
      },
      apiSports: {
        baseURL: 'https://v3.football.api-sports.io',
        key: import.meta.env.VITE_RAPID_API_KEY,
        teamId: 1569 // Algeria team ID in API-Sports
      }
    };
    
    this.subscribers = new Set();
    this.updateInterval = null;
    this.lastUpdate = null;
    this.cachedData = null;
  }

  // Subscribe to real-time updates
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Start polling if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.startRealTimeUpdates();
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.stopRealTimeUpdates();
      }
    };
  }

  // Start real-time updates (polling every 5 minutes)
  startRealTimeUpdates() {
    console.log('🔄 Starting real-time football updates...');
    
    // Initial fetch
    this.fetchAndNotify();
    
    // Set up interval for updates every 5 minutes
    this.updateInterval = setInterval(() => {
      this.fetchAndNotify();
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    console.log('⏹️ Stopping real-time football updates...');
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Fetch data and notify subscribers
  async fetchAndNotify() {
    try {
      console.log('🔄 Fetching latest football data...');
      const newData = await this.getAllFootballData();
      
      // Check if data has changed
      if (this.hasDataChanged(newData)) {
        console.log('📢 New football data available!');
        this.cachedData = newData;
        this.lastUpdate = new Date();
        
        // Notify all subscribers
        this.subscribers.forEach(callback => {
          try {
            callback(newData);
          } catch (error) {
            console.error('Error in subscriber callback:', error);
          }
        });
      } else {
        console.log('✅ Football data unchanged');
      }
    } catch (error) {
      console.error('Error fetching football data:', error);
    }
  }

  // Check if data has changed
  hasDataChanged(newData) {
    if (!this.cachedData) return true;
    
    // Compare key fields to detect changes
    const oldNextMatch = this.cachedData.nextMatch;
    const newNextMatch = newData.nextMatch;
    
    const oldResults = this.cachedData.recentResults;
    const newResults = newData.recentResults;
    
    // Check if next match changed
    if (JSON.stringify(oldNextMatch) !== JSON.stringify(newNextMatch)) {
      return true;
    }
    
    // Check if results changed (new match result)
    if (oldResults.length !== newResults.length) {
      return true;
    }
    
    // Check if any result changed
    for (let i = 0; i < oldResults.length; i++) {
      if (JSON.stringify(oldResults[i]) !== JSON.stringify(newResults[i])) {
        return true;
      }
    }
    
    return false;
  }

  // Enhanced API request with retry logic
  async makeApiRequest(endpoint, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          headers: {
            'X-Auth-Token': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        return response.data;
      } catch (error) {
        console.error(`API request failed (attempt ${i + 1}):`, error.message);
        if (i === retries - 1) throw error;
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  // Get upcoming fixtures
  async getUpcomingFixtures() {
    try {
      const data = await this.makeApiRequest(`/teams/${this.teamId}/matches?status=SCHEDULED&limit=5`);
      
      return data.matches.map(match => ({
        id: match.id,
        date: match.utcDate,
        time: new Date(match.utcDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeFlag: this.getTeamFlag(match.homeTeam.name),
        awayFlag: this.getTeamFlag(match.awayTeam.name),
        competition: match.competition.name,
        venue: match.venue || 'TBD',
        status: match.status
      }));
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      return this.getMockData().nextMatches;
    }
  }

  // Get recent results
  async getRecentResults() {
    try {
      const data = await this.makeApiRequest(`/teams/${this.teamId}/matches?status=FINISHED&limit=10`);
      
      return data.matches.map(match => ({
        id: match.id,
        date: match.utcDate,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeScore: match.score.fullTime.home,
        awayScore: match.score.fullTime.away,
        competition: match.competition.name,
        result: this.getMatchResult(match, 'Algeria'),
        isLive: match.status === 'LIVE' || match.status === 'IN_PLAY'
      }));
    } catch (error) {
      console.error('Error fetching results:', error);
      return this.getMockData().recentResults;
    }
  }

  // Get live matches (if any)
  async getLiveMatches() {
    try {
      const data = await this.makeApiRequest(`/teams/${this.teamId}/matches?status=LIVE`);
      
      return data.matches.map(match => ({
        id: match.id,
        date: match.utcDate,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeScore: match.score.fullTime.home || 0,
        awayScore: match.score.fullTime.away || 0,
        competition: match.competition.name,
        minute: match.minute || 0,
        status: match.status,
        isLive: true
      }));
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  }

  // Get team flag URL
  getTeamFlag(teamName) {
    const flags = {
      'Algeria': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Algeria.svg/330px-Flag_of_Algeria.svg.png',
      'Morocco': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Morocco.svg/330px-Flag_of_Morocco.svg.png',
      'Tunisia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Tunisia.svg/330px-Flag_of_Tunisia.svg.png',
      'Egypt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/330px-Flag_of_Egypt.svg.png',
      'Nigeria': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_Nigeria.svg/330px-Flag_of_Nigeria.svg.png',
      'Ghana': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/330px-Flag_of_Ghana.svg.png',
      'Senegal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/330px-Flag_of_Senegal.svg.png',
      'Cameroon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Flag_of_Cameroon.svg/330px-Flag_of_Cameroon.svg.png',
      'Ivory Coast': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/330px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png',
      'Mali': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_Mali.svg/330px-Flag_of_Mali.svg.png',
      'Burkina Faso': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/330px-Flag_of_Burkina_Faso.svg.png',
      'Liberia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Flag_of_Liberia.svg/330px-Flag_of_Liberia.svg.png',
      'Togo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Flag_of_Togo.svg/330px-Flag_of_Togo.svg.png',
      'Equatorial Guinea': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Equatorial_Guinea.svg/330px-Flag_of_Equatorial_Guinea.svg.png'
    };
    
    return flags[teamName] || 'https://via.placeholder.com/330x220?text=Flag';
  }

  // Determine match result
  getMatchResult(match, teamName) {
    const isHome = match.homeTeam.name === teamName;
    const homeScore = match.score.fullTime.home;
    const awayScore = match.score.fullTime.away;
    
    if (homeScore === awayScore) return 'D';
    
    if (isHome) {
      return homeScore > awayScore ? 'W' : 'L';
    } else {
      return awayScore > homeScore ? 'W' : 'L';
    }
  }

  // Get all football data
  async getAllFootballData() {
    try {
      const [fixtures, results, liveMatches] = await Promise.allSettled([
        this.getUpcomingFixtures(),
        this.getRecentResults(),
        this.getLiveMatches()
      ]);

      const fixturesData = fixtures.status === 'fulfilled' ? fixtures.value : [];
      const resultsData = results.status === 'fulfilled' ? results.value : [];
      const liveData = liveMatches.status === 'fulfilled' ? liveMatches.value : [];

      return {
        nextMatch: fixturesData.length > 0 ? fixturesData[0] : this.getMockData().nextMatches[0],
        recentResults: resultsData.length > 0 ? resultsData : this.getMockData().recentResults,
        liveMatches: liveData,
        standings: this.getMockData().standings, // Using mock for now
        playerStats: this.getMockData().playerStats,
        lastUpdate: new Date(),
        isLive: liveData.length > 0
      };
    } catch (error) {
      console.error('Error fetching all football data:', error);
      return this.getMockData();
    }
  }

  // Mock data for fallback
  getMockData() {
    return {
      nextMatches: [
        {
          id: 1,
          date: "2025-01-15T19:00:00Z",
          time: "20:00",
          homeTeam: "Algeria",
          awayTeam: "Morocco",
          homeFlag: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Algeria.svg/330px-Flag_of_Algeria.svg.png",
          awayFlag: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Morocco.svg/330px-Flag_of_Morocco.svg.png",
          competition: "Africa Cup of Nations",
          venue: "Stade Mohammed V, Casablanca",
          status: "SCHEDULED"
        }
      ],
      recentResults: [
        {
          id: 1,
          date: "2024-11-18T17:00:00Z",
          homeTeam: "Algeria",
          awayTeam: "Liberia",
          homeScore: 5,
          awayScore: 1,
          competition: "AFCON Qualifiers",
          result: "W",
          isLive: false
        },
        {
          id: 2,
          date: "2024-11-14T19:00:00Z",
          homeTeam: "Togo",
          awayTeam: "Algeria",
          homeScore: 2,
          awayScore: 1,
          competition: "AFCON Qualifiers",
          result: "L",
          isLive: false
        },
        {
          id: 3,
          date: "2024-10-14T17:00:00Z",
          homeTeam: "Algeria",
          awayTeam: "Equatorial Guinea",
          homeScore: 2,
          awayScore: 0,
          competition: "AFCON Qualifiers",
          result: "W",
          isLive: false
        }
      ],
      standings: {
        position: 1,
        points: 15,
        played: 6,
        won: 5,
        drawn: 0,
        lost: 1,
        goalsFor: 16,
        goalsAgainst: 6,
        goalDifference: 10,
        group: "AFCON Qualifiers Group G"
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
  }
}

export default new RealTimeFootballService();
