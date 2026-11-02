import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import { ScoreService } from './application/services/scoreService';
import { createScoreRoutes } from './routes/scoreRoutes';

export const createApp = (scoreService?: ScoreService): Express => {
  const app = express();
  app.disable('x-powered-by');

  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.use('/api/scores', createScoreRoutes(scoreService));

  app.use(
    (
      err: Error & { status?: number; type?: string },
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
      if (
        (err instanceof SyntaxError && err.status === 400 && 'body' in err) ||
        err.type === 'entity.too.large' ||
        err.status === 413
      ) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid score submission payload',
          details: [
            err.type === 'entity.too.large' || err.status === 413
              ? 'Request payload exceeds 10kb limit'
              : 'Malformed JSON in request body',
          ],
        });
        return;
      }

      res.status(500).json({
        error: 'InternalServerError',
        message: 'An unexpected error occurred while processing the score',
      });
    }
  );

  return app;
};
