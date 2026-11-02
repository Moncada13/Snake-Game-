import { RankedScore, SaveScoreResult } from '../models/Score';

export interface IScoreRepository {
  getTopScores(): Promise<RankedScore[]>;
  saveIfTopFive(playerName: string, score: number): Promise<SaveScoreResult>;
}

