export interface ScoreItem {
  id: string;
  rank: number;
  playerName: string;
  score: number;
  createdAt: string;
}

export interface SubmitScoreResponse {
  saved: boolean;
  rank: number | null;
  entry: ScoreItem | null;
  message?: string;
  leaderboard: ScoreItem[];
}

const DEFAULT_API_BASE_URL = 'http://localhost:3010';

export const getApiBaseUrl = (): string => {
  const configured = process.env.REACT_APP_API_URL;
  if (configured && configured.trim().length > 0) {
    return configured.trim().replace(/\/+$/, '');
  }
  return DEFAULT_API_BASE_URL;
};

export const getTopScores = async (): Promise<ScoreItem[]> => {
  if (typeof fetch !== 'function') {
    return [];
  }

  const response = await fetch(`${getApiBaseUrl()}/api/scores`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load leaderboard');
  }

  const body = (await response.json()) as { data?: ScoreItem[] };
  return Array.isArray(body.data) ? body.data : [];
};

export const submitScore = async (
  playerName: string,
  score: number
): Promise<SubmitScoreResponse> => {
  if (typeof fetch !== 'function') {
    throw new Error('Network client unavailable');
  }

  const response = await fetch(`${getApiBaseUrl()}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, score }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to submit score';
    try {
      const errBody = (await response.json()) as {
        message?: string;
        details?: string[];
      };
      if (Array.isArray(errBody.details) && errBody.details.length > 0) {
        errorMessage = errBody.details[0];
      } else if (errBody.message) {
        errorMessage = errBody.message;
      }
    } catch {
      // Fallback to default message when response is not JSON
    }
    throw new Error(errorMessage);
  }

  const raw = (await response.json()) as Partial<SubmitScoreResponse>;
  return {
    saved: Boolean(raw.saved),
    rank: typeof raw.rank === 'number' ? raw.rank : null,
    entry: raw.entry ?? null,
    message: raw.message,
    leaderboard: Array.isArray(raw.leaderboard) ? raw.leaderboard : [],
  };
};

export const scoreService = {
  getTopScores,
  submitScore,
};

