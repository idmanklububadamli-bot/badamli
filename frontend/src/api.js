const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  return res.json();
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }
  return res.json();
}

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) throw new Error('Turnir siyahısını yükləmək mümkün olmadı');
  return res.json();
}

export async function fetchEventDetails(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) throw new Error('Turnir detallarını yükləmək mümkün olmadı');
  return res.json();
}

export async function updateEventDetails(id, eventData) {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(eventData)
  });
  if (!res.ok) throw new Error('Turnir detallarını yeniləmək mümkün olmadı');
  return res.json();
}

export async function fetchCategories(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/categories`);
  if (!res.ok) throw new Error('Kateqoriya siyahısını yükləmək mümkün olmadı');
  return res.json();
}

export async function fetchAthletes(categoryId) {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/athletes`);
  if (!res.ok) throw new Error('İdmançı siyahısını yükləmək mümkün olmadı');
  return res.json();
}

export async function fetchDraws(categoryId) {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/draws`);
  if (!res.ok) throw new Error('Püşkatma siyahısını yükləmək mümkün olmadı');
  return res.json();
}

export async function generateDraws(eventId, categoryId) {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/generate-draws`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ eventId })
  });
  if (!res.ok) throw new Error('Püşkatmanı yenidən yaratmaq mümkün olmadı');
  return res.json();
}

export async function registerAthlete(categoryId, athleteData) {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/athletes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(athleteData)
  });
  if (!res.ok) throw new Error('İdmançı qeydiyyatı uğursuz oldu');
  return res.json();
}

export async function fetchStats(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/statistics`);
  if (!res.ok) throw new Error('Statistikanı yükləmək mümkün olmadı');
  return res.json();
}

export async function fetchMatchDetails(matchId) {
  const res = await fetch(`${API_BASE}/matches/${matchId}`);
  if (!res.ok) throw new Error('Matç məlumatlarını yükləmək mümkün olmadı');
  return res.json();
}

export async function updateMatchScore(matchId, scoreData) {
  const res = await fetch(`${API_BASE}/matches/${matchId}/score`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(scoreData)
  });
  if (!res.ok) throw new Error('Xal məlumatını yeniləmək mümkün olmadı');
  return res.json();
}
