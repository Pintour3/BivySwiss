// Client de l'API BivySwiss. Les cookies sont envoyés pour le futur login.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    signal,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Erreur ${res.status}`);
  return data;
}

const qs = (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null && v !== false));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
};

export const api = {
  hikes: (params, signal) => request(`/hikes${qs(params)}`, { signal }),
  hike: (slug, signal) => request(`/hikes/${slug}`, { signal }),
  hikeWeather: (slug, signal) => request(`/hikes/${slug}/weather`, { signal }),
  recipes: (params, signal) => request(`/recipes${qs(params)}`, { signal }),
  meals: (params, signal) => request(`/meals${qs(params)}`, { signal }),
  backpacks: (params, signal) => request(`/backpacks${qs(params)}`, { signal }),
  recommendBackpack: (body) => request('/backpacks/recommend', { method: 'POST', body }),
  gear: (signal) => request('/gear', { signal }),
  suggest: (body) => request('/planner/suggest', { method: 'POST', body }),
  quizQuestions: (answers) => request('/quiz/questions', { method: 'POST', body: { answers } }),
  quizResult: (answers) => request('/quiz/result', { method: 'POST', body: { answers } }),
  geocode: (q) => request(`/geocode${qs({ q })}`),
  authStatus: () => request('/auth/status'),
};
