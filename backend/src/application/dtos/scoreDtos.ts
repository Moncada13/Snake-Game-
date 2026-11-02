export interface CreateScoreRequestDTO {
  playerName: string;
  score: number;
}

export interface ScoreItemDTO {
  id: string;
  rank: number;
  playerName: string;
  score: number;
  createdAt: string;
}

export interface GetScoresResponseDTO {
  data: ScoreItemDTO[];
}

export interface SubmitScoreResponseDTO {
  saved: boolean;
  rank: number | null;
  entry: ScoreItemDTO | null;
  message?: string;
  leaderboard: ScoreItemDTO[];
}

export interface ValidationErrorResponseDTO {
  error: 'ValidationError';
  message: string;
  details: string[];
}

export interface InternalErrorResponseDTO {
  error: 'InternalServerError';
  message: string;
}

