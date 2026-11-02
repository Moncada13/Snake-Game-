import { RankedScore } from '../../domain/models/Score';
import { IScoreRepository } from '../../domain/repositories/IScoreRepository';
import { PrismaScoreRepository } from '../../infrastructure/repositories/PrismaScoreRepository';
import {
  CreateScoreRequestDTO,
  GetScoresResponseDTO,
  ScoreItemDTO,
  SubmitScoreResponseDTO,
} from '../dtos/scoreDtos';

export class ScoreService {
  private readonly scoreRepository: IScoreRepository;

  constructor(scoreRepository?: IScoreRepository) {
    this.scoreRepository = scoreRepository ?? new PrismaScoreRepository();
  }

  private static toScoreItemDTO(item: RankedScore): ScoreItemDTO {
    return {
      id: item.id,
      rank: item.rank,
      playerName: item.playerName,
      score: item.score,
      createdAt: item.createdAt.toISOString(),
    };
  }

  public async getTopScores(): Promise<GetScoresResponseDTO> {
    const topScores = await this.scoreRepository.getTopScores();
    return {
      data: topScores.map(ScoreService.toScoreItemDTO),
    };
  }

  public async submitScore(
    payload: CreateScoreRequestDTO
  ): Promise<SubmitScoreResponseDTO> {
    const result = await this.scoreRepository.saveIfTopFive(
      payload.playerName,
      payload.score
    );

    const leaderboard = result.leaderboard.map(ScoreService.toScoreItemDTO);

    if (!result.saved || !result.entry) {
      return {
        saved: false,
        rank: null,
        entry: null,
        message: 'Score does not qualify for Top 5',
        leaderboard,
      };
    }

    return {
      saved: true,
      rank: result.rank,
      entry: ScoreService.toScoreItemDTO(result.entry),
      leaderboard,
    };
  }
}

