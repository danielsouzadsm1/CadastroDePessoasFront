import axios from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;