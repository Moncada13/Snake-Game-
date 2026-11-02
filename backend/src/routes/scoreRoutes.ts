import { Router } from 'express';
import { ScoreService } from '../application/services/scoreService';
import { ScoreController } from '../presentation/controllers/scoreController';

export const createScoreRoutes = (scoreService?: ScoreService): Router => {
  const router = Router();
  const controller = new ScoreController(scoreService);

  router.get('/', controller.getTopScores);
  router.post('/', controller.submitScore);

  return router;
};

