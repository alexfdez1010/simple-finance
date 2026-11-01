-- CreateIndex
CREATE INDEX "oauthRefreshToken_authorizationCodeId_idx" ON "oauthRefreshToken"("authorizationCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "oauthRefreshToken_token_key" ON "oauthRefreshToken"("token");

-- CreateIndex
CREATE INDEX "oauthAccessToken_clientId_idx" ON "oauthAccessToken"("clientId");

-- CreateIndex
CREATE INDEX "oauthAccessToken_sessionId_idx" ON "oauthAccessToken"("sessionId");

-- CreateIndex
CREATE INDEX "oauthAccessToken_userId_idx" ON "oauthAccessToken"("userId");

-- CreateIndex
CREATE INDEX "oauthAccessToken_authorizationCodeId_idx" ON "oauthAccessToken"("authorizationCodeId");

-- CreateIndex
CREATE INDEX "oauthAccessToken_refreshId_idx" ON "oauthAccessToken"("refreshId");

-- CreateIndex
CREATE UNIQUE INDEX "oauthAccessToken_token_key" ON "oauthAccessToken"("token");

-- CreateIndex
CREATE INDEX "oauthConsent_clientId_idx" ON "oauthConsent"("clientId");

-- CreateIndex
CREATE INDEX "oauthConsent_userId_idx" ON "oauthConsent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rateLimit_key_key" ON "rateLimit"("key");

-- CreateIndex
CREATE INDEX "financial_products_type_idx" ON "financial_products"("type");

-- CreateIndex
CREATE INDEX "financial_products_assetCategory_idx" ON "financial_products"("assetCategory");

-- CreateIndex
CREATE UNIQUE INDEX "yahoo_finance_data_productId_key" ON "yahoo_finance_data"("productId");

-- CreateIndex
CREATE INDEX "yahoo_finance_data_symbol_idx" ON "yahoo_finance_data"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "custom_product_data_productId_key" ON "custom_product_data"("productId");

-- CreateIndex
CREATE INDEX "custom_product_contributions_customProductDataId_date_idx" ON "custom_product_contributions"("customProductDataId", "date");

-- CreateIndex
CREATE INDEX "product_snapshots_productId_idx" ON "product_snapshots"("productId");

-- CreateIndex
CREATE INDEX "product_snapshots_date_idx" ON "product_snapshots"("date");

-- CreateIndex
CREATE UNIQUE INDEX "product_snapshots_productId_date_key" ON "product_snapshots"("productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_snapshots_date_key" ON "portfolio_snapshots"("date");

-- CreateIndex
CREATE INDEX "portfolio_snapshots_date_idx" ON "portfolio_snapshots"("date");

-- Keep registration closed permanently, including after user deletion.
CREATE TRIGGER single_owner_before_insert
BEFORE INSERT ON "user"
WHEN EXISTS (SELECT 1 FROM owner_registration)
BEGIN
  SELECT RAISE(ABORT, 'Registration is closed');
END;

CREATE TRIGGER single_owner_after_insert
AFTER INSERT ON "user"
BEGIN
  INSERT INTO owner_registration (id) VALUES (1);
END;
