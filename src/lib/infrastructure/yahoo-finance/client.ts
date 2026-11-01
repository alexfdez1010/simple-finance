import YahooFinance from 'yahoo-finance2';

/** Creates an isolated Yahoo client; v4 scopes queues/crumb promises to each instance for Workers. */
export function createYahooClient() {
  return new YahooFinance({ suppressNotices: ['yahooSurvey'] });
}
