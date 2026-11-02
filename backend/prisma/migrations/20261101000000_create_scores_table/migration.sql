-- CreateTable
CREATE TABLE "scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_name" VARCHAR(30) NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "scores_player_name_length_check" CHECK (char_length(btrim("player_name")) BETWEEN 1 AND 30),
    CONSTRAINT "scores_score_positive_multiple_check" CHECK ("score" > 0 AND "score" % 100 = 0)
);

-- CreateIndex
CREATE INDEX "idx_scores_leaderboard" ON "scores"("score" DESC, "created_at" ASC, "id" ASC);

