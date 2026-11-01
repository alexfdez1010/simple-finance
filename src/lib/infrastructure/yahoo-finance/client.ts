import YahooFinance from 'yahoo-finance2';

/** Creates a request-local Yahoo client; cookie/crumb fetch promises must never cross Worker requests. */
export function createYahooClient() {
  return new YahooFinance({ suppressNotices: ['yahooSurvey'] });
}
