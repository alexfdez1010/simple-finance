-- Custom products no longer expose `quantity` in the UI or API; treat
-- every existing custom product as quantity 1 so totals match what the
-- contributions list shows. Yahoo products are unaffected.
UPDATE "financial_products"
SET "quantity" = 1
WHERE "type" = 'CUSTOM' AND "quantity" <> 1;
