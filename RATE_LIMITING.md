# Rate Limiting Implementation

## Overview
This application now includes comprehensive rate limiting to prevent 429 (Too Many Requests) errors from the LLM API.

## Key Features

### 1. Automatic Rate Limiter
- **Location**: `src/lib/rate-limiter.ts`
- **Request Spacing**: Minimum 1.5 seconds between requests
- **Automatic Retries**: Up to 3 retries with exponential backoff (2s, 4s, 8s)
- **Queue Management**: Requests are queued and processed sequentially

### 2. Protected API Calls
All LLM API calls are now wrapped with the rate limiter:
- `src/lib/ai-agents.ts` - Trading signal generation
- `src/lib/unified-agent.ts` - Unified agent decisions and Q&A
- `src/lib/agent-communication.ts` - Agent-to-agent communication
- `src/lib/forecasting.ts` - Market forecasting and sentiment analysis

### 3. Enhanced Error Handling
- Specific detection of 429 errors
- User-friendly error messages
- Automatic retry with backoff
- Graceful fallbacks when rate limits are hit

### 4. UI Improvements
- Rate limit information displayed on Signals tab
- Auto-trading automatically disables on rate limit
- Reduced batch sizes (5 assets for signals, 3 for auto-trading)
- Clear toast notifications for rate limit events

## Usage Guidelines

### Best Practices
1. **Wait Between Operations**: Allow 30-60 seconds between large operations like:
   - Generating unified signals
   - Running agent communication
   - Generating forecasts

2. **Auto-Trading**: 
   - Now scans only 3 assets per cycle (reduced from 8)
   - Automatically pauses if rate limit is hit
   - Wait 1 minute before re-enabling after a rate limit

3. **Manual Signal Generation**:
   - Analyzes 5 assets per request (reduced from 10)
   - Shows clear progress and rate limit warnings

### What Changed
- ✅ All LLM calls now go through rate limiter
- ✅ Automatic retry on 429 errors (up to 3 attempts)
- ✅ Reduced concurrent requests
- ✅ Better error messages
- ✅ Auto-trading safety mechanisms
- ✅ Visual rate limit indicators

### Configuration
The rate limiter can be adjusted in `src/lib/rate-limiter.ts`:
```typescript
export const llmRateLimiter = new RateLimiter(
  1500,  // minDelay: milliseconds between requests
  3,     // maxRetries: number of retry attempts
  3000   // retryDelay: base delay for exponential backoff
)
```

## Testing
To verify rate limiting is working:
1. Enable multiple agents
2. Generate signals - should process slowly with 1.5s delays
3. Watch console for retry messages if rate limit is hit
4. Observe toast notifications for rate limit warnings

## Troubleshooting

### Still Getting 429 Errors?
1. Increase `minDelay` in rate-limiter.ts to 2000 or 3000ms
2. Reduce number of enabled agents
3. Disable auto-trading temporarily
4. Wait longer between manual operations

### Requests Taking Too Long?
- This is expected behavior - rate limiting adds delays
- Each request is spaced 1.5 seconds apart
- With 3 agents analyzing 5 assets = ~22.5 seconds minimum
- This prevents overwhelming the API

## Future Improvements
- [ ] Add request queue visualization
- [ ] Implement request prioritization
- [ ] Add configurable rate limits per user
- [ ] Cache LLM responses for repeated queries
- [ ] Implement request batching where possible
