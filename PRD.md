# Planning Guide

An advanced AI-powered autonomous trading simulator with multiple intelligent agents, comprehensive risk management, and professional-grade trading features using live Coinbase cryptocurrency data for realistic market simulation and AI-driven decision making.

**Experience Qualities**:
1. **Professional** - Enterprise-grade trading interface with advanced features like leverage, stop-loss/take-profit automation, and multi-agent coordination
2. **Intelligent** - AI agents make autonomous trading decisions with 70%+ confidence thresholds, analyzing thousands of parameters including technical indicators, market sentiment, and risk metrics
3. **Educational** - Transparent AI reasoning and comprehensive trade journaling help users understand sophisticated trading strategies and risk management principles

**Complexity Level**: Complex Application (advanced functionality, accounts)
  - Multi-agent AI system with autonomous trading, leverage support, dynamic risk management, comprehensive analytics, persistent state across sessions, and professional trading journal with performance metrics

## Essential Features

### Unified Auto-Trading Mode
- **Functionality**: One-click toggle to enable fully autonomous trading where all enabled AI agents work together to scan markets, reach consensus, and execute trades automatically every 90 seconds with no human intervention required
- **Purpose**: Enable true hands-free algorithmic trading simulation where users can observe AI agents making real trading decisions autonomously based on collective intelligence
- **Trigger**: User toggles auto-trading switch in Unified tab
- **Progression**: Enable switch → System validates agents are enabled and drawdown <15% → Agents begin scanning top 8 assets every 90 seconds → Each asset analyzed by all agents → Consensus calculated → If consensus ≥70% confidence and unanimous recommendation to execute → Trade executed automatically → User notified → Repeat continuously until disabled or drawdown limit hit
- **Success criteria**: Auto-trading executes trades without intervention, respects 70% confidence threshold, automatically stops at 15% drawdown, shows real-time status indicators, logs all automated decisions

### Multi-Agent AI Trading System
- **Functionality**: Create and manage multiple independent AI trading agents, each with unique models (GPT-4o, GPT-4o-mini, DeepSeek, Qwen), trading modes (conservative/moderate/aggressive), risk parameters, and inter-agent communication capabilities
- **Purpose**: Enable comparison of different AI models and strategies, allowing users to discover which approaches work best in various market conditions through agent collaboration and consensus building
- **Trigger**: User creates agent via agent manager interface
- **Progression**: Configure agent parameters → Select AI model and trading mode → Enable agent communication → Set leverage and risk limits → Enable agent → Agent analyzes markets → Communicates with other agents → Generates trading signals with 70%+ confidence → Executes trades automatically or presents for approval
- **Success criteria**: Agent generates signals within 30 seconds, maintains confidence threshold above 70%, adapts strategy based on performance, successfully communicates with other agents

### Agent Communication & Consensus Building
- **Functionality**: AI agents can discuss trading opportunities with each other, share analysis, debate strategies, and reach consensus before executing trades
- **Purpose**: Demonstrate multi-agent collaboration and collective intelligence, reducing individual bias and improving decision quality
- **Trigger**: User initiates discussion in Communication tab or agent identifies opportunity
- **Progression**: Agent A proposes trade → Broadcasts to other agents → Each agent analyzes and responds with agreement/disagreement → System synthesizes consensus → Displays full conversation → Executes if consensus reached
- **Success criteria**: Agents exchange messages within 10 seconds, responses show unique perspectives, consensus summary reflects group sentiment, full conversation logged

### Custom Trading Pairs
- **Functionality**: Users can add custom cryptocurrency pairs from Coinbase beyond the default 30, enabling tracking and trading of emerging coins like meme coins or new listings
- **Purpose**: Give users flexibility to trade their preferred assets and test strategies on different market segments
- **Trigger**: User clicks "Add Pair" in Custom Pairs tab
- **Progression**: Enter symbol (e.g., PEPE) → Enter full name → Enter Coinbase pair format (PEPE-USD) → System validates pair exists → Fetches live price → Adds to asset list → Enables for trading
- **Success criteria**: Custom pairs validate before adding, fetch real Coinbase prices, integrate seamlessly with existing trading system, persist across sessions

### Autonomous Position Management
- **Functionality**: AI agents automatically open/close long and short positions with configurable leverage (1-10x), dynamically set stop-loss and take-profit levels based on volatility and risk/reward ratios
- **Purpose**: Demonstrate professional trading automation with proper risk management and position sizing
- **Trigger**: Agent identifies high-confidence trading opportunity
- **Progression**: Analyze asset → Calculate optimal position size → Determine entry price → Set dynamic SL/TP based on volatility → Execute trade → Monitor position → Close when SL/TP hit or conditions change
- **Success criteria**: Positions automatically close at SL/TP levels, leverage never exceeds configured maximum, position sizing respects portfolio limits

### Intelligent Risk Management
- **Functionality**: Real-time monitoring of drawdown, portfolio exposure, leverage usage with automatic safeguards including drawdown shield (pauses trading at >15% loss), volatility monitor, and session cooldown
- **Purpose**: Protect users from catastrophic losses and teach proper risk management principles
- **Trigger**: Continuous monitoring of all portfolio metrics
- **Progression**: Monitor positions → Calculate real-time drawdown → Check leverage limits → Evaluate volatility → Trigger alerts if thresholds breached → Automatically reduce risk or pause trading if critical levels reached
- **Success criteria**: Trading pauses automatically at 15% drawdown, alerts display at 10% drawdown, leverage limits enforced, position sizes reduced during high volatility

### Multi-Model Analysis Environment
- **Functionality**: Coordinate multiple AI models where each analyzes different aspects (news sentiment, technical indicators, risk management) and results are combined into consensus trading decisions
- **Purpose**: Demonstrate ensemble AI decision-making and show how different models complement each other
- **Trigger**: User enables multiple agents for same asset
- **Progression**: Model A analyzes sentiment → Model B evaluates technical indicators → Model C assesses risk → System aggregates confidence scores → Generates consensus signal only if majority agree and average confidence >70%
- **Success criteria**: Multi-model signals show combined reasoning, confidence reflects consensus strength, decisions only made when models align

### AI Strategy Auto-Adjustment
- **Functionality**: System automatically adjusts agent parameters based on performance - reduces leverage after losses, increases position limits after wins, switches strategies based on market conditions
- **Purpose**: Show adaptive AI that learns from results and improves over time
- **Trigger**: After each trade completion or every 10 trades
- **Progression**: Analyze recent performance → Calculate win rate → Assess drawdown → Adjust leverage if win rate <40% → Reduce position sizes if drawdown >10% → Increase limits if performance strong → Save updated config
- **Success criteria**: Leverage automatically reduces after 3+ consecutive losses, increases after 5+ wins with <5% drawdown

### Comprehensive Trade Journal
- **Functionality**: Detailed logging of every trade with entry/exit signals, AI reasoning, P&L analysis, performance metrics including win rate, average P&L, total volume, Sharpe ratio
- **Purpose**: Enable thorough analysis of trading performance and strategy effectiveness
- **Trigger**: After each trade execution
- **Progression**: Log trade details → Record AI reasoning → Calculate P&L on close → Update performance statistics → Display in sortable table → Generate analytics charts
- **Success criteria**: All trades logged with full details, statistics update in real-time, journal persists across sessions, shows per-agent performance

### Real-Time Notifications
- **Functionality**: Desktop notifications for trade execution, position closes, drawdown alerts, and daily P&L summaries
- **Purpose**: Keep users informed of important trading events without constant monitoring
- **Trigger**: Significant trading events occur
- **Progression**: Event occurs → Check notification settings → Format message → Display toast notification → Show desktop notification if enabled → Log to notification history
- **Success criteria**: Notifications appear within 1 second of event, include relevant details, respect user preferences

### Live Market Data Integration
- **Functionality**: Real-time price feeds from Coinbase API for 30 major cryptocurrencies, updating every 30 seconds with automatic price history tracking
- **Purpose**: Provide realistic market conditions for AI agent training and evaluation
- **Trigger**: App initialization and periodic updates
- **Progression**: Load app → Fetch Coinbase spot prices → Initialize 60-period price history → Update every 30s → Calculate volatility → Update all positions with current prices → Trigger SL/TP checks
- **Success criteria**: Prices update smoothly without lag, all 30 assets show real data, volatility calculations accurate

## Edge Case Handling

- **Insufficient Funds for Leverage**: Validate available cash against leveraged position cost, show clear error with required vs available amounts
- **Drawdown Limit Exceeded**: Automatically pause all AI trading when drawdown reaches 15%, require manual reset, show prominent warning
- **Extreme Leverage Request**: Cap all leverage at 10x maximum regardless of agent configuration, warn users about risk
- **Conflicting Signals**: When multiple agents suggest opposite actions, show both signals with reasoning, let user choose or require >70% consensus
- **API Rate Limits**: Implement request throttling for AI calls, queue signals if rate limited, show warning to user
- **Stale Price Data**: If prices haven't updated in 2+ minutes, show warning banner, pause auto-trading until fresh data received
- **Position Size Too Large**: Enforce maximum 50% of portfolio in single position, reduce quantity automatically if exceeded
- **Network Errors**: Gracefully handle API failures, retry with exponential backoff, show user-friendly error messages
- **Agent Configuration Errors**: Validate all parameters before saving, prevent invalid combinations like 0% stop-loss with 10x leverage

## Design Direction

The design should feel like a native system application with OS-level styling - clean, minimal, and professional like macOS or Windows native apps. Interface elements should use system-style components with subtle shadows, native-feeling buttons, and a modern glass-effect aesthetic that emphasizes clarity and usability. A compact interface serves the complex functionality with condensed spacing while maintaining visual hierarchy and readability.

## Color Selection

Custom palette - A clean, native system-style aesthetic with emphasis on clarity, subtle accents, and professional appearance similar to macOS or Windows system applications.

- **Primary Color**: System blue (oklch(0.52 0.14 252)) communicates interactivity and calls-to-action like native OS buttons
- **Secondary Colors**: Light gray (oklch(0.93 0.005 264)) for subtle backgrounds and inactive elements
- **Accent Color**: System blue (oklch(0.52 0.14 252)) highlights active elements and important interactions
- **Success (Profit/Long)**: System green (oklch(0.55 0.15 145)) for positive P&L, buy signals, and long positions
- **Destructive (Loss/Short)**: System red (oklch(0.58 0.20 25)) for losses, sell signals, short positions, and destructive actions
- **Foreground/Background Pairings**:
  - Background (Light gray oklch(0.95 0.002 264)): Dark text (oklch(0.15 0.01 264)) - Ratio 13.5:1 ✓
  - Card (Off-white oklch(0.99 0.001 264)): Dark text (oklch(0.15 0.01 264)) - Ratio 14.8:1 ✓
  - Primary (System blue oklch(0.52 0.14 252)): White text (oklch(0.99 0 0)) - Ratio 6.2:1 ✓
  - Accent (System blue oklch(0.52 0.14 252)): White text (oklch(0.99 0 0)) - Ratio 6.2:1 ✓
  - Success (Green oklch(0.55 0.15 145)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓
  - Destructive (Red oklch(0.58 0.20 25)): White text (oklch(1 0 0)) - Ratio 5.1:1 ✓

## Font Selection

Typography should convey clarity and readability using native system fonts for maximum familiarity and performance, with the standard system font stack (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto) that adapts to each operating system.

- **Typographic Hierarchy**:
  - H1 (Page Title): System font Semibold/14px/tight letter spacing/leading-tight
  - H2 (Section Headers): System font Semibold/16px/normal spacing/leading-snug  
  - H3 (Panel Headers): System font Semibold/14px/normal spacing/leading-snug
  - Body (Primary Content): System font Regular/13px/normal spacing/leading-normal (1.5)
  - Small (Metadata/Labels): System font Medium/12px/normal spacing/leading-normal
  - Tiny (Fine Print): System font Regular/11px/normal spacing/leading-tight
  - Mono/Numbers (Prices/Metrics): System font Regular/13px with font-feature-settings 'tnum', 'lnum' for tabular alignment

## Animations

Animations should feel snappy and responsive like native system applications, with quick state transitions that confirm actions without delays or elaborate motion.

- **Purposeful Meaning**: Minimal animations emphasize interactions - button press (scale), hover states (subtle brightness), and state changes (quick fade) that match native OS behavior
- **Hierarchy of Movement**: 
  - Critical: Button presses (150ms scale 0.98), modal appearances (200ms fade)
  - Secondary: Price updates (quick number transitions), tab switches (150ms fade)
  - Subtle: Button hovers (100ms brightness), card hovers (150ms shadow increase)
  - Continuous: Loading states (smooth spinner), real-time metrics (instant updates)

## Component Selection

- **Components**:
  - Card: Primary container for agent configs, portfolio summary, risk metrics, signal panels
  - Button: Trade execution (primary), signal generation (accent), agent controls (secondary)
  - Badge: Agent status, position types (long/short), confidence levels, win rates
  - Table: Trade journal with sortable columns, position details, agent performance
  - Tabs: Navigate between Agents, Signals, Risk, Trade, Journal, Forecast views
  - Dialog: Agent creation wizard, portfolio reset confirmation, trade execution dialogs
  - Progress: Drawdown visualization, exposure levels, loading states
  - Slider: Agent parameter configuration (leverage, position size, SL/TP percentages)
  - Select: AI model selection, trading mode, asset pickers
  - Switch: Enable/disable agents, toggle auto-trading, notification preferences
  - Alert: Risk warnings (drawdown), system notifications, agent status changes
  - ScrollArea: Trade history, signal lists, asset grids
  
- **Customizations**:
  - Agent status cards with live performance metrics and confidence gauges
  - Signal cards with expandable reasoning and one-click execution
  - Multi-metric dashboard panels showing drawdown, leverage, exposure simultaneously
  - Live P&L numbers with smooth countup animations and color transitions
  - Risk gauge visualization showing safe/warning/critical zones
  - Agent performance heatmap comparing model effectiveness
  
- **States**:
  - Buttons: Default (solid), hover (brightness +10%), active (scale 0.95), disabled (opacity 50%), loading (spinner)
  - Agent cards: Active (accent border), inactive (muted), generating signal (pulse animation), error (red border)
  - Signals: High confidence (green accent), medium (blue), executing (animated), executed (dimmed)
  - Risk levels: Safe (green indicators), Warning (amber pulse), Critical (red shake + lock icon)
  
- **Icon Selection**:
  - Robot: AI agents and autonomous features
  - Chats: Agent communication and discussions
  - Coin: Custom trading pairs and asset management
  - Lightning: Signal generation and quick actions
  - Shield: Risk management and protection features
  - TrendUp/Down: Market direction, long/short positions, buy/sell
  - ChartLine: Analytics, forecasting, technical analysis
  - Wallet: Portfolio and cash management
  - BookOpen: Trade journal and documentation
  - Warning: Risk alerts and drawdown notifications
  - CheckCircle: Successful operations and confirmations
  - ThumbsUp/Down: Agent agreement/disagreement in discussions
  - ArrowRight: Message flow and communication paths
  - Plus: Add new agents, pairs, or positions
  - Trash: Delete agents, pairs, or positions
  - Clock: Trade history and timestamps
  - Spinner: Loading and processing states
  
- **Spacing**:
  - Page sections: gap-4 to gap-6 (16-24px) for major separations
  - Panel padding: p-4 (16px) for card interiors
  - Component groups: gap-3 (12px) for related elements
  - Inline elements: gap-1.5 to gap-2 (6-8px) for tight groupings
  - Data grids: gap-3 (12px) for metric displays
  
- **Mobile**:
  - Stack all panels vertically with full-width layout
  - Collapse agent cards into accordion style with key metrics visible
  - Simplify signal cards to show only essential info, expandable for details
  - Bottom sheet for trade execution and agent configuration
  - Horizontal scroll for tabs with indicators
  - Reduce chart heights to 200px on mobile
  - Single-column asset grid with larger touch targets
  - Sticky header with condensed metrics
  - Hamburger menu for secondary navigation
