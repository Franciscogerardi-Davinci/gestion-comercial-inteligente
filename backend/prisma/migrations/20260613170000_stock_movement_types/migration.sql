ALTER TYPE "StockMovementType" RENAME TO "StockMovementType_old";

CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

ALTER TABLE "StockMovement"
ALTER COLUMN "type" TYPE "StockMovementType"
USING (
  CASE
    WHEN "type"::text IN ('INITIAL', 'PURCHASE', 'RETURN', 'CANCELLATION') THEN 'IN'
    WHEN "type"::text = 'SALE' THEN 'OUT'
    ELSE 'ADJUSTMENT'
  END
)::"StockMovementType";

DROP TYPE "StockMovementType_old";
