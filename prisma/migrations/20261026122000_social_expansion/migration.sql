-- Persistent social reactions, shares, and nested comment replies.
CREATE TYPE "ReactionType" AS ENUM ('like', 'love', 'celebrate', 'insightful');

CREATE TABLE "post_reactions" (
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL DEFAULT 'like',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("post_id", "user_id")
);

CREATE TABLE "post_shares" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_shares_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "comments" ADD COLUMN "parent_id" TEXT;

CREATE UNIQUE INDEX "post_shares_post_id_user_id_key" ON "post_shares"("post_id", "user_id");
CREATE INDEX "post_reactions_post_id_type_idx" ON "post_reactions"("post_id", "type");
CREATE INDEX "post_reactions_user_id_idx" ON "post_reactions"("user_id");
CREATE INDEX "post_shares_post_id_created_at_idx" ON "post_shares"("post_id", "created_at");
CREATE INDEX "comments_parent_id_created_at_idx" ON "comments"("parent_id", "created_at");

ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES "social_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES "social_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
