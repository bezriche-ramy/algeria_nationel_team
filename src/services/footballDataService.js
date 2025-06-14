import axios from 'axios';

class FootballDataService {
  constructor() {
    this.baseURL = 'https://api.football-data.org/v4';
    this.apiKey = import.meta.env.VITE_FOOTBALL_API_KEY || 'demo'; // You'll need to get a free API key
    this.teamId = 5616; // Algeria national team ID (may vary by API)
  }

  // Set up axios instance with headers
  getAxiosInstance() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Auth-Token': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  // Alternative: Scrape from ESPN or BBC Sport (CORS-proxy needed)
  async scrapeESPNData() {
    try {
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = 'https://www.espn.com/soccer/team/_/id/5616/algeria';
      
      const response = await axios.get(proxyUrl + targetUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      // This would require HTML parsing with cheerio or similar
      // For demonstration, we'll return mock data
      return this.getMockData();
    } catch (error) {
      console.error('Error scraping ESPN data:', error);
      return this.getMockData();
    }
  }

  // Get team fixtures
  async getFixtures() {
    try {
      const api = this.getAxiosInstance();
      const response = await api.get(`/teams/${this.teamId}/matches?status=SCHEDULED&limit=5`);
      
      return response.data.matches.map(match => ({
        id: match.id,
        date: match.utcDate,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
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
      const api = this.getAxiosInstance();
      const response = await api.get(`/teams/${this.teamId}/matches?status=FINISHED&limit=10`);
      
      return response.data.matches.map(match => ({
        id: match.id,
        date: match.utcDate,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeScore: match.score.fullTime.home,
        awayScore: match.score.fullTime.away,
        competition: match.competition.name,
        result: this.getResult(match, 'Algeria')
      }));
    } catch (error) {
      console.error('Error fetching results:', error);
      return this.getMockData().recentResults;
    }
  }

  // Get team standings
  async getStandings() {
    try {
      const api = this.getAxiosInstance();
      // This would require competition ID for current competition
      const response = await api.get(`/competitions/2016/standings`); // Example competition
      
      const team = response.data.standings[0].table.find(team => team.team.name === 'Algeria');
      
      if (team) {
        return {
          position: team.position,
          points: team.points,
          played: team.playedGames,
          won: team.won,
          drawn: team.draw,
          lost: team.lost,
          goalsFor: team.goalsFor,
          goalsAgainst: team.goalsAgainst,
          goalDifference: team.goalDifference
        };
      }
    } catch (error) {
      console.error('Error fetching standings:', error);
      return this.getMockData().standings;
    }
  }

  // Alternative: Scrape from a reliable sports news website
  async scrapeFromSportsWebsite() {
    try {
      // Example: Scraping from a sports website (requires CORS proxy in browser)
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      const targetUrl = encodeURIComponent('https://www.goal.com/en/team/algeria/10xz0jw1dh7j1hk8p4zjuqnul');
      
      const response = await axios.get(proxyUrl + targetUrl);
      
      // Parse HTML content (would use cheerio in Node.js environment)
      // For browser, we'd need to parse the HTML string manually or use DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data.contents, 'text/html');
      
      // Extract data from parsed HTML
      // This is a simplified example - real implementation would be more complex
      
      return this.getMockData();
      
    } catch (error) {
      console.error('Error scraping sports website:', error);
      return this.getMockData();
    }
  }

  // Helper function to determine match result
  getResult(match, teamName) {
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

  // Fallback mock data for demonstration
  getMockData() {
    return {
      nextMatches: [
        {
          id: 1,
          date: "2025-01-15T19:00:00Z",
          homeTeam: "Algeria",
          awayTeam: "Morocco",
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
          result: "W"
        },
        {
          id: 2,
          date: "2024-11-14T19:00:00Z",
          homeTeam: "Togo",
          awayTeam: "Algeria",
          homeScore: 2,
          awayScore: 1,
          competition: "AFCON Qualifiers",
          result: "L"
        },
        {
          id: 3,
          date: "2024-10-14T17:00:00Z",
          homeTeam: "Algeria",
          awayTeam: "Equatorial Guinea",
          homeScore: 2,
          awayScore: 0,
          competition: "AFCON Qualifiers",
          result: "W"
        },
        {
          id: 4,
          date: "2024-10-10T19:00:00Z",
          homeTeam: "Liberia",
          awayTeam: "Algeria",
          homeScore: 1,
          awayScore: 2,
          competition: "AFCON Qualifiers",
          result: "W"
        },
        {
          id: 5,
          date: "2024-09-09T17:00:00Z",
          homeTeam: "Algeria",
          awayTeam: "Togo",
          homeScore: 3,
          awayScore: 1,
          competition: "AFCON Qualifiers",
          result: "W"
        },
        {
          id: 6,
          date: "2024-09-05T17:00:00Z",
          homeTeam: "Algeria",
          awayTeam: "Mozambique",
          homeScore: 3,
          awayScore: 0,
          competition: "AFCON Qualifiers",
          result: "W"
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

  // Main method to get all football data
  async getAllFootballData() {
    try {
      // Try to get real data first, fallback to mock data
      const [fixtures, results, standings] = await Promise.allSettled([
        this.getFixtures(),
        this.getRecentResults(),
        this.getStandings()
      ]);

      return {
        nextMatch: fixtures.status === 'fulfilled' && fixtures.value.length > 0 
          ? fixtures.value[0] 
          : this.getMockData().nextMatches[0],
        recentResults: results.status === 'fulfilled' 
          ? results.value 
          : this.getMockData().recentResults,
        standings: standings.status === 'fulfilled' 
          ? standings.value 
          : this.getMockData().standings,
        playerStats: this.getMockData().playerStats // Always use mock for now
      };
    } catch (error) {
      console.error('Error fetching all football data:', error);
      return this.getMockData();
    }
  }
}

export default new FootballDataService();
