# NFL General Manager Simulator - Game Scope Document

**Version:** 1.0  
**Date:** November 16, 2025  
**Project Vision:** Create the most authentic and realistic NFL General Manager simulation experience available

---

## 1. Executive Summary

### 1.1 Vision Statement

This NFL GM Simulator delivers an uncompromising simulation of professional football team management, prioritizing strategic depth and authentic decision-making over simplified gameplay or visual spectacle. Players assume the dual role of Owner/General Manager, experiencing the full complexity of building, maintaining, and rebuilding NFL franchises across multi-decade careers.

Success is measured not by arcade-style engagement, but by the player's ability to navigate the intricate web of salary cap mechanics, personnel evaluation, staff management, and long-term strategic planning that defines real NFL front office operations.

### 1.2 Core Design Pillars

**Authenticity Over Accessibility**
- Realistic salary cap mechanics including proration, dead money, restructures, and void years
- Accurate free agency rules (RFA/UFA, franchise tags, qualifying offers, compensation picks)
- True-to-life contract negotiation where players can reject or counter offers
- Public contract information vs hidden scouting intelligence (mirrors real NFL information asymmetry)

**Strategic Depth Through Staff Management**
- Scout quality directly impacts information accuracy
- Coach quality affects player development rates and schemes
- Multi-year hiring/firing decisions with lasting consequences
- Staff salaries impact team profitability but not player salary cap

**The "GM Workbench" Philosophy**
- Comprehensive analytical tools for scenario modeling
- "What-if" calculators showing cap implications of every move
- Separation between analysis tools and actual execution (modeling vs reality)
- Powerful sorting, filtering, and comparison capabilities

**Career Legacy & Long-Term Play**
- 20+ year career tracking across multiple teams
- Performance-based hiring and firing
- Reputation system affecting negotiations and opportunities
- Historical tracking of draft picks, team records, and achievements

**Meaningful Automation Options**
- Players choose their level of micromanagement
- Delegate depth charts and injury management to coaching staff (optional)
- Focus on strategic decisions vs tactical minutiae
- Automation presented as "trusting your staff" for immersion

### 1.3 What Sets This Apart

Unlike existing GM simulators that simplify cap management or automate negotiations, this simulation embraces complexity as a feature. The player must genuinely understand cap mechanics, evaluate incomplete scouting reports, balance short-term competitiveness with long-term sustainability, and build organizational infrastructure through smart hiring.

The game respects the player's intelligence by providing powerful tools without holding their hand, creating genuine strategic dilemmas rather than obvious optimal choices.

---

## 2. Player Experience & Core Game Loop

### 2.1 Career Start Options

Players begin their GM career through one of two modes:

**Mode 1: Fantasy Draft (Clean Slate)**
- All 32 teams start with equal salary cap space
- Snake draft format selecting from all NFL players
- Ideal for learning mechanics without inherited constraints
- Balanced competitive landscape
- No existing contracts or dead money

**Mode 2: Real-World Takeover**
- Select any NFL team with their actual current roster
- Inherit real contracts, cap situations, and draft pick commitments
- Accurate representation of each team's current state (requires research/data import)
- Varying difficulty based on team situation (contender vs rebuild)
- Immediate strategic challenges from Day 1

### 2.2 Annual Season Flow

Each season follows the NFL calendar with distinct phases:

**Phase 1: Post-Season (January - February)**
- Review season performance and statistics
- Evaluate coaching staff performance
- Make coaching staff hiring/firing decisions
- Scout evaluation and potential staff changes
- Receive owner performance review (job security update)

**Phase 2: Pre-Free Agency (February - Early March)**
- Franchise tag deadline (one player designation)
- Transition tag consideration
- RFA tender decisions (compensation levels)
- Contract extension negotiations with current players
- Salary cap compliance preparation
- Cut/trade/restructure decisions to create cap space
- Use "Cap Laboratory" to model scenarios

**Phase 3: Free Agency (March 12 - April)**
- Two-day negotiating window (UFA only, March 10-12)
- Free agency opens (March 12, 4:00 PM ET)
- UFA signings (no draft compensation)
- RFA offer sheets (right of first refusal, possible compensation)
- Monitor AI team moves and market dynamics
- Contract negotiations with player counters/rejections

**Phase 4: Pre-Draft (March - April)**
- College scouting reports compilation
- Scout accuracy varies by scout quality
- Combine attendance (optional player interviews)
- Draft board construction
- Trade negotiation for draft picks
- Mock draft projections (AI team boards hidden)

**Phase 5: NFL Draft (Late April)**
- 7 rounds over 3 days
- Real-time draft board updates
- Trade proposals during draft
- BPA vs need decisions
- Rookie contract slotting (predetermined by pick)

**Phase 6: Post-Draft (May - July)**
- UDFA signings
- Veteran UFA signings (if tendered by old team, exclusive until July 22)
- Voluntary OTAs and minicamp (player development begins)
- Depth chart initial construction (manual or auto)
- Preseason preparation

**Phase 7: Training Camp & Preseason (August)**
- Position battles for depth chart
- Roster cuts to 53 players
- Practice squad formation (16 players)
- Injury updates (first exposure to hidden injury risks)
- Final roster decisions

**Phase 8: Regular Season (September - January)**
- Weekly game simulation (18 games)
- Depth chart management (manual or delegated)
- Injury management (manual or delegated)
- In-season free agent signings (street free agents, other teams' cuts)
- Waiver wire claims (priority order)
- Trade deadline (Week 9)
- Playoff qualification and seeding
- Optional: Visual game playback or instant simulation

**Phase 9: Playoffs (January)**
- Wild Card, Divisional, Championship rounds
- Super Bowl
- Game simulation with injury implications for next season

### 2.3 Core Gameplay Loop (Week-to-Week)

During the regular season, a typical week involves:

1. **Review previous game results** - Stats, injuries, performance grades
2. **Injury report assessment** - Severity, timeline, IR decisions
3. **Depth chart adjustments** - Cover injuries, optimize matchups (optional)
4. **Practice squad management** - Elevations, signings from other teams
5. **Prepare for next opponent** - AI handles game planning (player sees confidence metrics)
6. **Simulate game** - Choose visual playback or instant results
7. **Post-game analysis** - Player development tracking, staff performance

### 2.4 Career Progression & Job Security

**Performance Metrics:**
- Win-loss record (weighted by expectations)
- Playoff appearances and success
- Draft pick success rate (Pro Bowls, All-Pros, longevity)
- Cap management efficiency
- Roster value vs cap spend
- Fan satisfaction (tied to performance and star players)
- Owner satisfaction (profitability + performance)

**Career Events:**
- Annual owner review (January)
- Contract extension offers (if performing well)
- Hot seat warnings (if underperforming)
- Firing (poor performance, immediate or end-of-season)
- Job offers from other teams (if available and you have good reputation)
- Resignation option (leave for better opportunity)
- Retirement (after reaching career milestones)

**Legacy Tracking:**
- Total seasons as GM
- Teams managed
- Overall record with each team
- Playoff appearances and championships
- Hall of Fame players drafted
- Pro Bowl selections drafted
- Draft bust rate
- Cap management rating
- Executive of the Year awards
- Hall of Fame candidacy (for GM)

---

## 3. Core Systems - Deep Dive

### 3.0 Rating System Philosophy

**All player, coach, and scout ratings use a Madden-style 54-99 scale for consistency and familiarity.**

**Rating Distribution:**
- **54-59:** Not NFL caliber / Very poor staff (practice squad bubble, replacement level)
- **60-69:** Below average players / Below average staff (depth pieces, backup quality)
- **70-76:** Average players / Average staff (solid starters, league average around 72-73)
- **77-84:** Above average / Good staff (quality starters, impact players)
- **85-89:** Pro Bowl caliber / Elite staff (difference makers, top tier at position)
- **90-99:** Superstars / Legendary staff (MVP candidates, All-Pros, Hall of Fame trajectory)

**Target Distribution in Game:**
- Majority of NFL players: 68-85 overall rating
- Elite players (85+): Approximately 15-20% of league
- Superstar tier (90+): Approximately 5% of league
- 99 overall: Reserved for 1-2 players per position group (generational talents)

**Rookie Rating Philosophy:**
- Most rookies enter the league rated 68-82, regardless of draft position
- Elite 1st round picks typically enter at 78-85 (Pro Bowl caliber ceiling)
- Ratings change annually based on performance, playing time, coaching, and development factors
- Reaching high 80s or 90+ ratings requires multiple seasons of strong development
- This prevents "instant superstar" rookies and creates realistic progression arcs

**Why This Scale:**
- Familiar to players who have played Madden NFL games
- Provides meaningful differentiation (a 78 vs 82 feels significant)
- Avoids the "everyone is 90+" problem of 0-100 scales
- Easier to balance (compressed range = clearer tiers)
- Realistic distribution matches actual NFL talent spread

**Application Across All Entities:**
- **Players:** Overall rating + position-specific attributes
- **Coaches:** Overall rating + specialization skills (development, scheme, motivation)
- **Scouts:** Overall rating + accuracy rating (determines error margin in reports)

### 3.1 Salary Cap Management System

This is the cornerstone of the entire simulation. The cap system must replicate every nuance of the real NFL salary cap.

#### 3.1.1 Cap Fundamentals

**Annual Salary Cap**
- Base cap amount (e.g., $279.2M for 2025)
- Rollover cap space from previous year (100% of unused space)
- Adjusted cap = Base cap + Rollover
- Must be compliant by league year start (March 12, 4:00 PM ET)

**Cap Counting Rules**
- Offseason (March - August): Top 51 player salaries count
- Regular Season (September - January): All 53 roster players count
- Practice squad players: Always count
- Injured Reserve players: Always count

**Salary Floor**
- Must spend 89% of cap over any 4-year period
- League-wide must spend 95% of cap
- Penalty: Pay difference to players from those four years (automatic enforcement)

#### 3.1.2 Contract Structure Components

Each player contract consists of:

**Base Salary**
- Annual salary for that league year
- Fully guaranteed, partially guaranteed, or non-guaranteed
- Counts against cap in the year earned
- Can be restructured into signing bonus

**Signing Bonus**
- Paid to player immediately upon signing
- Prorated over length of contract (max 5 years)
- Example: $10M signing bonus on 4-year deal = $2.5M cap hit per year
- Cannot be restructured once paid
- Accelerates to current year if player cut (dead money)

**Roster Bonus**
- Paid if player is on roster on specific date
- Fully counts against cap in year paid
- Can be restructured into signing bonus
- Often guaranteed

**Workout Bonus**
- Paid for attendance at offseason workouts
- Fully counts against cap in year paid
- Can be restructured into signing bonus
- Typically small amounts ($100K-500K)

**Performance Incentives**
- "Likely to be earned" (LTBE): Count against current year cap
- "Not likely to be earned" (NLTBE): Don't count until earned
- Determined by previous year's performance
- Adjustment in following year if projection wrong

**Guarantees**
- Guaranteed at signing: Cannot be removed
- Guaranteed for injury: Becomes guaranteed if injured
- Guaranteed for skill: Becomes guaranteed if on roster
- Full guarantees vs partial vs rolling guarantees

**Option Bonuses**
- Team or player option to extend contract
- Typically includes bonus payment if option exercised
- Prorated like signing bonus if exercised

**Void Years**
- "Dummy years" added to extend proration
- Player becomes free agent when contract voids
- All remaining proration accelerates to void year
- Useful for kicking cap hits into future
- Requires player agreement (new contract)

#### 3.1.3 Contract Restructuring

The player should be able to model restructures in the Cap Laboratory, then execute them if desired.

**Basic Restructure (No Player Permission Needed)**
- Convert base salary/roster bonus/workout bonus to signing bonus
- Pay player immediately as lump sum
- Prorate over remaining contract years (max 5)
- Must leave minimum base salary based on accrued seasons
- Example: $15M base salary → $14M restructure → $2.8M/year over 5 years

**Restructure with Void Years (Player Permission Required)**
- Add void years to extend proration period
- Requires new contract signing
- Creates dead money when contract voids
- Common for aging stars to create short-term cap relief

**Minimum Salary Requirements by Accrued Seasons:**
| Accrued Seasons | Minimum Base Salary |
|----------------|---------------------|
| 0 | $750,000 |
| 1 | $870,000 |
| 2 | $940,000 |
| 3 | $1,000,000 |
| 4-6 | $1,092,500 |
| 7-9 | $1,250,000 |
| 10+ | $1,500,000 |

*(Note: These are approximate 2025 values, adjust based on final CBA)*

#### 3.1.4 Dead Money

Dead money represents cap charges for players no longer on the roster.

**Calculation:**
- Remaining prorated signing bonus
- Any guaranteed salary not yet paid
- Accelerates to current year when player cut (pre-June 1)
- Can be split over two years (June 1 designation)

**June 1 Designation:**
- Team can designate up to 2 cuts as "June 1 cuts"
- Current year: Only current year's prorated amount counts
- Next year: Remaining proration counts
- Useful for spreading dead money across years
- Player actually released immediately, cap accounting delayed

**Example:**
- 4-year contract, $20M signing bonus ($5M/year proration)
- After Year 2, player is cut
- Remaining proration: $10M (Years 3-4)
- Pre-June 1 cut: $10M dead money in Year 3
- June 1 cut: $5M dead money in Year 3, $5M in Year 4

#### 3.1.5 The "Cap Laboratory" Tool

This is the player's primary interface for cap management. It should allow:

**Scenario Modeling:**
- Add hypothetical contracts (FA signings)
- Remove players (cuts)
- Restructure existing contracts
- Trade scenarios (incoming/outgoing cap hits)
- See instant cap impact of each change
- Save multiple scenarios for comparison

**Roster Analysis Views:**
- Sort by cap hit (current year)
- Sort by remaining contract years
- Sort by guaranteed money remaining
- Sort by dead money if cut
- Sort by cap savings if cut
- Sort by restructure potential
- Filter by position, age, performance rating

**What-If Calculator:**
- "What if I cut Player X?" → Shows cap savings and dead money
- "What if I restructure Player Y?" → Shows current vs future cap impact
- "What if I sign Player Z to this contract?" → Shows remaining cap space
- "What if I trade for Player A?" → Shows cap implications

**Multi-Year Projections:**
- View cap situation for next 5 years
- See future cap hits from current contracts
- Identify future cap crunches
- Plan for upcoming free agents

**Critical: The Cap Laboratory is read-only for planning.** Actual execution requires:
- Cutting players (immediate action)
- Offering contracts (negotiation system)
- Proposing restructures to players (some need permission)
- Finalizing trades (AI acceptance required)

### 3.2 Contract Negotiation System

Negotiations are separate from the Cap Laboratory and introduce uncertainty/realism.

#### 3.2.1 Player Demands & Evaluation

Each player has internal values (hidden from player unless scouted):

**Market Value Factors:**
- Age (prime years = higher value)
- Position (QB/Edge premium, RB discount)
- Performance ratings (overall and position-specific)
- Accolades (Pro Bowls, All-Pro, awards)
- Injury history (hidden risk factor)
- Recent stats and trends
- League-wide market at position

**Personal Factors:**
- Loyalty to current team (years with team)
- Desire to win (will take discount for contender)
- Money motivated (demands max value)
- Hometown connections (prefers certain markets)
- Relationship with GM (improves with tenure)
- Agent aggressiveness (some agents push harder)

#### 3.2.2 Negotiation Flow

**Step 1: Initial Offer**
- Player opens negotiation or GM offers contract
- GM specifies: Years, total value, guaranteed money, structure
- System calculates if offer is in acceptable range

**Step 2: Player Response**
- Accept (if offer meets or exceeds expectations)
- Counter (if offer close but not quite enough)
- Decline (if offer too low, goes to market)
- Request trade (if unhappy with team)

**Step 3: Counter Offers**
- Player counter specifies: Adjusted years/value/guarantees
- GM can accept, counter again, or withdraw
- Multiple rounds possible
- Player patience limited (3-4 rounds max)

**Step 4: Market Competition (Free Agency)**
- Other teams make offers (AI generated)
- Player chooses best offer (value + fit + winning)
- Player may give current team "last look" to match
- Loyalty/relationship factors influence decision

**Step 5: Deal Structure**
- Once terms agreed, GM structures the contract
- Decides: Bonus vs salary split, guarantee timing, void years
- Player cares about total guarantees and APY, less about structure
- Structure affects cap hits (GM's problem, not player's)

#### 3.2.3 Negotiation Interface

**GM Offer Screen:**
- Contract length slider (1-7 years)
- Total value input
- Guaranteed money slider (% of total)
- Suggested market value display (based on comparables)
- Cap hit breakdown by year
- Comparison to current contract (if extension)

**Player Response Display:**
- Accept/Counter/Decline indication
- If counter: Player's requested changes
- Agent statement (flavor text explaining position)
- Market comparison (what other teams might offer)
- Relationship indicator (trust level with GM)

#### 3.2.4 Special Contract Types

**Rookie Contracts (Draft Picks)**
- Slotted by draft position (predetermined scale)
- 4 years for all picks
- 5th year option for 1st round picks (team decision after Year 3)
- No negotiation, automatic based on pick
- Extremely cap-friendly (foundation of team-building)
- **Strategic Value:** Rookies enter at 68-82 overall on cheap contracts; if they develop to 85+ through good coaching and playing time, you have an elite player on a bargain deal for 4-5 years
- **Development Window:** Teams must decide whether to exercise 5th year option after Year 3 before seeing Year 4 development

**Veteran Minimum Contracts**
- Benefit system: Team pays minimum, league pays rest
- Based on accrued seasons (see minimum salary table)
- Often used for camp bodies or end-of-roster depth
- Cap charge is minimum regardless of player's actual pay

**Franchise Tag**
- One player designation per year
- Exclusive tag: Average of top 5 salaries at position (current year)
- Non-exclusive tag: Cap Percentage Average (CBA formula)
- Non-exclusive allows player to negotiate, team gets 2 first-round picks if signs elsewhere
- Cannot be tagged more than twice (increasing cost each time)
- Player must accept tag (one-year deal)

**Transition Tag**
- Alternative to franchise tag
- One player designation per year (franchise OR transition, not both)
- Similar to non-exclusive franchise tag
- Lower salary than franchise tag
- Right of first refusal (team can match offers)
- No compensation if player leaves

### 3.3 Free Agency System

Accurately models the NFL's complex free agency rules and timelines.

#### 3.3.1 Free Agency Categories

**Unrestricted Free Agents (UFA)**
- 4+ accrued seasons
- Contract expired
- Free to sign anywhere
- No compensation to old team
- Old team can tender 110% of previous salary to retain exclusive rights (if done by April 28)

**Restricted Free Agents (RFA)**
- 3 accrued seasons
- Contract expired
- Old team can extend qualifying offer for right of first refusal

**Qualifying Offer Levels (RFA):**
| Tender Amount | Right of First Refusal | Compensation if Not Matched |
|---------------|------------------------|------------------------------|
| $3,263,000 | Yes | None |
| $3,406,000 | Yes | Original draft round pick |
| $5,346,000 | Yes | 2nd round pick |
| $7,458,000 | Yes | 1st round pick |
| $7,958,000 | Yes | 1st round pick (no tag restrictions) |

*(Or 110% of previous salary, whichever is greater)*

**Exclusive Rights Free Agents (ERFA)**
- Fewer than 3 accrued seasons
- Contract expired
- Old team can tender at minimum salary
- Player must accept (no negotiation rights)
- Cannot negotiate with other teams

#### 3.3.2 Free Agency Timeline

**March 10-12 (Legal Tampering Period)**
- 12:00 PM ET Monday through 3:59:59 PM ET Wednesday
- Teams can negotiate with UFAs only
- No signings official until 4:00 PM ET on March 12
- RFAs, franchise players, transition players excluded
- System allows offers but contracts not signed yet

**March 12, 4:00 PM ET (Free Agency Opens)**
- New league year begins
- All free agents officially available
- UFA can sign immediately
- RFA can sign offer sheets (old team has 5 days to match)
- Teams must be cap compliant at this moment

**March 12 - April 18 (RFA Signing Period)**
- RFA can negotiate and sign offer sheets
- Old team has right of first refusal
- If not matched, compensation owed based on tender level
- If no offer sheet by April 19, rights revert to old team exclusively

**March 12 - July 22 (UFA Signing Period)**
- UFA can sign with any team
- If old team tendered 110% by April 28, exclusive rights after July 22
- Most major signings happen in first week

**July 22 - November 11 (Exclusive Rights Period)**
- Tendered UFA and transition players: Old team has exclusive rights
- Can still negotiate and sign
- If unsigned by November 11, must sit out season

**Throughout Season (Street Free Agents)**
- Players cut by teams become immediate free agents
- Can sign with any team at any time
- Subject to waiver wire first (for vested veterans, waived directly to FA)
- Critical for injury replacements

#### 3.3.3 AI Team Behavior in Free Agency

AI teams should behave realistically based on:

**Team Context:**
- Cap space available
- Roster needs (positions of weakness)
- Win-now vs rebuild mode
- Recent draft picks (avoiding redundancy)
- Coaching scheme fit

**Market Dynamics:**
- Supply and demand at each position
- Bidding wars for top players
- Value signings late in free agency
- Teams avoiding overpays (mostly)
- Some teams make mistakes (bad contracts)

**Player Preferences:**
- Top players choose winning situations
- Some players chase money
- Hometown/regional preferences
- Previous team connections (coach/GM)

**Realistic Outcomes:**
- Not every team fills every need
- Some players sign "surprising" contracts (like real NFL)
- Market values fluctuate based on early signings
- Compensatory picks awarded following season (for losing UFAs)

### 3.4 Draft System

#### 3.4.1 Draft Structure

**7 Rounds, 32 Picks Each**
- Rounds 1-2: Day 1 (Friday night)
- Rounds 3-4: Day 2 (Saturday afternoon)
- Rounds 5-7: Day 3 (Saturday evening)
- Pick order determined by previous season record (playoffs then non-playoffs)
- Compensatory picks awarded between rounds (for FA losses)

**Draft Pick Trading:**
- Can trade picks during season and offseason
- Can trade future picks (up to 3 years out)
- Draft day trades in real-time
- "Trade value chart" helps AI evaluate fairness
- Player + pick trades allowed

#### 3.4.2 College Scouting System

This is where scout quality becomes critical.

**Scouting Process:**

**September - December (Regular Season)**
- Scouts attend college games based on assignment
- Each scout covers specific regions/conferences
- Scout quality determines accuracy of evaluations
- More scouts = more thorough coverage

**January (Senior Bowl / All-Star Games)**
- Additional scouting opportunities
- Scouts update reports based on performances
- Head-to-head competitions reveal more

**February - March (Combine & Pro Days)**
- Measurables: 40-yard dash, bench press, vertical, broad jump, 3-cone, shuttle
- Medical evaluations (injury red flags)
- Psychological testing (Wonderlic, interviews)
- Optional: GM can schedule private interviews (limited number)
- Combine results may confirm or contradict game film

**Scout Report Components:**

**Physical Ratings (Madden-style 54-99 scale):**
- Position-specific skills (vary by position)
- Speed, Strength, Agility (universal)
- Height, Weight, Arm Length (measurables)
- Injury History (red flags)

**Note on Rating Distribution:**
- The majority of NFL players fall between 68-85 overall
- Below 68: Roster bubble players, practice squad candidates
- 68-76: Depth pieces, rotational players (league average ~70-73)
- 77-84: Quality starters, above-average players
- 85-89: Pro Bowl caliber, elite starters
- 90-99: Superstars, All-Pros, MVP candidates
- 99: Reserved for the absolute best at their position

**Intangible Ratings:**
- Football IQ (pattern recognition, reads)
- Work Ethic (development potential)
- Character (off-field reliability)
- Leadership (team impact)

**Overall Grade:**
- 1st Round Talent (78-85 as rookies, 85-95+ potential)
- 2nd-3rd Round Talent (72-80 as rookies, 78-87 potential)
- 4th-5th Round Talent (68-75 as rookies, 72-82 potential)
- 6th-7th Round Talent (65-71 as rookies, 68-78 potential)
- Undrafted Free Agent (60-68 as rookies, 65-75 potential)
- Not NFL Caliber (54-59)

**Note on Rookie Ratings:**
- Most rookies enter the league rated 68-82, regardless of draft position
- Even elite 1st round picks rarely exceed 82-85 as rookies (Pro Bowl caliber ceiling)
- Reaching the high 80s or 90s requires multiple seasons of development
- The "potential" ratings represent what scouts project the player could become with proper development
- Actual ratings change annually based on playing time, coaching, work ethic, scheme fit, and performance

**Scout Accuracy:**

- **Elite Scout (90+ rating):** ±2 points from true rating
- **Good Scout (80-89 rating):** ±4 points from true rating
- **Average Scout (70-79 rating):** ±6 points from true rating
- **Below Average Scout (60-69 rating):** ±9 points from true rating
- **Poor Scout (54-59 rating):** ±12 points from true rating

Example: Player's true rating is 82. Elite scout reports 80-84. Poor scout reports 70-94.

**Information Depth:**
- Better scouts provide more detailed analysis
- Poor scouts might miss injury flags
- Intangibles harder to scout than physical skills
- Character issues sometimes completely missed

#### 3.4.3 Draft Board Construction

**Player Interface:**
- Master list of all draft-eligible players
- Filter by position, round grade, school, combine results
- Sort by overall grade, position rank, speed, any attribute
- Notes system (GM can add personal notes)
- Color coding (target, avoid, sleeper)

**Draft Board Ordering:**
- Drag-and-drop ranking system
- Auto-rank by overall grade (default)
- Manual override for personal preferences
- BPA (Best Player Available) vs Positional Need tension
- Tier system (group similar players)

**Mock Drafts:**
- AI simulates other teams' picks
- Shows likely availability at your picks
- AI boards are hidden (realistic uncertainty)
- Can run multiple mock simulations
- Helps identify trade-up/trade-back opportunities

#### 3.4.4 Draft Day Experience

**Live Draft Interface:**
- Pick clock countdown
- Current pick announcement
- Available players list (filtered by board)
- Team needs display
- Trade proposals from AI teams
- "War room" flavor (coach/scout recommendations)

**Decision Points Each Pick:**
- Select player from board
- Trade up (offer picks to team ahead)
- Trade down (accept offer from team behind)
- Trade pick for veteran player
- Use pick or forfeit (rare, usually only if no contract agreement)

**AI Trade Logic:**
- Teams trade up for QB/premium positions
- Teams trade down if no target available
- Trade value chart determines fairness
- Some teams more aggressive (GMs have personalities)
- Desperation trades late (e.g., QB-needy team)

**Post-Pick Actions:**
- Rookie contract auto-generated (slotted)
- Player added to roster
- Scout reports update (comparison to actual pick)
- Media reaction (draft grades)

#### 3.4.5 Undrafted Free Agency (UDFA)

**Immediately After Draft:**
- Remaining players become UDFA
- Teams can sign limited number (usually fill to 90-man offseason roster)
- Competitive bidding (guaranteed money, roster spot promises)
- Often developmental players or position depth
- Veteran minimum contracts

### 3.5 Roster Management

#### 3.5.1 Roster Limits & Structures

**Offseason Roster (90 players max)**
- May - July
- Includes drafted rookies, UDFA signings, returning veterans
- No cap implications beyond top 51
- Cut to 53 before season starts

**Active Roster (53 players)**
- Game day roster during season
- All 53 count against cap
- 46-48 dress for game (varies by team)
- Position requirements: Min 1 QB, usually follow rough position distribution

**Practice Squad (16 players)**
- Developmental players
- Can be signed by other teams to active roster
- Limited elevation to active roster (3 times per player per season)
- Veteran exceptions (players with 2+ accrued seasons)
- Count against cap at minimum salary

**Injured Reserve (IR)**
- Players out extended time (min 4 games)
- Count against cap
- Designated to return (limited number per season)
- Season-ending IR vs short-term IR

**Reserve Lists:**
- PUP (Physically Unable to Perform): Injury from previous season
- NFI (Non-Football Injury): Injury outside football
- Commissioner Exempt: Legal/disciplinary issues
- Still count against cap in most cases

#### 3.5.2 Depth Chart Management

**Position Groups:**
- QB (2-3 typical)
- RB (3-4 typical)
- WR (5-7 typical)
- TE (3-4 typical)
- OL (8-10 typical): LT, LG, C, RG, RT
- DL (6-9 typical): DE, DT, NT (varies by scheme)
- LB (6-8 typical): OLB, ILB, MLB (varies by scheme)
- DB (9-12 typical): CB, S, Nickel, Dime
- Special Teams: K, P, LS, Returners

**Depth Chart Rules:**
- Starter, 2nd string, 3rd string for each position
- Backups fill in for injuries
- Special teams designations (who plays ST snaps)
- Automated or manual management

**Automated Depth Chart (Coached by HC):**
- AI arranges by overall rating and fit
- Considers injuries automatically
- Optimizes based on opponent (AI coach decision)
- Player can review and override anytime

**Manual Depth Chart:**
- Player drags players into positions
- Must account for injuries manually
- Full control over snap distribution philosophy
- More work but more customization

#### 3.5.3 Injuries & Medical Management

**Injury System:**

**Injury Occurrence:**
- Random injury chance each game (based on position and hidden risk factors)
- Severity: Minor (questionable/1 week), Moderate (2-4 weeks), Major (4-8 weeks), Season-ending (8+ weeks)
- Type: Concussion, knee, ankle, shoulder, back, etc.
- Injury history increases re-injury risk (hidden factor)

**Injury Management Options:**

**Automated (Medical Staff Handles):**
- Staff evaluates injury
- Makes IR decisions automatically
- Recommends practice squad elevations
- Player sees weekly injury report

**Manual (GM Decides):**
- Review injury report
- Decide: Play through, rest, IR designation
- Manage roster moves to cover injuries
- Risk of re-injury if played too soon

**Medical Staff Quality Impact:**
- Better staff = more accurate injury predictions
- Better staff = faster recovery times
- Poor staff = more re-injuries
- Staff can discover hidden injury risks during physicals

#### 3.5.4 Waiver Wire & Transactions

**Waiver Priority System:**
- Inverse order of standings (worst team has #1 priority)
- Resets weekly
- Priority burns when claim is made (move to back of line)
- Disabled for vested veterans (4+ seasons, direct to FA)

**Transaction Types:**
- Waiver claim (player cut by another team)
- Free agent signing (player already cleared waivers)
- Trade (player for player, player for pick, pick for pick)
- Release (cut player, create cap space/dead money)
- IR designation (open roster spot, player still under contract)
- Practice squad signing/releasing/elevating

**Trade Deadline:**
- Tuesday after Week 9
- No trades after deadline (except practice squad)
- Trade proposals anytime before deadline
- AI teams more active as deadline approaches

### 3.6 Coaching & Scouting Staff Management

#### 3.6.1 Staff Positions & Responsibilities

**Head Coach**
- Overall team performance
- Offensive or defensive specialty (affects scheme preference)
- Player development (general boost)
- Game day decision making (4th down, 2-pt conversion)
- Depth chart management (if automated)
- Draft input (may advocate for positions/players)
- Salary: $3M - $20M per year (does not count against cap)

**Offensive Coordinator (OC)**
- Offensive player development
- Scheme fit evaluation (players rated higher/lower based on scheme)
- Play calling (affects offensive performance)
- QB development (critical for QB growth)
- Salary: $1M - $5M per year

**Defensive Coordinator (DC)**
- Defensive player development
- Scheme fit evaluation (3-4 vs 4-3, Cover 2 vs Cover 3, etc.)
- Play calling (affects defensive performance)
- Defensive player growth
- Salary: $1M - $5M per year

**Position Coaches (6-10 coaches)**
- Quarterback Coach
- Running Backs Coach
- Wide Receivers Coach
- Offensive Line Coach
- Defensive Line Coach
- Linebackers Coach
- Defensive Backs Coach
- Special Teams Coordinator
- Each provides development boost to their position group
- Salary: $300K - $1.5M per year

**Scouting Staff**

**Director of College Scouting**
- Oversees college scouting process
- Compiles final draft board
- Quality affects overall scout accuracy
- Salary: $200K - $800K per year

**Regional Scouts (4-8 scouts)**
- Cover specific geographic regions/conferences
- Attend games, evaluate players
- Individual quality ratings (affects accuracy of their reports)
- More scouts = more coverage, but higher cost
- Salary: $75K - $250K per year each

**Director of Pro Personnel**
- Oversees NFL player scouting
- Evaluates veteran free agents
- Trade target identification
- Quality affects FA/trade evaluation accuracy
- Salary: $200K - $800K per year

**Pro Scouts (2-4 scouts)**
- Monitor other NFL teams' rosters
- Evaluate potential FA targets
- Track waiver wire candidates
- Salary: $75K - $200K per year each

#### 3.6.2 Staff Ratings & Impact

Each coach/scout has ratings (Madden-style 54-99 scale):

**Overall Rating**
- Composite of all skills
- Determines salary demands
- Visible to player
- Distribution: Most coaches/scouts fall between 68-85

**Specific Skills (some visible, some hidden):**
- Development: How much players improve
- Evaluation: Accuracy of player assessments
- Scheme: How well they implement systems
- Motivation: Player morale impact
- Game Management: In-game decisions (coaches only)

**Staff Quality Impacts:**

**Elite Staff (90+ rating):**
- Player development: +3-5 rating points per year
- Evaluation accuracy: ±2 points
- Scheme fit: +5 rating boost for ideal fits
- Game outcomes: +10% win probability boost

**Good Staff (80-89 rating):**
- Player development: +2-3 rating points per year
- Evaluation accuracy: ±4 points
- Scheme fit: +3 rating boost for ideal fits
- Game outcomes: +5% win probability boost

**Average Staff (70-79 rating):**
- Player development: +1-2 rating points per year
- Evaluation accuracy: ±6 points
- Scheme fit: +2 rating boost for ideal fits
- Game outcomes: Neutral

**Below Average Staff (60-69 rating):**
- Player development: +0-1 rating points per year
- Evaluation accuracy: ±9 points
- Scheme fit: +1 rating boost for ideal fits
- Game outcomes: -3% win probability

**Poor Staff (54-59 rating):**
- Player development: 0 rating points per year (no improvement)
- Evaluation accuracy: ±12 points
- Scheme fit: No boost or negative
- Game outcomes: -5% win probability

#### 3.6.3 Hiring & Firing Process

**Coaching Changes:**

**When to Consider:**
- Poor season performance (missing playoffs, losing record)
- Player development stagnation
- Scheme mismatches (roster doesn't fit scheme)
- Contract expiration
- Better candidate available

**Hiring Process:**
- Post opening (attracts candidates)
- Receive applications (AI coaches with various ratings)
- Interview candidates (flavor text, salary demands)
- Make offer (negotiate salary and term)
- Hire or continue search

**Contract Terms:**
- 1-5 year deals typical
- Longer deals = more security, harder to fire
- Buyout clauses (pay remaining contract if fired)
- Performance incentives (bonus for playoffs/wins)

**Firing Costs:**
- Immediate: Pay remaining guaranteed contract
- Reputation hit (future candidates wary)
- Staff morale impact (other coaches nervous)
- Time cost (must hire replacement mid-season or wait)

**Scouting Changes:**

Similar process but lower stakes:
- Evaluate scout accuracy (compare reports to actual performance)
- Fire underperforming scouts
- Hire new scouts during offseason
- Smaller contracts (easier to change)

#### 3.6.4 Staff Budget & Financial Impact

**Total Staff Budget:**
- Does NOT count against player salary cap
- Comes from team revenue
- Owner sets budget based on profitability
- Bigger market teams = bigger budgets (generally)

**Budget Constraints:**
- Must stay within allocated budget
- Elite staff expensive (may need to choose: one great coach or several good ones)
- Tradeoff: Invest in development vs invest in players
- Winning teams generate more revenue = bigger budgets

**Budget Negotiation:**
- Owner provides budget each year
- Based on: Market size, team revenue, profitability, owner wealth
- Player can request increase (if team profitable)
- Owner may demand decrease (if team losing money)

### 3.7 Team Finances & Profitability

While not a deep business sim, finances provide context and constraints.

#### 3.7.1 Revenue Streams

**Media Rights (League-Wide Pool)**
- Shared equally among all 32 teams
- Largest revenue source
- Not controllable by player
- Grows over time (new TV deals)

**Ticket Sales (Market & Performance Dependent)**
- Based on: Market size, stadium capacity, team performance, star players
- Large markets (NY, LA, Chicago) = higher prices and attendance
- Winning teams = higher attendance
- Star players = higher attendance
- Playoff games = additional revenue

**Merchandise (Performance & Star Dependent)**
- Team-specific merchandise sales
- Star players boost sales (QB, skill positions)
- Winning teams sell more
- Championships = huge boost

**Sponsorships & Local Revenue (Market Dependent)**
- Stadium naming rights
- Local sponsorships
- Corporate partnerships
- Larger markets = more lucrative deals

**Luxury Suites & Premium Seating (Market & Stadium Dependent)**
- High-margin revenue
- Market size critical
- Stadium quality matters (assumed constant in sim)

#### 3.7.2 Expenses

**Player Salaries (Salary Cap)**
- ~48% of league revenue (per CBA)
- Mandated by salary cap
- Largest expense

**Coaching & Scouting Staff**
- Controllable by player
- Typically $10M - $50M per year total
- Elite staffs very expensive

**Operations (Abstracted)**
- Stadium operations
- Travel
- Equipment
- Medical
- Facilities
- Represented as fixed cost (~$30M per year, varies by market)

#### 3.7.3 Profitability Display

**Annual Financial Summary:**
- Total Revenue
- Total Expenses
- Profit/Loss
- Comparison to league average
- Trend (improving or declining)

**Owner Satisfaction:**
- Based on: Profitability, wins, playoff success
- Affects job security
- Affects staff budget allocation
- Owner expectations vary (some prioritize wins, some profit)

**Market Size Tiers:**
| Tier | Markets | Revenue Multiplier |
|------|---------|-------------------|
| Large | NY, LA, Chicago, Dallas, SF | 1.3x |
| Medium-Large | Boston, Philadelphia, Washington, Houston | 1.15x |
| Medium | Seattle, Denver, Atlanta, Miami, Phoenix | 1.0x |
| Small-Medium | Baltimore, Cleveland, Pittsburgh, Detroit | 0.9x |
| Small | Buffalo, Jacksonville, Green Bay, New Orleans | 0.8x |

**Performance Impact on Revenue:**
| Performance | Revenue Impact |
|-------------|----------------|
| Win Championship | +25% for following year |
| Reach Championship Game | +15% |
| Reach Divisional Round | +10% |
| Make Wild Card | +5% |
| Winning Record (no playoffs) | +0% |
| Losing Record | -5% |
| Bottom 5 in league | -10% |

*(Effects compound over multiple years of sustained success/failure)*

### 3.8 Player Development System

#### 3.8.1 Development Factors

**Age Curves (By Position):**
- QB: Peak 27-33, slow decline
- RB: Peak 23-27, steep decline after 28
- WR: Peak 26-30, moderate decline
- TE: Peak 26-31, moderate decline
- OL: Peak 27-32, slow decline
- DL: Peak 26-30, moderate decline
- LB: Peak 25-29, moderate decline
- DB: Peak 25-29, moderate decline

**Coaching Impact:**
- Position coach quality = development rate
- Coordinator quality = additional boost
- Head coach = small general boost
- No coaching = minimal development

**Playing Time:**
- Starters develop faster (more reps)
- Backups develop slowly
- Practice squad minimal development
- Injured players: no development

**Work Ethic (Hidden Attribute):**
- High work ethic: +2 development modifier
- Average work ethic: +0 modifier
- Low work ethic: -1 modifier (may regress)

**Scheme Fit:**
- Player in wrong scheme develops slower
- Player in ideal scheme develops faster
- Example: Power run OL in zone scheme = slower development

#### 3.8.2 Development Formula

Each offseason, players' ratings update:

**Base Development:**
- Age progression (positive or negative based on age curve)
- Playing time modifier (starter +2, backup +1, practice squad +0)
- Coach quality modifier (+0 to +3 based on position coach rating)
- Work ethic modifier (-1 to +2 based on hidden attribute)
- Scheme fit modifier (-1 to +2 based on fit)
- Randomness (±1 for variance)

**Example:**
- 24-year-old WR, 78 overall rating
- Starting role: +2
- Good WR coach (83 rating): +2
- High work ethic: +2
- Good scheme fit: +1
- Random: +1
- Total: +8 → Now 86 overall rating (breakout!)

**Rookie Development Progression Example:**
A #5 overall pick QB enters the league:

*Year 1 (Age 22):* Drafted at 82 overall
- Backup role: +1
- Elite QB coach (92 rating): +3
- High work ethic: +2
- Learning offense (poor scheme fit): -1
- Random: 0
- Total: +5 → Ends season at 87 overall

*Year 2 (Age 23):* Starter role, 87 overall
- Starting role: +2
- Elite QB coach: +3
- High work ethic: +2
- Good scheme fit: +1
- Random: +1
- Total: +9 → Ends season at 96 overall (Pro Bowl breakout!)

*Year 3 (Age 24):* 96 overall
- Starting role: +2
- Elite QB coach: +3
- High work ethic: +2
- Good scheme fit: +1
- Random: -1
- Total: +7 → Capped at 99 overall (Only +3 due to cap)

This shows how elite prospects can develop into superstars over 2-3 seasons with optimal conditions (playing time, elite coaching, high work ethic). Most players won't have all these factors align, resulting in slower or stalled development.

**Regression:**
- Aging players (past prime) regress
- Injuries can cause rating drops
- Low work ethic can cause regression
- Lack of playing time slows development (may regress)

#### 3.8.3 Breakouts, Busts, and Injuries

**Breakout Candidates:**
- Young players (21-24)
- High work ethic
- Good coaching
- Increased playing time
- Can jump 5-10 rating points in one year

**Busts:**
- High draft picks who don't develop
- Poor work ethic revealed
- Injury-prone (hidden attribute)
- Scheme mismatches
- Can stagnate or regress despite youth

**Injury Impact:**
- Season-ending injury: No development that year
- Severe injury: May lose 1-3 rating points permanently
- Multiple injuries: Increased injury risk (hidden attribute worsens)
- Career-threatening: Forced retirement (rare)

### 3.9 Game Simulation System

#### 3.9.1 Simulation Options

**Option 1: Instant Simulation**
- Click "Simulate Game"
- Instant results displayed
- Final score
- Key stats (passing yards, rushing yards, turnovers)
- Injuries
- Player performance grades

**Option 2: Visual Playback (Apple Sports Style)**
- Simplified football field graphic
- Offense marches down field
- Play-by-play text updates
- ~2 plays per second
- Score updates
- Quarter breaks (brief pause)
- Total time: ~3-5 minutes per game
- Can skip ahead at any time

#### 3.9.2 Simulation Logic

**Game Outcome Factors:**
- Team overall ratings (offense, defense, special teams)
- Home field advantage (~3 point swing)
- Coaching quality (game management decisions)
- Depth chart quality (injuries expose bad backups)
- Scheme matchups (offensive scheme vs defensive scheme)
- Randomness (any given Sunday)

**Statistical Simulation:**
- Based on team/player ratings
- Realistic stat distributions
- Star players get more opportunities
- Injuries during game affect outcome
- Turnovers, penalties, special teams mistakes

**Outcomes:**
- Final score
- Team stats (total yards, time of possession, turnovers)
- Individual stats (passing, rushing, receiving, tackles, sacks)
- Injuries sustained
- Player performance grades (54-99 scale, matching overall rating system)

#### 3.9.3 Post-Game Information

**Injury Report:**
- Who was injured
- Severity assessment
- Expected return timeline
- IR recommendation (if applicable)

**Performance Grades:**
- Overall team grades (offense, defense, ST)
- Individual player grades
- Identify breakout performances
- Identify concerning trends

**Playoff Implications:**
- Updated standings
- Playoff probability
- Magic numbers (if applicable)

**Media Reaction (Flavor):**
- Headlines about performance
- Criticism or praise for GM decisions
- Player quotes
- Coach quotes

### 3.10 AI Opponent Behavior

#### 3.10.1 AI General Manager Personalities

Each AI GM has hidden attributes affecting decision-making:

**Risk Tolerance:**
- Conservative: Avoids trades, values picks, builds through draft
- Aggressive: Frequent trades, mortgages future, win-now mentality
- Balanced: Mix of both

**Philosophy:**
- Analytics-driven: Values efficiency, undervalued positions
- Traditional: Values star power, premium positions
- Hybrid: Mix

**Loyalty:**
- High: Reluctant to cut veterans, values continuity
- Low: Ruthless, cuts underperformers quickly

**Cap Management:**
- Responsible: Maintains cap space, avoids dead money
- Aggressive: Uses restructures liberally, kicks can down road

#### 3.10.2 AI Decision Making

**Free Agency:**
- Prioritize positions of need
- Bid based on cap space available
- Won't overpay beyond personality thresholds
- Occasionally make mistakes (bad contracts)

**Draft:**
- Draft boards somewhat random (reflects scouting differences)
- BPA vs need varies by team situation
- More likely to reach for QB if desperate
- Trade up for premium prospects

**Trades:**
- Evaluate based on trade value chart
- Some GMs easier to trade with (balanced)
- Some GMs very difficult (conservative)
- Win-now teams more likely to give up picks

**Roster Decisions:**
- Cut expensive underperformers
- Extend young stars
- Franchise tag star players
- Some GMs make puzzling decisions (realism)

#### 3.10.3 League-Wide Dynamics

**Market Correction:**
- If position overpaid in Year 1, market corrects in Year 2
- Compensatory pick system rewards losing FAs
- Bad contracts become albatrosses (dead money when cut)

**Competitive Balance:**
- Bad teams get better draft picks
- Good teams face harder schedule (eventual regression)
- Dynasty teams possible but difficult
- Parity reflects real NFL

---

## 4. Feature Priority Matrix

### 4.1 MVP (Minimum Viable Product) - Version 1.0

**Must-Have Features for Launch:**

**Core Systems:**
- ✅ Full salary cap system (proration, dead money, restructures)
- ✅ Contract negotiation (offers, counters, acceptance)
- ✅ Free agency (UFA, RFA, franchise tag)
- ✅ Draft system (7 rounds, trading)
- ✅ Basic scouting (college and pro)
- ✅ Roster management (53-man, practice squad, IR)
- ✅ Game simulation (instant results + stats)
- ✅ Basic AI opponent behavior
- ✅ Career mode (single GM, multi-season)
- ✅ Job security / hiring / firing

**UI/UX:**
- ✅ Cap Laboratory (scenario modeling)
- ✅ Contract offer interface
- ✅ Draft board construction
- ✅ Roster management screens
- ✅ Free agency market browser
- ✅ Season calendar / timeline

**Data Requirements:**
- ✅ 32 NFL teams (names, locations)
- ✅ Player database (~1700 players with ratings)
- ✅ Position requirements and ratings
- ✅ Rookie contract slotting data
- ✅ Historical data for one starting season

### 4.2 Version 1.5 Enhancements

**Next Priority Features:**

- ✅ Visual game playback (Apple Sports style)
- ✅ Coaching staff management (hire/fire, ratings)
- ✅ Enhanced scouting (scout ratings affect accuracy)
- ✅ Player development system (age curves, coaching impact)
- ✅ Scheme systems (offensive/defensive schemes, fit ratings)
- ✅ Work ethic / intangibles (hidden attributes)
- ✅ Injury system (occurrence, severity, history)
- ✅ Trade deadline activity
- ✅ Waiver wire system
- ✅ Team finances (revenue, expenses, profitability)

### 4.3 Version 2.0 Advanced Features

**Future Enhancements:**

- Advanced analytics (DVOA, EPA, win probability)
- Detailed player progression tracking
- Media system (press conferences, reputation)
- Owner interactions (budget negotiations, meddling)
- League history tracking (records, Hall of Fame)
- Legacy system (GM career achievements, HOF candidacy)
- Combine interviews (evaluate intangibles)
- Training camp battles (dynamic depth chart)
- Advanced AI personalities (grudges, alliances)
- Commissioner mode (control league rules)

### 4.4 Out of Scope (Initially)

**Not Planned for Early Versions:**

- Multiplayer (human vs human leagues)
- Play calling / game tactics
- Custom teams / custom leagues
- Real-time online drafts
- International player development
- Stadium construction / relocation
- 3D graphics or animations
- Mobile version (desktop only initially)

---

## 5. Technical Considerations

### 5.1 Database Architecture

**Core Tables Required:**

**Teams**
- team_id, name, abbreviation, city, market_size
- stadium_capacity, division, conference
- current_cap_space, rollover_cap

**Players**
- player_id, name, position, age, college
- overall_rating, position_specific_ratings (JSON)
- work_ethic (hidden), injury_risk (hidden)
- accrued_seasons, draft_year, draft_round, draft_pick

**Contracts**
- contract_id, player_id, team_id
- years_remaining, current_year, total_years
- base_salary_by_year (JSON array)
- signing_bonus_total, signing_bonus_remaining
- guaranteed_money_remaining
- void_year (boolean)
- dead_money_if_cut

**Draft_Picks**
- pick_id, year, round, pick_number
- original_team_id, current_team_id (for trades)
- used (boolean), player_selected

**Free_Agents**
- player_id, type (UFA, RFA, ERFA)
- rfa_tender_amount (if applicable)
- compensatory_pick_eligible (boolean)
- interested_teams (JSON array)

**Coaches**
- coach_id, name, position (HC, OC, DC, position coach)
- team_id, overall_rating, development_rating
- scheme_type, contract_years_remaining, salary

**Scouts**
- scout_id, name, type (college, pro)
- team_id, overall_rating, region (if college)
- accuracy_rating, salary

**GM_Career**
- gm_id, current_team_id, reputation
- years_experience, total_wins, total_losses
- playoff_appearances, championships
- draft_pick_success_rate

**Scout_Reports**
- report_id, player_id, scout_id, season
- reported_overall_rating (may differ from actual)
- position_ratings (JSON)
- report_accuracy (comparison to actual)

**Game_Results**
- game_id, season, week, home_team_id, away_team_id
- home_score, away_score
- injuries (JSON array)
- stats (JSON object)

**Transactions**
- transaction_id, transaction_type, date
- team_id, player_id
- details (JSON - contract terms, trade details, etc.)

### 5.2 Key Calculations & Algorithms

**Salary Cap Calculation:**
```
Current Cap Hit = 
  Base Salary (current year) +
  Prorated Signing Bonus (current year) +
  Roster Bonus (if earned) +
  Workout Bonus (if earned) +
  LTBE Incentives
  
Dead Money (if cut pre-June 1) =
  Remaining Signing Bonus Proration (all years) +
  Guaranteed Salary (current year)
  
Dead Money (if cut June 1) =
  Current Year: Remaining Signing Bonus Proration (current year) +
                Guaranteed Salary (current year)
  Next Year: Remaining Signing Bonus Proration (future years)
```

**Contract Restructure:**
```
Max Restructure Amount = 
  Base Salary (current year) - Minimum Salary (by accrued seasons)
  
New Signing Bonus = Max Restructure Amount
Proration Years = MIN(Years Remaining on Contract, 5)
Annual Cap Hit = New Signing Bonus / Proration Years

For each year:
  New Cap Hit = Remaining Base Salary + Signing Bonus Proration
```

**Player Development:**
```
Rating Change = 
  Age Curve Modifier +
  Playing Time Modifier +
  Coach Quality Modifier +
  Work Ethic Modifier +
  Scheme Fit Modifier +
  Random(-1 to +1)
  
New Rating = Old Rating + Rating Change (capped at 99)
```

**Game Simulation:**
```
Win Probability = 
  Base 50% +
  (Team Rating Differential * 2%) +
  Home Field (3%) +
  Coaching Differential (1-3%) +
  Randomness (-10% to +10%)
  
Score = 
  Base Points (14-35 range) +
  Offensive Rating Modifier +
  Defensive Rating Modifier (opponent) +
  Turnover Impact +
  Special Teams Impact
```

**Draft Pick Value (Trade Chart):**
```
Based on Jimmy Johnson chart (approx):
Pick 1: 3000 points
Pick 32: 590 points
Pick 64: 270 points
Pick 100: 112 points
Pick 150: 34 points
Pick 224: 4 points

Fair Trade: Total Value Team A ≈ Total Value Team B (±10%)
```

**Scout Accuracy:**
```
Reported Rating = 
  True Rating + Random(-Scout_Error, +Scout_Error)
  
Where Scout_Error based on Scout Rating:
  Elite Scout (90+): ±2
  Good Scout (80-89): ±4
  Average Scout (70-79): ±6
  Below Average Scout (60-69): ±9
  Poor Scout (54-59): ±12
```

### 5.3 AI Behavior Logic

**Free Agency Bidding:**
```
AI Offer = 
  Player Market Value +
  Team Desperation Modifier (positional need) +
  Cap Space Modifier (can they afford?) +
  GM Personality (risk tolerance, aggression) +
  Randomness (realistic variance)
  
Max Offer = MIN(AI Offer, Cap Space Available * 0.25)
```

**Draft Decision:**
```
For Each Pick:
  1. Evaluate BPA (Best Player Available on board)
  2. Evaluate positional needs (weight by severity)
  3. Check for trade up opportunities (if target falling)
  4. Check for trade down offers (if no clear target)
  5. Decision = Weighted Average(BPA value, Need value, Trade value)
  6. Add randomness (some teams reach, some steal value)
```

**Trade Evaluation:**
```
Trade Value = Sum(Player Value + Pick Value)
Accept Trade if:
  (Value Received - Value Given) > Acceptance Threshold
  AND Addresses Team Need
  AND Fits GM Personality
  
Acceptance Threshold varies:
  Conservative GM: Needs +20% value to accept
  Balanced GM: Needs +5% value to accept
  Aggressive GM: Will accept even trades
```

### 5.4 Performance Optimization

**Database Indexing:**
- Index on player_id, team_id, position, age
- Index on contract_id, player_id, team_id
- Index on game_id, season, week
- Composite indexes for common queries

**Caching Strategy:**
- Cache current season data in memory
- Cache team rosters and contracts
- Invalidate cache on transactions
- Pre-calculate cap space on page load

**Simulation Optimization:**
- Batch process simulations (all games in a week)
- Parallelize stat generation
- Pre-generate random seeds for consistency

### 5.5 Data Sources & Initialization

**Initial Data Requirements:**

**Team Data:**
- 32 NFL teams (publicly available)
- Current divisions and conferences
- Market size estimates (research)

**Player Data (For Real-World Mode):**
- Current rosters (~1700 players)
- Contract details (publicly available from Spotrac, Over The Cap)
- Player ratings (manual creation or scraping from Madden/PFF)
- Draft year and pick

**Historical Data:**
- Previous season records (for draft order)
- Compensatory pick formulas
- Franchise tag values by position

**Rookie Data (For Draft):**
- ~300-400 draft-eligible players per year
- Approximate ratings (manual or generated)
- Combine data (if using real prospects)

**Alternative: Generated Data:**
- Procedurally generate players with ratings
- Create fictional rosters and contracts
- Easier to implement, less realistic
- Good for MVP, can add real data later

---

## 6. User Interface & Experience

### 6.1 Main Navigation Structure

**Dashboard (Home Screen)**
- Current season, week, record
- Upcoming game
- Recent transactions
- Cap space summary
- Alerts / notifications (contract expiring, injured players, etc.)
- Quick links to common tasks

**Team Management**
- Roster viewer (depth chart, contracts, ratings)
- Salary cap overview
- Transactions history
- Coaching staff
- Scouting staff

**Personnel**
- Free agents browser
- Trade finder
- Draft board (during draft season)
- Player comparison tool

**Cap Laboratory**
- Scenario modeling
- Cut simulator
- Restructure calculator
- Multi-year projections

**Season**
- Schedule & results
- Standings
- League leaders
- Playoff picture

**Career**
- GM profile
- Career stats
- Job offers (if available)
- Achievements & milestones

### 6.2 Key Interface Screens

**Cap Laboratory:**
- Left sidebar: Current roster with sortable columns
- Main area: Active scenario with running cap total
- Right sidebar: Actions (cut, restructure, add FA)
- Bottom: Save scenario, compare scenarios, reset

**Contract Negotiation:**
- Player card (photo, stats, ratings)
- Offer builder (years, total value, guarantees)
- Market comparison (what similar players earn)
- Cap impact visualization (by year)
- Submit offer button
- Response area (accept/counter/decline)

**Draft Board:**
- Left sidebar: Filters (position, round grade, school)
- Main area: Ranked list of players (drag-to-reorder)
- Right sidebar: Selected player details
- Top bar: Current pick, time remaining
- Bottom: Trade controls, pick selection button

**Free Agency Market:**
- Searchable/filterable list of all FAs
- Player cards showing: Position, age, rating, contract demands
- "Make Offer" button
- "Add to Watch List" button
- Market status (teams interested, rumored deals)

**Depth Chart:**
- Visual representation of positions
- Drag-and-drop player assignment
- Color coding (starter, backup, injured)
- Auto-fill button (let coach decide)
- Special teams assignments
- Save changes button

### 6.3 Information Presentation Philosophy

**Transparency:**
- Always show the math (cap calculations visible)
- Tooltips explain complex concepts
- Color coding for quick understanding (green = good, red = bad)
- Charts and graphs where helpful (cap space over time, draft value chart)

**Depth Without Overwhelm:**
- Default to simplified views
- "Advanced" toggles for detailed stats
- Collapsible sections for less-critical info
- Contextual help (? icons with explanations)

**Actionable Insights:**
- Highlight decisions that need to be made
- Suggest actions (e.g., "You have $5M in cap space, consider restructuring Player X")
- Warning indicators (contract expiring, over cap, thin at position)

**Realistic Flavor:**
- Use NFL terminology (not made-up terms)
- Flavor text from agents, coaches, media (keeps it immersive)
- Historical callbacks (e.g., "Best draft since 2012")

### 6.4 Automation & User Control

**Automation Options (All Toggleable):**
- Depth chart management → Coach decides
- Injury management → Medical staff decides
- Scout assignments → Director of College Scouting decides
- Practice squad elevations → Coach decides
- Waiver claims → Automatically claim based on need

**Always User-Controlled:**
- Contract offers and negotiations
- Draft picks
- Trades
- Hiring/firing staff
- Free agency signings
- Salary cap decisions (cuts, restructures)

**Recommended Defaults:**
- New players: Automate depth chart, injuries, scouts
- Experienced players: Manual control for all
- Settings saved per save file

---

## 7. Success Metrics & Design Goals

### 7.1 What Makes This "The Most Realistic GM Sim"

**Metric 1: Cap Accuracy**
- All cap rules match real NFL (proration, dead money, rollover, etc.)
- Restructures function identically to real NFL
- Franchise tag, RFA tenders match CBA exactly

**Metric 2: Strategic Depth**
- No "correct" answers, only tradeoffs
- Short-term vs long-term tension (cap management)
- BPA vs need tension (draft)
- Star power vs depth (roster construction)

**Metric 3: Information Asymmetry**
- Hidden player attributes (work ethic, injury risk) mirror real uncertainty
- Scout quality affects accuracy (GMs don't have perfect info)
- AI draft boards hidden (you don't know who other teams target)

**Metric 4: Consequences**
- Bad contracts have multi-year ramifications
- Poor drafts set franchise back years
- Firing coaches mid-contract is expensive
- Reputation affects future opportunities

**Metric 5: Emergent Storylines**
- Dynasty runs feel earned (sustained smart decisions)
- Rebuilds take realistic time (3-5 years)
- Surprise breakout players (scouting wins)
- Heartbreaking injuries (like real NFL)

### 7.2 Player Engagement Goals

**Engagement Metrics:**
- Time to first decision (< 2 minutes)
- Session length (30-60 minutes average)
- Seasons completed per save file (5+ seasons = success)
- Return rate (players come back after finishing a season)

**Learning Curve:**
- Can start playing without reading manual (tutorial integrated)
- Complexity revealed gradually (advanced features locked until Year 2)
- Mistakes are educational (show impact of bad decisions)

**Emotional Investment:**
- Players care about "their" draft picks (tracking development)
- Rival teams and grudges develop organically
- Tough decisions feel meaningful (cutting beloved veteran)

### 7.3 Replayability Factors

**Variety Between Playthroughs:**
- Different starting teams (32 options)
- Fantasy draft vs real rosters (different roster construction)
- Draft classes randomized (procedurally generated prospects)
- AI personalities vary (some teams easier to trade with)
- Own GM personality emerges (aggressive vs conservative style)

**Long-Term Goals:**
- Build a dynasty (3+ championships)
- Turn around worst team
- Draft a Hall of Fame class
- Never have a losing season (challenging)
- Win with every team (legacy achievement)

---

## 8. Development Roadmap

### 8.1 Phase 0: Foundation (Months 1-2)

**Goals:**
- Database schema design
- Core cap calculation engine
- Basic contract structure
- Foundational UI (navigation, layouts)

**Deliverables:**
- Working database with sample data
- Cap calculator functions (proration, dead money)
- Basic HTML templates with HTMX
- FastAPI endpoints for cap operations

**Success Criteria:**
- Can create contract, calculate cap hit
- Can restructure contract, see new cap hits
- Can cut player, calculate dead money
- UI displays cap information correctly

### 8.2 Phase 1: Core Loop (Months 3-5)

**Goals:**
- Free agency system
- Draft system
- Roster management
- Basic game simulation
- AI opponent framework

**Deliverables:**
- Free agent browsing and signing
- Draft board construction and draft execution
- Roster cuts and depth chart management
- Game simulation with results
- AI teams make basic decisions

**Success Criteria:**
- Can complete full offseason cycle
- Can draft players
- Can play through a season
- AI teams sign FAs and draft reasonably

### 8.3 Phase 2: Career Mode (Months 6-7)

**Goals:**
- Multi-season progression
- Job security and hiring/firing
- Career stats tracking
- Save/load system

**Deliverables:**
- Season advancement with rollover
- Owner review and potential firing
- GM career statistics
- Persistent save files

**Success Criteria:**
- Can play multiple seasons
- Can be fired and hired by new team
- Career stats accumulate correctly
- Can save and resume games

### 8.4 Phase 3: Staff & Development (Months 8-10)

**Goals:**
- Coaching staff management
- Scouting system with accuracy
- Player development system
- Injury system

**Deliverables:**
- Hire/fire coaches and scouts
- Scout reports with varying accuracy
- Player ratings change over time
- Injury occurrence and management

**Success Criteria:**
- Coach quality affects player development
- Scout quality affects draft accuracy
- Young players develop, old players decline
- Injuries occur and impact roster

### 8.5 Phase 4: Polish & Balance (Months 11-12)

**Goals:**
- AI behavior refinement
- UI/UX improvements
- Game balance tuning
- Bug fixes and optimization

**Deliverables:**
- Smarter AI decision-making
- Refined interface based on testing
- Balanced game difficulty
- Performance optimization

**Success Criteria:**
- AI makes realistic decisions
- Game feels fair and challenging
- No major bugs
- Runs smoothly

### 8.6 Phase 5: Advanced Features (Months 13-15)

**Goals:**
- Visual game playback
- Team finances system
- Advanced analytics
- Combine interviews

**Deliverables:**
- Apple Sports style game viewer
- Revenue/expense tracking
- Advanced stats (DVOA, EPA)
- Pre-draft interview system

**Success Criteria:**
- Game playback is engaging
- Finances add strategic layer
- Analytics provide meaningful insights
- Interviews reveal intangibles

### 8.7 Post-Launch (Ongoing)

**Continuous Improvements:**
- Community feedback integration
- Balance patches
- New features based on popularity
- Bug fixes and optimization
- Potential: Multiplayer, modding support, mobile version

---

## 9. Risk Assessment & Mitigation

### 9.1 Technical Risks

**Risk: Database performance with large datasets**
- Mitigation: Proper indexing, caching, query optimization
- Fallback: Limit historical data depth if needed

**Risk: Complex calculations causing bugs**
- Mitigation: Extensive unit testing, edge case testing
- Fallback: Simplified formulas if accuracy vs performance tradeoff needed

**Risk: Save file corruption**
- Mitigation: Multiple auto-save slots, backup system
- Fallback: Manual export/import functionality

### 9.2 Design Risks

**Risk: Too complex for casual players**
- Mitigation: Robust automation options, gradual complexity curve
- Fallback: "Simplified mode" with reduced features

**Risk: Not deep enough for hardcore players**
- Mitigation: Advanced features, detailed stats, "hard mode"
- Fallback: Modding support for community depth additions

**Risk: AI too predictable**
- Mitigation: Personality systems, randomness, learning from player
- Fallback: Clearly communicate AI is not perfect (like real NFL)

### 9.3 Scope Risks

**Risk: Feature creep delaying launch**
- Mitigation: Strict MVP definition, post-launch roadmap
- Fallback: Early access release with core features

**Risk: Real-world data licensing issues**
- Mitigation: Use publicly available data, avoid trademarked assets
- Fallback: Procedurally generated players/teams (fictional league)

**Risk: Balance issues making game unplayable**
- Mitigation: Extensive playtesting, beta testing group
- Fallback: Rapid patch cycle post-launch

---

## 10. Conclusion & Next Steps

### 10.1 Summary

This NFL GM Simulator aims to deliver an unprecedented level of realism and strategic depth in the sports management genre. By faithfully recreating the NFL's salary cap mechanics, free agency rules, draft system, and long-term career progression, the game will challenge players to think like real NFL general managers.

The separation of analytical tools (Cap Laboratory) from execution (negotiations, AI decisions) creates meaningful uncertainty. The staff management layer adds strategic depth beyond simple roster construction. The multi-decade career mode with legacy tracking provides long-term motivation.

### 10.2 Immediate Next Steps

1. **Finalize this scope document** (incorporate any feedback)
2. **Database schema design** (create detailed ERD)
3. **Technical proof-of-concept** (cap calculator, basic contract CRUD)
4. **UI mockups** (wireframe key screens)
5. **Data sourcing plan** (decide on real vs generated data)
6. **Development environment setup** (Cursor, Python, FastAPI, SQLite)
7. **Begin Phase 0 development** (foundation work)

### 10.3 Open Questions for Resolution

1. **Real NFL data licensing**: Can we use team names/logos without license?
   - Consider: Generic "Team A", "Team B" vs "New York Giants"
   - Alternative: Fictional league with realistic mechanics

2. **Player name usage**: Can we use real player names?
   - Consider: Generic "QB #1" vs "Patrick Mahomes"
   - Alternative: Procedurally generated names

3. **Initial season**: Start with 2024 season, 2025 season, or generic Year 1?
   - Consider: Data availability, relevance, maintenance burden

4. **Distribution model**: Free, paid, freemium?
   - Consider: Monetization vs accessibility vs development funding

5. **Platform**: Web-only, desktop app, or both?
   - Consider: Accessibility vs offline play vs development effort

---

**End of Game Scope Document**

This document serves as the definitive reference for the NFL GM Simulator project. All design decisions, feature implementations, and development priorities should align with the vision and principles outlined here. As development progresses, this document may be updated to reflect learnings and necessary pivots, but the core pillars of realism, strategic depth, and authentic GM experience remain sacrosanct.
