# Planning Guide

An AI-powered trading simulator that helps users learn trading strategies through live Coinbase cryptocurrency data, AI forecasting, and paper trading, providing a safe educational environment to understand market patterns and real-time decision-making.

**Experience Qualities**:
1. **Educational** - Emphasizes learning and understanding rather than gambling, with clear explanations of forecasting methods and outcomes
2. **Analytical** - Data-driven interface with charts, metrics, and AI-generated insights that help users understand market patterns
3. **Confidence-building** - Progressive complexity that starts simple and reveals advanced features as users gain experience

**Complexity Level**: Light Application (multiple features with basic state)
  - Core features include AI forecasting, simulated portfolio management, and trade execution with persistent state, but without complex authentication or real financial integration

## Essential Features

### AI Price Forecasting
- **Functionality**: Generates short-term price predictions for selected assets using AI pattern analysis
- **Purpose**: Helps users understand predictive modeling and its limitations in trading
- **Trigger**: User selects an asset and requests forecast
- **Progression**: Select asset → Request forecast → AI analyzes patterns → Display prediction chart with confidence intervals → Show reasoning
- **Success criteria**: Forecast displays within 3 seconds with visual chart and explanation

### Simulated Portfolio Management
- **Functionality**: Track virtual portfolio with starting balance, positions, and performance metrics
- **Purpose**: Lets users practice position sizing and risk management without real money
- **Trigger**: App initialization or manual portfolio reset
- **Progression**: Start with $10,000 virtual cash → View current holdings → Monitor total portfolio value → Track profit/loss
- **Success criteria**: Portfolio updates immediately after trades, persists between sessions

### Paper Trading Execution
- **Functionality**: Execute simulated buy/sell orders at current market prices
- **Purpose**: Practice trade execution and understand order flow
- **Trigger**: User clicks buy/sell after selecting asset and quantity
- **Progression**: Select asset → Enter quantity → Preview order → Confirm → Execute at simulated price → Update portfolio → Show confirmation
- **Success criteria**: Trade executes instantly, portfolio reflects new position, transaction history updates

### Trade History & Analytics
- **Functionality**: Display all past trades with performance metrics
- **Purpose**: Help users learn from their trading decisions
- **Trigger**: User navigates to history view
- **Progression**: View trade list → Filter by asset/date → See entry/exit prices → Calculate profit/loss → Identify patterns
- **Success criteria**: Shows all trades with accurate P&L calculations

### Market Simulator
- **Functionality**: Fetches live cryptocurrency prices from Coinbase API for Bitcoin, Ethereum, Solana, and Dogecoin
- **Purpose**: Creates real-world trading environment with actual market data
- **Trigger**: Initial page load and automatic updates every 30 seconds
- **Progression**: Load app → Fetch Coinbase spot prices → Initialize price history → Update prices every 30s → Reflect changes in portfolio
- **Success criteria**: Prices display within 3 seconds, update smoothly, show real market movements

## Edge Case Handling

- **Insufficient Funds**: Prevent buy orders that exceed available cash, show clear error message with current balance
- **Zero/Negative Quantity**: Validate order quantity is positive number before allowing submission
- **Selling Unowned Assets**: Check holdings before allowing sell orders, prevent short selling
- **Extreme AI Predictions**: Cap forecast confidence at reasonable levels, show uncertainty when patterns are unclear
- **Portfolio Reset**: Confirm before clearing all positions and resetting to starting balance
- **Rapid Trading**: Debounce trade buttons to prevent accidental double-submissions

## Design Direction

The design should feel professional and analytical like a modern fintech platform, with a data-focused interface that emphasizes clarity and precision. A minimal interface serves the analytical purpose, letting charts and metrics take center stage while maintaining clean typography and generous whitespace for focus.

## Color Selection

Custom palette - A professional financial dashboard aesthetic with emphasis on data visualization clarity and trust-building elements.

- **Primary Color**: Deep navy blue (oklch(0.25 0.05 250)) communicates stability, trust, and professionalism associated with financial platforms
- **Secondary Colors**: Cool slate gray (oklch(0.45 0.02 240)) for secondary UI elements and neutral backgrounds
- **Accent Color**: Vibrant cyan (oklch(0.65 0.15 210)) for interactive elements, highlights, and positive growth indicators
- **Foreground/Background Pairings**:
  - Background (Soft white oklch(0.98 0 0)): Dark navy text (oklch(0.2 0.05 250)) - Ratio 11.2:1 ✓
  - Card (Pure white oklch(1 0 0)): Navy text (oklch(0.25 0.05 250)) - Ratio 9.8:1 ✓
  - Primary (Deep navy oklch(0.25 0.05 250)): White text (oklch(1 0 0)) - Ratio 9.8:1 ✓
  - Accent (Vibrant cyan oklch(0.65 0.15 210)): White text (oklch(1 0 0)) - Ratio 4.6:1 ✓
  - Muted (Light gray oklch(0.95 0.005 240)): Slate text (oklch(0.45 0.02 240)) - Ratio 6.2:1 ✓
  - Success/Profit (Green oklch(0.55 0.15 145)): White text - Ratio 4.8:1 ✓
  - Destructive/Loss (Red oklch(0.55 0.20 25)): White text - Ratio 4.9:1 ✓

## Font Selection

Typography should convey precision, modernity, and readability at various sizes, using Inter for its excellent screen legibility and professional appearance suitable for financial data display.

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter Bold/32px/tight letter spacing (-0.02em)/leading-none
  - H2 (Section Headers): Inter Semibold/24px/tight letter spacing (-0.01em)/leading-tight
  - H3 (Card Headers): Inter Semibold/18px/normal spacing/leading-snug
  - Body (Primary Content): Inter Regular/15px/normal spacing/leading-relaxed (1.6)
  - Small (Metadata/Labels): Inter Medium/13px/wide letter spacing (0.01em)/leading-normal
  - Mono (Numbers/Prices): Inter Regular/15px/tabular numbers for alignment

## Animations

Animations should feel precise and purposeful like a professional trading terminal, with quick, responsive micro-interactions that confirm actions without distracting from data analysis.

- **Purposeful Meaning**: Smooth transitions emphasize state changes (portfolio updates, trade execution) while maintaining focus on real-time data
- **Hierarchy of Movement**: 
  - Critical: Trade confirmation animations and price update pulses
  - Secondary: Chart transitions and forecast reveals
  - Subtle: Hover states on interactive elements and number counters

## Component Selection

- **Components**:
  - Card: Primary container for portfolio summary, asset panels, and trade forms
  - Button: Trade execution (primary), secondary actions (cancel, reset)
  - Input: Quantity entry with number validation
  - Select: Asset selection dropdown
  - Tabs: Switch between Portfolio, Trade, History, and Forecast views
  - Table: Trade history display with sortable columns
  - Dialog: Trade confirmation and portfolio reset warnings
  - Badge: Position status indicators (long, profit, loss)
  - Progress: Loading states for AI forecasts
  - Separator: Visual division between sections
  
- **Customizations**:
  - Custom chart component using D3 for price history and forecasts
  - Animated number component for portfolio value updates
  - Custom asset card with real-time price display
  - Profit/loss indicator with color-coded arrows
  
- **States**:
  - Buttons: Default navy, hover with brightness increase, active with scale-down, disabled with opacity
  - Inputs: Default with subtle border, focus with accent ring, error with red border
  - Cards: Default white, hover with subtle shadow increase for interactive cards
  
- **Icon Selection**:
  - TrendUp/TrendDown: Market movements and profit/loss
  - ArrowUp/ArrowDown: Buy/sell actions
  - ChartLine: Forecasting and analytics
  - Wallet: Portfolio view
  - Clock: Trade history
  - Info: Educational tooltips
  - Sparkle: AI forecast indicator
  
- **Spacing**:
  - Section gaps: gap-8 (32px)
  - Card padding: p-6 (24px)
  - Component groups: gap-4 (16px)
  - Inline elements: gap-2 (8px)
  
- **Mobile**:
  - Stack navigation tabs vertically on mobile
  - Reduce chart height on small screens
  - Single column layout for asset cards
  - Bottom sheet for trade forms on mobile
  - Simplified table view with key columns only
