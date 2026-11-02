import { Request, Response } from 'express';
import { ScoreService } from '../../application/services/scoreService';
import { validateCreateScorePayload } from '../../application/validator';
import { logger } from '../../infrastructure/logger';

export class ScoreController {
  private readonly scoreService: ScoreService;

  constructor(scoreService?: ScoreService) {
    this.scoreService = scoreService ?? new ScoreService();
  }

  public getTopScores = async (_req: Request, res: Response): Promise<void> => {
    try {
      const responseDto = await this.scoreService.getTopScores();
      res.status(200).json(responseDto);
    } catch (error) {
      logger.error('Failed to retrieve top scores', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'An unexpected error occurred while processing the score',
      });
    }
  };

  public submitScore = async (req: Request, res: Response): Promise<void> => {
    const validation = validateCreateScorePayload(req.body);
    if (!validation.valid || !validation.sanitized) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid score submission payload',
        details: validation.errors,
      });
      return;
    }

    try {
      const result = await this.scoreService.submitScore(validation.sanitized);
      const statusCode = result.saved ? 201 : 200;
      res.status(statusCode).json(result);
    } catch (error) {
      logger.error('Failed to submit score', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'An unexpected error occurred while processing the score',
      });
    }
  };
}

