import axios from 'axios';
import { API_CONFIG } from './config';

const DEFAULT_TIMEOUT_MS = 12_000;
const BASE_HEADERS = {
  Accept: 'application/json',
};

export const apiFootballClient = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    ...BASE_HEADERS,
    ...(API_CONFIG.apiFootballKey ? { 'x-apisports-key': API_CONFIG.apiFootballKey } : {}),
  },
});

export const sportsDbClient = axios.create({
  baseURL: 'https://www.thesportsdb.com/api/v1/json/3',
  timeout: DEFAULT_TIMEOUT_MS,
  headers: BASE_HEADERS,
});

export const newsClient = axios.create({
  baseURL: 'https://newsapi.org/v2',
  timeout: DEFAULT_TIMEOUT_MS,
  headers: BASE_HEADERS,
});

export const gdeltClient = axios.create({
  baseURL: 'https://api.gdeltproject.org/api/v2',
  timeout: DEFAULT_TIMEOUT_MS,
  headers: BASE_HEADERS,
});

export const guardianClient = axios.create({
  baseURL: 'https://content.guardianapis.com',
  timeout: DEFAULT_TIMEOUT_MS,
  headers: BASE_HEADERS,
});

export const commonsClient = axios.create({
  baseURL: 'https://commons.wikimedia.org/w/api.php',
  timeout: DEFAULT_TIMEOUT_MS,
  headers: BASE_HEADERS,
});
