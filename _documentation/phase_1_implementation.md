# NFL GM Simulator - Phase 1: Core Game Loop Implementation

**Version:** 1.0  
**Date:** November 16, 2024  
**Prerequisites:** Phase 0 Complete (Database, Cap Engine, UI Framework)

---

## 1. Executive Summary

### 1.1 Phase 1 Goals

Building on the Phase 0 foundation, Phase 1 implements the core game loop that allows players to experience a complete NFL season. By the end of Phase 1, players will be able to:

- ✅ Navigate through all NFL calendar phases (Post-Season → Free Agency → Draft → Season)
- ✅ Sign free agents with realistic negotiation mechanics
- ✅ Execute a full 7-round draft with trading
- ✅ Manage 53-man rosters with cuts and depth charts
- ✅ Simulate games and see results/stats
- ✅ Compete against AI teams making intelligent decisions
- ✅ Complete multiple seasons with proper year-to-year progression

### 1.2 Technical Priorities

**Frontend Components:**
- Free Agency Market browser with filters
- Contract Negotiation UI with offer/counter flow
- Draft Board with drag-and-drop ranking
- Live Draft Room with pick timer
- Roster Management with visual depth chart
- Season Schedule and standings display

**Backend Systems:**
- Player valuation engine
- Contract negotiation logic
- Draft pick trading algorithm
- Game simulation engine
- AI decision-making framework
- Season progression system

### 1.3 Development Timeline

**Weeks 1-3: Free Agency System**
- Market UI and filtering
- Contract offer interface
- Negotiation logic
- AI bidding system

**Weeks 4-6: Draft System**
- Draft board construction
- Live draft interface
- Trading mechanism
- AI draft logic

**Weeks 7-8: Roster Management**
- 53-man roster cuts
- Depth chart UI
- Practice squad system
- Transaction logging

**Weeks 9-10: Game Simulation**
- Schedule generation
- Simulation engine
- Stats tracking
- Standings calculation

**Weeks 11-12: AI & Polish**
- AI personality system
- Season progression
- Testing and balancing
- Bug fixes

---

## 2. Free Agency System

### 2.1 UI Components

#### 2.1.1 Free Agency Hub (`src/app/free-agency/page.tsx`)

```typescript
'use client';
import { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Tabs, Tab,
  Card, CardContent, Chip, Button, TextField,
  Select, MenuItem, FormControl, InputLabel,
  Slider, Stack, IconButton, Tooltip, Paper,
  Dialog, Badge
} from '@mui/material';
import {
  FilterList, Search, Sort, Star, TrendingUp,
  AttachMoney, Timeline, Groups, CheckCircle
} from '@mui/icons-material';
import { FreeAgentCard } from '@/components/freeagency/FreeAgentCard';
import { MarketOverview } from '@/components/freeagency/MarketOverview';
import { NegotiationDialog } from '@/components/freeagency/NegotiationDialog';
import { TeamCapSpace } from '@/components/cap/TeamCapSpace';

interface FreeAgent {
  player_id: number;
  name: string;
  position: string;
  age: number;
  overall_rating: number;
  fa_type: 'UFA' | 'RFA' | 'ERFA';
  desired_apy: number; // Average per year
  desired_years: number;
  desired_guaranteed: number;
  interest_level: number; // 0-100
  best_offer?: {
    team_id: number;
    total_value: number;
    years: number;
  };
}

export default function FreeAgencyPage() {
  const [freeAgents, setFreeAgents] = useState<FreeAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<FreeAgent[]>([]);
  const [activeTab, setActiveTab] = useState(0); // 0=All, 1=Offense, 2=Defense, 3=Watchlist
  const [filters, setFilters] = useState({
    position: 'ALL',
    minRating: 65,
    maxAge: 40,
    faType: 'ALL',
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState('overall_rating');
  const [selectedPlayer, setSelectedPlayer] = useState<FreeAgent | null>(null);
  const [negotiationOpen, setNegotiationOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [teamCapSpace, setTeamCapSpace] = useState(0);

  useEffect(() => {
    fetchFreeAgents();
    fetchTeamCapSpace();
  }, []);

  const fetchFreeAgents = async () => {
    const response = await fetch('/api/free-agents');
    const data = await response.json();
    setFreeAgents(data);
    setFilteredAgents(data);
  };

  const fetchTeamCapSpace = async () => {
    const response = await fetch('/api/cap?teamId=1'); // Player's team
    const data = await response.json();
    setTeamCapSpace(data.availableCapSpace);
  };

  const applyFilters = () => {
    let filtered = [...freeAgents];

    // Position filter
    if (filters.position !== 'ALL') {
      filtered = filtered.filter(p => p.position === filters.position);
    }

    // Rating filter
    filtered = filtered.filter(p => p.overall_rating >= filters.minRating);

    // Age filter
    filtered = filtered.filter(p => p.age <= filters.maxAge);

    // FA Type filter
    if (filters.faType !== 'ALL') {
      filtered = filtered.filter(p => p.fa_type === filters.faType);
    }

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Tab filter
    if (activeTab === 1) { // Offense
      filtered = filtered.filter(p => 
        ['QB', 'RB', 'WR', 'TE', 'OL'].includes(p.position)
      );
    } else if (activeTab === 2) { // Defense
      filtered = filtered.filter(p => 
        ['DL', 'LB', 'CB', 'S'].includes(p.position)
      );
    } else if (activeTab === 3) { // Watchlist
      filtered = filtered.filter(p => watchlist.includes(p.player_id));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'overall_rating':
          return b.overall_rating - a.overall_rating;
        case 'age':
          return a.age - b.age;
        case 'value':
          return a.desired_apy - b.desired_apy;
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  };

  const handleMakeOffer = (player: FreeAgent) => {
    setSelectedPlayer(player);
    setNegotiationOpen(true);
  };

  return (
    <Container maxWidth="xl">
      {/* Header with Cap Space */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" gutterBottom>
              Free Agency
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Legal Tampering Period - March 10-12
            </Typography>
          </Grid>
          <Grid item>
            <TeamCapSpace 
              availableSpace={teamCapSpace}
              totalCap={279200000}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Market Overview */}
      <MarketOverview 
        totalFreeAgents={freeAgents.length}
        topSignings={[]} // Recent signings
        hottestPositions={['QB', 'EDGE', 'WR']}
      />

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab label={`All (${freeAgents.length})`} />
        <Tab label="Offense" />
        <Tab label="Defense" />
        <Tab 
          label={
            <Badge badgeContent={watchlist.length} color="primary">
              Watchlist
            </Badge>
          } 
        />
      </Tabs>

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search players..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              InputProps={{ startAdornment: <Search /> }}
            />
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Position</InputLabel>
              <Select 
                value={filters.position}
                onChange={(e) => setFilters({...filters, position: e.target.value})}
              >
                <MenuItem value="ALL">All Positions</MenuItem>
                <MenuItem value="QB">Quarterback</MenuItem>
                <MenuItem value="RB">Running Back</MenuItem>
                <MenuItem value="WR">Wide Receiver</MenuItem>
                <MenuItem value="TE">Tight End</MenuItem>
                {/* Add all positions */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>FA Type</InputLabel>
              <Select
                value={filters.faType}
                onChange={(e) => setFilters({...filters, faType: e.target.value})}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="UFA">UFA</MenuItem>
                <MenuItem value="RFA">RFA</MenuItem>
                <MenuItem value="ERFA">ERFA</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="caption">Min Rating: {filters.minRating}</Typography>
            <Slider
              value={filters.minRating}
              onChange={(e, v) => setFilters({...filters, minRating: v as number})}
              min={54}
              max={99}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="overall_rating">Rating</MenuItem>
                <MenuItem value="age">Age</MenuItem>
                <MenuItem value="value">Value</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={1}>
            <Button 
              variant="contained" 
              onClick={applyFilters}
              startIcon={<FilterList />}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Free Agent Grid */}
      <Grid container spacing={2}>
        {filteredAgents.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player.player_id}>
            <FreeAgentCard
              player={player}
              onMakeOffer={() => handleMakeOffer(player)}
              onToggleWatchlist={() => {
                setWatchlist(prev => 
                  prev.includes(player.player_id)
                    ? prev.filter(id => id !== player.player_id)
                    : [...prev, player.player_id]
                );
              }}
              isWatchlisted={watchlist.includes(player.player_id)}
              canAfford={player.desired_apy <= teamCapSpace}
            />
          </Grid>
        ))}
      </Grid>

      {/* Negotiation Dialog */}
      <NegotiationDialog
        open={negotiationOpen}
        onClose={() => setNegotiationOpen(false)}
        player={selectedPlayer}
        teamCapSpace={teamCapSpace}
        onOfferAccepted={(contract) => {
          // Handle successful signing
          console.log('Contract signed!', contract);
          fetchFreeAgents(); // Refresh list
          fetchTeamCapSpace(); // Update cap
        }}
      />
    </Container>
  );
}
```

#### 2.1.2 Contract Negotiation Dialog (`src/components/freeagency/NegotiationDialog.tsx`)

```typescript
'use client';
import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, Typography, Box, Stepper,
  Step, StepLabel, Slider, Alert, Card, CardContent,
  LinearProgress, Chip, Stack, Divider
} from '@mui/material';
import { AttachMoney, Timeline, Shield, TrendingUp } from '@mui/icons-material';

interface NegotiationDialogProps {
  open: boolean;
  onClose: () => void;
  player: any;
  teamCapSpace: number;
  onOfferAccepted: (contract: any) => void;
}

export function NegotiationDialog({
  open, onClose, player, teamCapSpace, onOfferAccepted
}: NegotiationDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [offer, setOffer] = useState({
    years: 3,
    totalValue: 0,
    guaranteedMoney: 0,
    signingBonus: 0,
    structure: 'frontloaded' // 'frontloaded', 'backloaded', 'even'
  });
  const [playerResponse, setPlayerResponse] = useState<any>(null);
  const [negotiationHistory, setNegotiationHistory] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = ['Initial Offer', 'Negotiation', 'Final Terms', 'Contract Signed'];

  const calculateAPY = () => offer.totalValue / offer.years;
  const calculateYear1Cap = () => {
    // Simplified calculation
    const bonusProration = offer.signingBonus / Math.min(offer.years, 5);
    const baseSalary = (offer.totalValue - offer.signingBonus) / offer.years;
    return bonusProration + baseSalary;
  };

  const submitOffer = async () => {
    setIsProcessing(true);
    
    const response = await fetch('/api/contracts/negotiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_id: player.player_id,
        offer
      })
    });
    
    const result = await response.json();
    setPlayerResponse(result);
    setNegotiationHistory([...negotiationHistory, { offer, response: result }]);
    setIsProcessing(false);

    if (result.decision === 'accept') {
      setActiveStep(3);
      onOfferAccepted(result.contract);
    } else if (result.decision === 'counter') {
      setActiveStep(1);
      // Update offer with counter
      setOffer({
        ...offer,
        totalValue: result.counter.totalValue,
        guaranteedMoney: result.counter.guaranteedMoney
      });
    } else {
      // Declined - negotiation failed
      setActiveStep(1);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Contract Negotiation: {player?.name}
        <Typography variant="subtitle2" color="text.secondary">
          {player?.position} • {player?.age} years old • {player?.overall_rating} OVR
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Market Value Reference */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            Market Value: ${(player?.desired_apy || 0).toLocaleString()}/year • 
            {player?.desired_years} years • 
            ${(player?.desired_guaranteed || 0).toLocaleString()} guaranteed
          </Typography>
        </Alert>

        {/* Offer Builder */}
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contract Terms
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>Years: {offer.years}</Typography>
                  <Slider
                    value={offer.years}
                    onChange={(e, v) => setOffer({...offer, years: v as number})}
                    min={1}
                    max={7}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Total Value"
                  type="number"
                  value={offer.totalValue}
                  onChange={(e) => setOffer({...offer, totalValue: parseInt(e.target.value)})}
                  InputProps={{
                    startAdornment: '$',
                    endAdornment: <Typography variant="caption">total</Typography>
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Guaranteed Money"
                  type="number"
                  value={offer.guaranteedMoney}
                  onChange={(e) => setOffer({...offer, guaranteedMoney: parseInt(e.target.value)})}
                  InputProps={{
                    startAdornment: '$',
                    endAdornment: <Typography variant="caption">guaranteed</Typography>
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Signing Bonus"
                  type="number"
                  value={offer.signingBonus}
                  onChange={(e) => setOffer({...offer, signingBonus: parseInt(e.target.value)})}
                  InputProps={{
                    startAdornment: '$',
                    endAdornment: <Typography variant="caption">signing bonus</Typography>
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contract Analysis
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Average Per Year
                    </Typography>
                    <Typography variant="h5">
                      ${calculateAPY().toLocaleString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Year 1 Cap Hit
                    </Typography>
                    <Typography variant="h5">
                      ${calculateYear1Cap().toLocaleString()}
                    </Typography>
                    {calculateYear1Cap() > teamCapSpace && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        Exceeds available cap space!
                      </Alert>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Guaranteed %
                    </Typography>
                    <Typography variant="h5">
                      {Math.round((offer.guaranteedMoney / offer.totalValue) * 100)}%
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Player Interest Meter */}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Likelihood to Accept
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateAcceptanceProbability()}
                      color={calculateAcceptanceProbability() > 70 ? 'success' : 'warning'}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Negotiation History */}
        {negotiationHistory.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Negotiation History
            </Typography>
            {negotiationHistory.map((item, idx) => (
              <Card key={idx} sx={{ mb: 1 }}>
                <CardContent>
                  <Grid container justifyContent="space-between">
                    <Grid item>
                      <Typography variant="subtitle2">
                        Round {idx + 1}: ${item.offer.totalValue.toLocaleString()} / {item.offer.years} years
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Chip 
                        label={item.response.decision} 
                        color={item.response.decision === 'accept' ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  {item.response.message && (
                    <Typography variant="caption" color="text.secondary">
                      Agent: "{item.response.message}"
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={submitOffer}
          disabled={isProcessing || calculateYear1Cap() > teamCapSpace}
        >
          Submit Offer
        </Button>
      </DialogActions>
    </Dialog>
  );

  function calculateAcceptanceProbability() {
    if (!player) return 0;
    const apyRatio = calculateAPY() / player.desired_apy;
    const guaranteedRatio = offer.guaranteedMoney / player.desired_guaranteed;
    const yearsMatch = Math.abs(offer.years - player.desired_years) <= 1 ? 1 : 0.8;
    
    return Math.min(100, Math.round(((apyRatio + guaranteedRatio) / 2) * yearsMatch * 100));
  }
}
```

### 2.2 Backend Logic

#### 2.2.1 Contract Negotiation API (`src/app/api/contracts/negotiate/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/client';
import { evaluateOffer, generateCounterOffer } from '@/lib/contracts/negotiation';

export async function POST(request: NextRequest) {
  const { player_id, offer } = await request.json();
  const db = getDatabase();

  // Get player and their demands
  const player = db.prepare(`
    SELECT p.*, fa.desired_years, fa.desired_total_value, fa.desired_guaranteed
    FROM players p
    JOIN free_agents fa ON p.player_id = fa.player_id
    WHERE p.player_id = ?
  `).get(player_id);

  // Get competing offers
  const competingOffers = db.prepare(`
    SELECT * FROM fa_offers 
    WHERE player_id = ? AND status = 'pending'
    ORDER BY total_value DESC
  `).all(player_id);

  // Evaluate offer
  const evaluation = evaluateOffer(player, offer, competingOffers);

  if (evaluation.score >= 90) {
    // Accept offer
    return NextResponse.json({
      decision: 'accept',
      message: 'We have a deal! Looking forward to joining your team.',
      contract: createContract(player_id, offer)
    });
  } else if (evaluation.score >= 70 && evaluation.negotiationRound < 3) {
    // Counter offer
    const counter = generateCounterOffer(player, offer, evaluation);
    return NextResponse.json({
      decision: 'counter',
      message: evaluation.message,
      counter,
      negotiationRound: evaluation.negotiationRound + 1
    });
  } else {
    // Decline
    return NextResponse.json({
      decision: 'decline',
      message: 'This offer doesn't meet our expectations. We'll explore other options.',
      reason: evaluation.reason
    });
  }
}
```

#### 2.2.2 Player Valuation Engine (`src/lib/contracts/valuation.ts`)

```typescript
interface PlayerDemands {
  apy: number;
  years: number;
  guaranteed: number;
  priority: 'money' | 'years' | 'winning' | 'hometown';
}

export function calculatePlayerValue(player: any): PlayerDemands {
  const baseValue = getPositionBaseValue(player.position, player.overall_rating);
  
  // Age modifier
  const ageModifier = getAgeModifier(player.age, player.position);
  
  // Performance modifier (based on recent stats if available)
  const performanceModifier = 1.0; // TODO: Calculate from stats
  
  // Market modifier (supply/demand at position)
  const marketModifier = getMarketModifier(player.position);
  
  const apy = Math.round(baseValue * ageModifier * performanceModifier * marketModifier);
  
  // Years based on age and position
  const years = calculateContractYears(player.age, player.position);
  
  // Guaranteed money (typically 40-70% for good players)
  const guaranteedPct = Math.min(0.7, 0.3 + (player.overall_rating - 70) * 0.02);
  const guaranteed = Math.round(apy * years * guaranteedPct);
  
  // Determine priority based on age and rating
  let priority: 'money' | 'years' | 'winning' | 'hometown' = 'money';
  if (player.age > 30) priority = 'years';
  if (player.overall_rating > 85 && player.age > 28) priority = 'winning';
  
  return { apy, years, guaranteed, priority };
}

function getPositionBaseValue(position: string, rating: number): number {
  // Position-specific salary scales (2025 estimates)
  const positionMultipliers: Record<string, number> = {
    'QB': 2.5,
    'EDGE': 1.8,
    'WR': 1.6,
    'CB': 1.5,
    'OT': 1.5,
    'DT': 1.3,
    'S': 1.2,
    'LB': 1.2,
    'OG': 1.0,
    'C': 1.0,
    'TE': 1.0,
    'RB': 0.8,
    'K': 0.5,
    'P': 0.5
  };

  const multiplier = positionMultipliers[position] || 1.0;
  
  // Rating to base salary curve (exponential for elite players)
  let baseSalary = 0;
  if (rating >= 90) {
    baseSalary = 25000000; // Elite tier
  } else if (rating >= 85) {
    baseSalary = 18000000; // Pro Bowl tier
  } else if (rating >= 80) {
    baseSalary = 12000000; // Above average starter
  } else if (rating >= 75) {
    baseSalary = 8000000;  // Average starter
  } else if (rating >= 70) {
    baseSalary = 5000000;  // Below average starter
  } else {
    baseSalary = 2000000;  // Backup/depth
  }

  return baseSalary * multiplier;
}

function getAgeModifier(age: number, position: string): number {
  // Peak ages vary by position
  const peakAges: Record<string, [number, number]> = {
    'QB': [27, 33],
    'RB': [23, 27],
    'WR': [26, 30],
    'TE': [26, 31],
    'OL': [27, 32],
    'DL': [26, 30],
    'LB': [25, 29],
    'CB': [25, 29],
    'S': [26, 30]
  };

  const [peakStart, peakEnd] = peakAges[position] || [26, 30];
  
  if (age < peakStart) {
    // Young player discount
    return 0.85 + (age - 22) * 0.03;
  } else if (age <= peakEnd) {
    // Peak value
    return 1.0;
  } else {
    // Age decline
    const yearsPastPeak = age - peakEnd;
    return Math.max(0.6, 1.0 - yearsPastPeak * 0.08);
  }
}

function calculateContractYears(age: number, position: string): number {
  if (position === 'QB' && age < 30) return 4;
  if (position === 'RB' && age > 26) return 2;
  
  if (age < 26) return 4;
  if (age < 29) return 3;
  if (age < 32) return 2;
  return 1;
}

function getMarketModifier(position: string): number {
  // TODO: Calculate based on current FA supply/demand
  return 1.0;
}
```

---

## 3. Draft System

### 3.1 Draft Board Construction

#### 3.1.1 Draft Board UI (`src/app/draft/board/page.tsx`)

```typescript
'use client';
import { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Paper, Typography,
  IconButton, TextField, Chip, Button,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  Tabs, Tab, Card, CardContent, Tooltip,
  ToggleButtonGroup, ToggleButton, Badge,
  Drawer, Divider
} from '@mui/material';
import {
  DragIndicator, Star, StarBorder, Flag,
  FilterList, Search, ViewList, ViewModule,
  ArrowUpward, ArrowDownward, Groups
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface DraftProspect {
  prospect_id: number;
  name: string;
  position: string;
  college: string;
  overall_rating: number; // Scout's assessment
  grade: string; // '1st Round', '2nd-3rd Round', etc.
  height: string;
  weight: number;
  age: number;
  combine_stats?: {
    forty_yard?: number;
    bench_press?: number;
    vertical?: number;
    broad_jump?: number;
    three_cone?: number;
    shuttle?: number;
  };
  scout_notes?: string;
  character_grade?: number;
  injury_flags?: string[];
  comparison?: string; // NFL player comparison
}

export default function DraftBoardPage() {
  const [prospects, setProspects] = useState<DraftProspect[]>([]);
  const [draftBoard, setDraftBoard] = useState<DraftProspect[]>([]);
  const [filters, setFilters] = useState({
    position: 'ALL',
    grade: 'ALL',
    searchTerm: ''
  });
  const [viewMode, setViewMode] = useState<'board' | 'position'>('board');
  const [selectedProspect, setSelectedProspect] = useState<DraftProspect | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    const response = await fetch('/api/draft/prospects');
    const data = await response.json();
    setProspects(data);
    setDraftBoard(data); // Initialize board with default order
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(draftBoard);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDraftBoard(items);
    saveDraftBoard(items);
  };

  const saveDraftBoard = async (board: DraftProspect[]) => {
    await fetch('/api/draft/board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board: board.map((p, idx) => ({
        prospect_id: p.prospect_id,
        rank: idx + 1
      }))})
    });
  };

  const getPositionalRankings = () => {
    const positions = ['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C', 'EDGE', 'DT', 'LB', 'CB', 'S'];
    return positions.map(pos => ({
      position: pos,
      prospects: draftBoard.filter(p => p.position === pos).slice(0, 10)
    }));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Draft Board Construction
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Rank prospects for the upcoming NFL Draft
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search prospects..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              InputProps={{ startAdornment: <Search /> }}
            />
          </Grid>
          <Grid item xs={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="board">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="position">
                <ViewModule />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Button variant="outlined" sx={{ mr: 1 }}>
              Run Mock Draft
            </Button>
            <Button variant="contained">
              Save Board
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Board */}
        <Grid item xs={8}>
          {viewMode === 'board' ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Big Board - Top 250
              </Typography>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="draftboard">
                  {(provided) => (
                    <List {...provided.droppableProps} ref={provided.innerRef}>
                      {draftBoard.slice(0, 250).map((prospect, index) => (
                        <Draggable 
                          key={prospect.prospect_id} 
                          draggableId={`${prospect.prospect_id}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                mb: 0.5,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
                                <DragIndicator />
                              </Box>
                              <Box sx={{ mr: 2, minWidth: 40 }}>
                                <Typography variant="h6">
                                  {index + 1}
                                </Typography>
                              </Box>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" fontWeight="bold">
                                      {prospect.name}
                                    </Typography>
                                    <Chip label={prospect.position} size="small" />
                                    <Typography variant="caption" color="text.secondary">
                                      {prospect.college}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                    <Chip 
                                      label={prospect.grade} 
                                      size="small"
                                      color={prospect.grade.includes('1st') ? 'error' : 'default'}
                                    />
                                    <Typography variant="caption">
                                      {prospect.height} • {prospect.weight} lbs • Age {prospect.age}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <IconButton 
                                  onClick={() => {
                                    setSelectedProspect(prospect);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <Star />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            </Paper>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Positional Rankings
              </Typography>
              <Grid container spacing={2}>
                {getPositionalRankings().map(({ position, prospects }) => (
                  <Grid item xs={4} key={position}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {position}
                        </Typography>
                        <List dense>
                          {prospects.map((p, idx) => (
                            <ListItem key={p.prospect_id}>
                              <ListItemText 
                                primary={`${idx + 1}. ${p.name}`}
                                secondary={p.college}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* Prospect Details Sidebar */}
        <Grid item xs={4}>
          <ProspectDetailsPanel prospect={selectedProspect} />
        </Grid>
      </Grid>
    </Container>
  );
}

function ProspectDetailsPanel({ prospect }: { prospect: DraftProspect | null }) {
  if (!prospect) {
    return (
      <Paper sx={{ p: 2, minHeight: 400 }}>
        <Typography color="text.secondary">
          Select a prospect to view details
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {prospect.name}
      </Typography>
      {/* Add detailed prospect information */}
    </Paper>
  );
}
```

### 3.2 Live Draft Room

#### 3.2.1 Draft Room UI (`src/app/draft/live/page.tsx`)

```typescript
'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Grid, Paper, Typography,
  Button, Card, CardContent, List, ListItem,
  ListItemText, Chip, LinearProgress, Avatar,
  Alert, IconButton, Badge, Tabs, Tab
} from '@mui/material';
import {
  Timer, SwapVert, CheckCircle, Cancel,
  TrendingUp, Warning
} from '@mui/icons-material';

interface DraftPick {
  pick_number: number;
  round: number;
  team_id: number;
  team_name: string;
  player_selected?: {
    prospect_id: number;
    name: string;
    position: string;
    college: string;
    rating: number;
  };
}

interface TradeOffer {
  from_team: string;
  offering_picks: number[];
  wanting_pick: number;
  value_differential: number;
}

export default function LiveDraftPage() {
  const [currentPick, setCurrentPick] = useState<DraftPick | null>(null);
  const [draftBoard, setDraftBoard] = useState<any[]>([]);
  const [recentPicks, setRecentPicks] = useState<DraftPick[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [isOnClock, setIsOnClock] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initializeDraft();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOnClock && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoPick();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOnClock, timeRemaining]);

  const initializeDraft = async () => {
    // Fetch current draft state
    const response = await fetch('/api/draft/current');
    const data = await response.json();
    setCurrentPick(data.currentPick);
    setRecentPicks(data.recentPicks);
    setIsOnClock(data.currentPick.team_id === 1); // Player's team ID
    
    // Load draft board
    const boardResponse = await fetch('/api/draft/board');
    const boardData = await boardResponse.json();
    setDraftBoard(boardData);
  };

  const makePick = async (prospect: any) => {
    const response = await fetch('/api/draft/pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pick_number: currentPick?.pick_number,
        prospect_id: prospect.prospect_id
      })
    });

    if (response.ok) {
      // Move to next pick
      advanceToNextPick();
    }
  };

  const handleAutoPick = () => {
    // Pick best player available
    const bpa = draftBoard.find(p => !p.drafted);
    if (bpa) {
      makePick(bpa);
    }
  };

  const advanceToNextPick = async () => {
    const response = await fetch('/api/draft/advance');
    const data = await response.json();
    setCurrentPick(data.currentPick);
    setRecentPicks(data.recentPicks);
    setIsOnClock(data.currentPick.team_id === 1);
    setTimeRemaining(300);
    
    // Check for trade offers
    if (data.tradeOffers) {
      setTradeOffers(data.tradeOffers);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="xl">
      {/* Draft Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">
              2025 NFL Draft - Round {currentPick?.round}, Pick {currentPick?.pick_number}
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                icon={<Timer />}
                label={formatTime(timeRemaining)}
                color={timeRemaining < 60 ? 'error' : 'default'}
              />
              {isOnClock && (
                <Alert severity="warning">You are on the clock!</Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {/* Available Prospects */}
        <Grid item xs={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Prospects
            </Typography>
            <Tabs value={0}>
              <Tab label="Best Available" />
              <Tab label="By Position" />
              <Tab label="Your Board" />
            </Tabs>
            
            <List>
              {draftBoard.filter(p => !p.drafted).slice(0, 20).map((prospect, idx) => (
                <ListItem 
                  key={prospect.prospect_id}
                  sx={{
                    bgcolor: idx === 0 ? 'action.selected' : 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ mr: 2, minWidth: 30 }}>
                    <Typography variant="h6">
                      {idx + 1}
                    </Typography>
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight="bold">
                          {prospect.name}
                        </Typography>
                        <Chip label={prospect.position} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {prospect.college}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Chip label={prospect.grade} size="small" color="primary" />
                        <Typography variant="caption">
                          {prospect.height} • {prospect.weight} lbs
                        </Typography>
                        {prospect.bestAvailable && (
                          <Chip 
                            icon={<TrendingUp />}
                            label="BPA" 
                            size="small" 
                            color="success"
                          />
                        )}
                      </Box>
                    }
                  />
                  {isOnClock && (
                    <Button
                      variant="contained"
                      onClick={() => makePick(prospect)}
                      disabled={!isOnClock}
                    >
                      Draft
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Draft Tracker & Trade Offers */}
        <Grid item xs={4}>
          {/* Recent Picks */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Picks
            </Typography>
            <List dense>
              {recentPicks.map((pick) => (
                <ListItem key={pick.pick_number}>
                  <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                    {pick.pick_number}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <strong>{pick.team_name}</strong> selects {pick.player_selected?.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption">
                        {pick.player_selected?.position} - {pick.player_selected?.college}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Trade Offers */}
          {tradeOffers.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Trade Offers
                <Badge badgeContent={tradeOffers.length} color="error" sx={{ ml: 2 }} />
              </Typography>
              {tradeOffers.map((offer, idx) => (
                <Card key={idx} sx={{ mb: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2">
                      {offer.from_team} wants Pick #{offer.wanting_pick}
                    </Typography>
                    <Typography variant="body2">
                      Offering: Picks {offer.offering_picks.join(', ')}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color={offer.value_differential > 0 ? 'success.main' : 'error.main'}
                    >
                      Value: {offer.value_differential > 0 ? '+' : ''}{offer.value_differential} points
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button size="small" color="success" sx={{ mr: 1 }}>
                        Accept
                      </Button>
                      <Button size="small" color="error">
                        Decline
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
```

---

## 4. Roster Management System

### 4.1 Roster Cuts UI (`src/app/roster/cuts/page.tsx`)

```typescript
'use client';
import { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Paper, Typography,
  Button, Card, CardContent, List, ListItem,
  ListItemText, Chip, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow,
  LinearProgress, Divider, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { 
  Warning, CheckCircle, Delete, SwapHoriz,
  TrendingDown, AttachMoney, Groups
} from '@mui/icons-material';

interface Player {
  player_id: number;
  name: string;
  position: string;
  age: number;
  overall_rating: number;
  cap_hit: number;
  dead_money: number;
  cap_savings: number;
  roster_status: string;
  injury_status?: string;
}

export default function RosterCutsPage() {
  const [roster, setRoster] = useState<Player[]>([]);
  const [cutCandidates, setCutCandidates] = useState<Player[]>([]);
  const [practiceSquad, setPracticeSquad] = useState<Player[]>([]);
  const [currentRosterSize, setCurrentRosterSize] = useState(90);
  const [targetRosterSize] = useState(53);
  const [capSpaceSaved, setCapSpaceSaved] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean; player: Player | null}>({
    open: false,
    player: null
  });

  const positionLimits = {
    QB: { min: 2, max: 3 },
    RB: { min: 3, max: 5 },
    WR: { min: 5, max: 7 },
    TE: { min: 3, max: 4 },
    OL: { min: 8, max: 10 },
    DL: { min: 6, max: 9 },
    LB: { min: 6, max: 8 },
    CB: { min: 5, max: 7 },
    S: { min: 4, max: 5 },
    K: { min: 1, max: 1 },
    P: { min: 1, max: 1 },
    LS: { min: 1, max: 1 }
  };

  const cutPlayer = (player: Player) => {
    setCutCandidates([...cutCandidates, player]);
    setRoster(roster.filter(p => p.player_id !== player.player_id));
    setCapSpaceSaved(prev => prev + player.cap_savings);
    setCurrentRosterSize(prev => prev - 1);
  };

  const undoCut = (player: Player) => {
    setCutCandidates(cutCandidates.filter(p => p.player_id !== player.player_id));
    setRoster([...roster, player]);
    setCapSpaceSaved(prev => prev - player.cap_savings);
    setCurrentRosterSize(prev => prev + 1);
  };

  const moveToPs = (player: Player) => {
    if (practiceSquad.length >= 16) {
      alert('Practice squad is full (16 players max)');
      return;
    }
    setCutCandidates(cutCandidates.filter(p => p.player_id !== player.player_id));
    setPracticeSquad([...practiceSquad, player]);
  };

  const submitCuts = async () => {
    const response = await fetch('/api/roster/cuts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cuts: cutCandidates.map(p => p.player_id),
        practiceSquad: practiceSquad.map(p => p.player_id)
      })
    });

    if (response.ok) {
      // Navigate to next phase
      window.location.href = '/season';
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Final Roster Cuts
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You must cut your roster from {currentRosterSize} to {targetRosterSize} players by 4:00 PM ET
        </Alert>
        
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Current Roster Size
                </Typography>
                <Typography variant="h4" color={currentRosterSize > targetRosterSize ? 'error' : 'success'}>
                  {currentRosterSize} / {targetRosterSize}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (targetRosterSize / currentRosterSize) * 100)}
                  color={currentRosterSize > targetRosterSize ? 'error' : 'success'}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Players to Cut
                </Typography>
                <Typography variant="h4" color="error">
                  {Math.max(0, currentRosterSize - targetRosterSize)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Cap Space Saved
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${(capSpaceSaved / 1000000).toFixed(1)}M
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Practice Squad
                </Typography>
                <Typography variant="h4">
                  {practiceSquad.length} / 16
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        {/* Current Roster */}
        <Grid item xs={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Roster
            </Typography>
            
            {/* Position Groups */}
            {Object.entries(
              roster.reduce((groups, player) => {
                if (!groups[player.position]) groups[player.position] = [];
                groups[player.position].push(player);
                return groups;
              }, {} as Record<string, Player[]>)
            ).map(([position, players]) => (
              <Box key={position} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {position}
                  </Typography>
                  <Chip 
                    label={`${players.length} players`}
                    size="small"
                    sx={{ ml: 1 }}
                    color={
                      players.length < positionLimits[position]?.min ? 'error' :
                      players.length > positionLimits[position]?.max ? 'warning' :
                      'default'
                    }
                  />
                  {positionLimits[position] && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (Recommended: {positionLimits[position].min}-{positionLimits[position].max})
                    </Typography>
                  )}
                </Box>
                
                <List dense>
                  {players
                    .sort((a, b) => b.overall_rating - a.overall_rating)
                    .map(player => (
                      <ListItem 
                        key={player.player_id}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            onClick={() => setConfirmDialog({ open: true, player })}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        }
                        sx={{
                          bgcolor: 'background.paper',
                          mb: 0.5,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>
                                {player.name}
                              </Typography>
                              <Chip label={`${player.overall_rating} OVR`} size="small" />
                              {player.injury_status && (
                                <Chip 
                                  label={player.injury_status} 
                                  size="small" 
                                  color="error"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption">
                              Age {player.age} • 
                              Cap Hit: ${(player.cap_hit / 1000000).toFixed(1)}M • 
                              Savings: ${(player.cap_savings / 1000000).toFixed(1)}M
                              {player.dead_money > 0 && ` • Dead: ${(player.dead_money / 1000000).toFixed(1)}M`}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))
                  }
                </List>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Cut List & Practice Squad */}
        <Grid item xs={4}>
          {/* Players Being Cut */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom color="error">
              Players Being Cut ({cutCandidates.length})
            </Typography>
            <List dense>
              {cutCandidates.map(player => (
                <ListItem key={player.player_id}>
                  <ListItemText
                    primary={`${player.name} (${player.position})`}
                    secondary={`${player.overall_rating} OVR • Saves ${(player.cap_savings / 1000000).toFixed(1)}M`}
                  />
                  <Button size="small" onClick={() => undoCut(player)}>
                    Undo
                  </Button>
                  <Button size="small" onClick={() => moveToPs(player)}>
                    PS
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Practice Squad */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Practice Squad ({practiceSquad.length}/16)
            </Typography>
            <List dense>
              {practiceSquad.map(player => (
                <ListItem key={player.player_id}>
                  <ListItemText
                    primary={`${player.name} (${player.position})`}
                    secondary={`${player.overall_rating} OVR • Age ${player.age}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Submit Button */}
          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={submitCuts}
              disabled={currentRosterSize !== targetRosterSize}
            >
              Submit Final Roster
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, player: null })}>
        <DialogTitle>Confirm Cut</DialogTitle>
        <DialogContent>
          {confirmDialog.player && (
            <Box>
              <Typography>
                Are you sure you want to cut {confirmDialog.player.name}?
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Cap Savings: ${(confirmDialog.player.cap_savings / 1000000).toFixed(2)}M
                </Typography>
                {confirmDialog.player.dead_money > 0 && (
                  <Typography variant="body2" color="error">
                    Dead Money: ${(confirmDialog.player.dead_money / 1000000).toFixed(2)}M
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, player: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (confirmDialog.player) {
                cutPlayer(confirmDialog.player);
                setConfirmDialog({ open: false, player: null });
              }
            }}
            color="error"
            variant="contained"
          >
            Cut Player
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
```

---

## 5. Game Simulation Engine

### 5.1 Simulation Logic (`src/lib/simulation/gameEngine.ts`)

```typescript
import { getDatabase } from '@/lib/database/client';

interface Team {
  team_id: number;
  name: string;
  offense_rating: number;
  defense_rating: number;
  special_teams_rating: number;
  home_field: boolean;
}

interface Player {
  player_id: number;
  name: string;
  position: string;
  overall_rating: number;
}

interface GameResult {
  home_score: number;
  away_score: number;
  home_stats: TeamStats;
  away_stats: TeamStats;
  player_stats: PlayerStats[];
  injuries: Injury[];
  summary: string;
}

interface TeamStats {
  passing_yards: number;
  rushing_yards: number;
  total_yards: number;
  turnovers: number;
  time_of_possession: string;
  third_down_pct: number;
  penalties: number;
}

interface PlayerStats {
  player_id: number;
  passing?: { attempts: number; completions: number; yards: number; tds: number; ints: number };
  rushing?: { attempts: number; yards: number; tds: number };
  receiving?: { targets: number; receptions: number; yards: number; tds: number };
  defense?: { tackles: number; sacks: number; ints: number; ff: number };
}

interface Injury {
  player_id: number;
  injury_type: string;
  severity: 'Questionable' | 'Doubtful' | 'Out' | 'IR';
  expected_weeks: number;
}

export class GameSimulator {
  private db = getDatabase();
  
  simulateGame(homeTeamId: number, awayTeamId: number, week: number): GameResult {
    // Get team data
    const homeTeam = this.getTeamData(homeTeamId, true);
    const awayTeam = this.getTeamData(awayTeamId, false);
    
    // Calculate win probability
    const winProb = this.calculateWinProbability(homeTeam, awayTeam);
    
    // Simulate score
    const { homeScore, awayScore } = this.simulateScore(homeTeam, awayTeam, winProb);
    
    // Generate team stats
    const homeStats = this.generateTeamStats(homeTeam, homeScore, awayScore);
    const awayStats = this.generateTeamStats(awayTeam, awayScore, homeScore);
    
    // Generate player stats
    const playerStats = this.generatePlayerStats(homeTeam, awayTeam, homeStats, awayStats);
    
    // Simulate injuries
    const injuries = this.simulateInjuries(homeTeamId, awayTeamId);
    
    // Create game summary
    const summary = this.createGameSummary(homeTeam, awayTeam, homeScore, awayScore);
    
    // Save to database
    this.saveGameResult({
      home_score: homeScore,
      away_score: awayScore,
      home_stats: homeStats,
      away_stats: awayStats,
      player_stats: playerStats,
      injuries,
      summary
    });
    
    return {
      home_score: homeScore,
      away_score: awayScore,
      home_stats: homeStats,
      away_stats: awayStats,
      player_stats: playerStats,
      injuries,
      summary
    };
  }
  
  private getTeamData(teamId: number, isHome: boolean): Team {
    // Get team and calculate ratings
    const team = this.db.prepare('SELECT * FROM teams WHERE team_id = ?').get(teamId) as any;
    
    // Get roster and calculate team ratings
    const players = this.db.prepare(`
      SELECT * FROM players 
      WHERE current_team_id = ? 
      AND roster_status = 'Active'
    `).all(teamId) as Player[];
    
    // Simple rating calculation (average of top players)
    const offense = players
      .filter(p => ['QB', 'RB', 'WR', 'TE', 'OL'].includes(p.position))
      .sort((a, b) => b.overall_rating - a.overall_rating)
      .slice(0, 11)
      .reduce((sum, p) => sum + p.overall_rating, 0) / 11;
    
    const defense = players
      .filter(p => ['DL', 'LB', 'CB', 'S'].includes(p.position))
      .sort((a, b) => b.overall_rating - a.overall_rating)
      .slice(0, 11)
      .reduce((sum, p) => sum + p.overall_rating, 0) / 11;
    
    const specialTeams = 75; // Simplified
    
    return {
      team_id: teamId,
      name: team.name,
      offense_rating: offense,
      defense_rating: defense,
      special_teams_rating: specialTeams,
      home_field: isHome
    };
  }
  
  private calculateWinProbability(home: Team, away: Team): number {
    // Base 50%
    let prob = 0.5;
    
    // Team quality differential
    const homeOverall = (home.offense_rating + home.defense_rating) / 2;
    const awayOverall = (away.offense_rating + away.defense_rating) / 2;
    const differential = homeOverall - awayOverall;
    
    // Each rating point = ~2% win probability
    prob += differential * 0.02;
    
    // Home field advantage (~3%)
    if (home.home_field) {
      prob += 0.03;
    }
    
    // Add randomness (±10%)
    const randomFactor = (Math.random() - 0.5) * 0.2;
    prob += randomFactor;
    
    // Clamp between 0.1 and 0.9
    return Math.max(0.1, Math.min(0.9, prob));
  }
  
  private simulateScore(home: Team, away: Team, winProb: number): { homeScore: number; awayScore: number } {
    // Generate base scores based on offensive/defensive matchups
    const homeBasePts = this.calculateExpectedPoints(home.offense_rating, away.defense_rating);
    const awayBasePts = this.calculateExpectedPoints(away.offense_rating, home.defense_rating);
    
    // Add variance
    const homeVariance = Math.floor(Math.random() * 14) - 7; // ±7 points
    const awayVariance = Math.floor(Math.random() * 14) - 7;
    
    let homeScore = Math.max(0, homeBasePts + homeVariance);
    let awayScore = Math.max(0, awayBasePts + awayVariance);
    
    // Ensure winner matches probability (mostly)
    const homeWon = homeScore > awayScore;
    const shouldHomeWin = Math.random() < winProb;
    
    if (homeWon !== shouldHomeWin && Math.abs(homeScore - awayScore) <= 7) {
      // Flip result if close and doesn't match probability
      const temp = homeScore;
      homeScore = awayScore;
      awayScore = temp;
    }
    
    return { homeScore, awayScore };
  }
  
  private calculateExpectedPoints(offenseRating: number, defenseRating: number): number {
    // Base points from matchup
    const differential = offenseRating - defenseRating;
    const basePoints = 21; // NFL average
    
    // Each rating point differential = ~0.5 points
    const adjustedPoints = basePoints + (differential * 0.5);
    
    // Round to nearest field goal
    return Math.round(adjustedPoints / 3) * 3;
  }
  
  private generateTeamStats(team: Team, scored: number, allowed: number): TeamStats {
    // Generate realistic stats based on score
    const wonGame = scored > allowed;
    
    // Passing yards correlate with score
    const passingYards = 200 + Math.floor(Math.random() * 100) + (scored * 3);
    
    // Rushing yards vary
    const rushingYards = 80 + Math.floor(Math.random() * 60) + (wonGame ? 20 : -10);
    
    // Turnovers inversely correlate with winning
    const turnovers = wonGame ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3) + 1;
    
    // Time of possession
    const topMinutes = wonGame ? 30 + Math.floor(Math.random() * 8) : 22 + Math.floor(Math.random() * 8);
    const topSeconds = Math.floor(Math.random() * 60);
    
    return {
      passing_yards: passingYards,
      rushing_yards: rushingYards,
      total_yards: passingYards + rushingYards,
      turnovers,
      time_of_possession: `${topMinutes}:${topSeconds.toString().padStart(2, '0')}`,
      third_down_pct: 0.3 + Math.random() * 0.2,
      penalties: 4 + Math.floor(Math.random() * 6)
    };
  }
  
  private generatePlayerStats(home: Team, away: Team, homeStats: TeamStats, awayStats: TeamStats): PlayerStats[] {
    const playerStats: PlayerStats[] = [];
    
    // Get key players for each team
    const homeQB = this.db.prepare(`
      SELECT * FROM players 
      WHERE current_team_id = ? AND position = 'QB' 
      ORDER BY overall_rating DESC LIMIT 1
    `).get(home.team_id) as Player;
    
    const awayQB = this.db.prepare(`
      SELECT * FROM players 
      WHERE current_team_id = ? AND position = 'QB' 
      ORDER BY overall_rating DESC LIMIT 1
    `).get(away.team_id) as Player;
    
    // Generate QB stats
    if (homeQB) {
      const completionPct = 0.55 + (homeQB.overall_rating - 70) * 0.01;
      const attempts = 25 + Math.floor(Math.random() * 15);
      const completions = Math.floor(attempts * completionPct);
      const tds = Math.floor(homeStats.passing_yards / 100) + (Math.random() > 0.5 ? 1 : 0);
      
      playerStats.push({
        player_id: homeQB.player_id,
        passing: {
          attempts,
          completions,
          yards: homeStats.passing_yards,
          tds,
          ints: homeStats.turnovers > 0 ? Math.floor(Math.random() * 2) + 1 : 0
        }
      });
    }
    
    // Similar for away QB and other positions...
    // This is simplified - full implementation would generate stats for all starters
    
    return playerStats;
  }
  
  private simulateInjuries(homeTeamId: number, awayTeamId: number): Injury[] {
    const injuries: Injury[] = [];
    
    // Each game has 5% chance of injury per starter (22 starters * 0.05 = ~1 injury per game)
    const injuryChance = 0.05;
    
    // Get starters
    const starters = this.db.prepare(`
      SELECT player_id, position, injury_risk FROM players 
      WHERE current_team_id IN (?, ?) 
      AND roster_status = 'Active'
      ORDER BY overall_rating DESC
      LIMIT 44
    `).all(homeTeamId, awayTeamId) as any[];
    
    starters.forEach(player => {
      const adjustedChance = injuryChance * (player.injury_risk || 1);
      if (Math.random() < adjustedChance) {
        const severity = this.determineInjurySeverity();
        injuries.push({
          player_id: player.player_id,
          injury_type: this.getInjuryType(player.position),
          severity: severity.status,
          expected_weeks: severity.weeks
        });
      }
    });
    
    return injuries;
  }
  
  private determineInjurySeverity(): { status: 'Questionable' | 'Doubtful' | 'Out' | 'IR'; weeks: number } {
    const rand = Math.random();
    if (rand < 0.5) {
      return { status: 'Questionable', weeks: 0 };
    } else if (rand < 0.75) {
      return { status: 'Doubtful', weeks: 1 };
    } else if (rand < 0.9) {
      return { status: 'Out', weeks: 2 + Math.floor(Math.random() * 3) };
    } else {
      return { status: 'IR', weeks: 4 + Math.floor(Math.random() * 8) };
    }
  }
  
  private getInjuryType(position: string): string {
    const injuries = {
      QB: ['Shoulder', 'Ribs', 'Thumb', 'Ankle'],
      RB: ['Hamstring', 'Knee', 'Ankle', 'Shoulder'],
      WR: ['Hamstring', 'Ankle', 'Knee', 'Shoulder'],
      OL: ['Knee', 'Ankle', 'Back', 'Shoulder'],
      DL: ['Knee', 'Ankle', 'Shoulder', 'Hamstring'],
      LB: ['Knee', 'Ankle', 'Hamstring', 'Shoulder'],
      DB: ['Hamstring', 'Ankle', 'Knee', 'Concussion']
    };
    
    const positionInjuries = injuries[position] || injuries['LB'];
    return positionInjuries[Math.floor(Math.random() * positionInjuries.length)];
  }
  
  private createGameSummary(home: Team, away: Team, homeScore: number, awayScore: number): string {
    const winner = homeScore > awayScore ? home : away;
    const loser = homeScore > awayScore ? away : home;
    const winScore = Math.max(homeScore, awayScore);
    const loseScore = Math.min(homeScore, awayScore);
    
    const closeness = winScore - loseScore;
    let description = '';
    
    if (closeness <= 3) {
      description = 'in a nail-biter';
    } else if (closeness <= 7) {
      description = 'in a close game';
    } else if (closeness <= 14) {
      description = 'with a solid victory';
    } else {
      description = 'in a dominant performance';
    }
    
    return `${winner.name} defeated ${loser.name} ${winScore}-${loseScore} ${description}.`;
  }
  
  private saveGameResult(result: GameResult): void {
    // Implementation saves to database
  }
}
```

---

## 6. AI Decision Making

### 6.1 AI GM Personality System (`src/lib/ai/gmPersonality.ts`)

```typescript
export interface GMPersonality {
  team_id: number;
  risk_tolerance: number; // 0-1 (conservative to aggressive)
  philosophy: 'build_through_draft' | 'win_now' | 'balanced' | 'moneyball';
  position_values: Record<string, number>; // Position importance weights
  loyalty: number; // 0-1 (quick to cut vs keeps veterans)
  trade_frequency: number; // 0-1 (never trades vs always looking)
}

export class AIGMDecisions {
  private personality: GMPersonality;
  private db = getDatabase();
  
  constructor(teamId: number) {
    this.personality = this.generatePersonality(teamId);
  }
  
  private generatePersonality(teamId: number): GMPersonality {
    // Seed based on team ID for consistency
    const seed = teamId;
    
    return {
      team_id: teamId,
      risk_tolerance: this.seededRandom(seed) * 0.6 + 0.2, // 0.2-0.8
      philosophy: this.selectPhilosophy(seed),
      position_values: this.generatePositionValues(seed),
      loyalty: this.seededRandom(seed + 1) * 0.6 + 0.2,
      trade_frequency: this.seededRandom(seed + 2) * 0.5 + 0.1
    };
  }
  
  evaluateFreeAgent(player: any): number {
    // Calculate value based on personality
    let value = 0;
    
    // Base value from rating
    value = player.overall_rating;
    
    // Adjust for position value
    const positionWeight = this.personality.position_values[player.position] || 1.0;
    value *= positionWeight;
    
    // Adjust for age based on philosophy
    if (this.personality.philosophy === 'win_now' && player.age > 30) {
      value *= 0.9; // Slight penalty for older players
    } else if (this.personality.philosophy === 'build_through_draft' && player.age > 27) {
      value *= 0.7; // Stronger penalty for older players
    }
    
    // Risk adjustment
    if (player.injury_history) {
      value *= (1 - this.personality.risk_tolerance * 0.3);
    }
    
    return value;
  }
  
  makeOffer(player: any, capSpace: number): any {
    const marketValue = this.calculateMarketValue(player);
    
    // Adjust based on personality
    let offerAmount = marketValue;
    
    if (this.personality.philosophy === 'moneyball') {
      // Look for value, offer below market
      offerAmount *= 0.85;
    } else if (this.personality.philosophy === 'win_now') {
      // Willing to overpay for talent
      offerAmount *= 1.1;
    }
    
    // Cap space constraint
    const maxOffer = capSpace * 0.3; // Won't spend more than 30% on one player
    offerAmount = Math.min(offerAmount, maxOffer);
    
    return {
      years: this.determineContractLength(player),
      total_value: Math.round(offerAmount),
      guaranteed: Math.round(offerAmount * 0.5),
      structure: 'even'
    };
  }
  
  evaluateDraftPick(prospect: any, teamNeeds: string[]): number {
    let value = prospect.overall_rating;
    
    // Need bonus
    if (teamNeeds.includes(prospect.position)) {
      value *= 1.2;
    }
    
    // Philosophy adjustments
    if (this.personality.philosophy === 'build_through_draft') {
      // Values draft picks highly
      value *= 1.1;
    }
    
    // Position value
    value *= this.personality.position_values[prospect.position] || 1.0;
    
    return value;
  }
  
  shouldAcceptTrade(giving: any[], receiving: any[]): boolean {
    const givingValue = this.calculateTradeValue(giving);
    const receivingValue = this.calculateTradeValue(receiving);
    
    // Risk tolerance affects how much value they need
    const requiredSurplus = 1 + (0.2 * (1 - this.personality.risk_tolerance));
    
    return receivingValue > givingValue * requiredSurplus;
  }
  
  // Helper functions
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  
  private selectPhilosophy(seed: number): GMPersonality['philosophy'] {
    const philosophies: GMPersonality['philosophy'][] = [
      'build_through_draft',
      'win_now',
      'balanced',
      'moneyball'
    ];
    return philosophies[Math.floor(this.seededRandom(seed) * philosophies.length)];
  }
  
  private generatePositionValues(seed: number): Record<string, number> {
    // Different philosophies value positions differently
    const base = {
      QB: 1.5,
      EDGE: 1.3,
      OT: 1.2,
      CB: 1.2,
      WR: 1.1,
      DT: 1.0,
      LB: 1.0,
      S: 0.9,
      OG: 0.9,
      C: 0.9,
      TE: 0.8,
      RB: 0.7
    };
    
    // Add some variance
    Object.keys(base).forEach(pos => {
      base[pos] += (this.seededRandom(seed + pos.charCodeAt(0)) - 0.5) * 0.2;
    });
    
    return base;
  }
  
  private calculateMarketValue(player: any): number {
    // Simplified market value calculation
    return player.overall_rating * 250000; // Very simplified
  }
  
  private determineContractLength(player: any): number {
    if (player.age < 26) return 4;
    if (player.age < 29) return 3;
    if (player.age < 32) return 2;
    return 1;
  }
  
  private calculateTradeValue(assets: any[]): number {
    return assets.reduce((total, asset) => {
      if (asset.type === 'pick') {
        // Use draft value chart
        return total + this.getDraftPickValue(asset.round, asset.pick);
      } else if (asset.type === 'player') {
        // Player value based on rating and contract
        return total + (asset.overall_rating * 10) - (asset.cap_hit / 1000000);
      }
      return total;
    }, 0);
  }
  
  private getDraftPickValue(round: number, pick: number): number {
    // Simplified draft value chart
    const overall = (round - 1) * 32 + pick;
    return Math.max(0, 3000 - overall * 15);
  }
}
```

---

## 7. Season Management API

### 7.1 Season Controller (`src/app/api/season/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/client';
import { GameSimulator } from '@/lib/simulation/gameEngine';
import { AIGMDecisions } from '@/lib/ai/gmPersonality';

export async function GET(request: NextRequest) {
  const db = getDatabase();
  
  // Get current season state
  const gameState = db.prepare(`
    SELECT * FROM game_state WHERE state_id = 1
  `).get();
  
  const standings = db.prepare(`
    SELECT t.*, s.wins, s.losses, s.ties, s.division_rank
    FROM teams t
    LEFT JOIN season_standings s ON t.team_id = s.team_id
    WHERE s.season = ?
    ORDER BY s.wins DESC
  `).all(gameState.current_season);
  
  const schedule = db.prepare(`
    SELECT * FROM schedule 
    WHERE season = ? AND week = ?
  `).all(gameState.current_season, gameState.current_week);
  
  return NextResponse.json({
    season: gameState.current_season,
    week: gameState.current_week,
    phase: gameState.current_phase,
    standings,
    schedule
  });
}

export async function POST(request: NextRequest) {
  const { action } = await request.json();
  const db = getDatabase();
  
  switch (action) {
    case 'simulate_week':
      return simulateWeek();
    case 'advance_phase':
      return advancePhase();
    case 'new_season':
      return startNewSeason();
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

async function simulateWeek() {
  const db = getDatabase();
  const simulator = new GameSimulator();
  
  const gameState = db.prepare('SELECT * FROM game_state WHERE state_id = 1').get();
  const currentWeek = gameState.current_week;
  
  // Get this week's games
  const games = db.prepare(`
    SELECT * FROM schedule 
    WHERE season = ? AND week = ?
  `).all(gameState.current_season, currentWeek);
  
  const results = [];
  
  for (const game of games) {
    const result = simulator.simulateGame(
      game.home_team_id,
      game.away_team_id,
      currentWeek
    );
    results.push(result);
    
    // Update standings
    updateStandings(game.home_team_id, game.away_team_id, result);
  }
  
  // Advance week
  db.prepare('UPDATE game_state SET current_week = current_week + 1 WHERE state_id = 1').run();
  
  return NextResponse.json({ results, newWeek: currentWeek + 1 });
}

async function advancePhase() {
  const db = getDatabase();
  const gameState = db.prepare('SELECT * FROM game_state WHERE state_id = 1').get();
  
  const phaseOrder = [
    'Post-Season',
    'Pre-Free Agency', 
    'Free Agency',
    'Pre-Draft',
    'Draft',
    'Post-Draft',
    'Training Camp',
    'Regular Season',
    'Playoffs'
  ];
  
  const currentIndex = phaseOrder.indexOf(gameState.current_phase);
  const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];
  
  // Handle phase-specific logic
  switch (nextPhase) {
    case 'Free Agency':
      initializeFreeAgency();
      break;
    case 'Draft':
      initializeDraft();
      break;
    case 'Regular Season':
      generateSchedule();
      break;
  }
  
  db.prepare('UPDATE game_state SET current_phase = ? WHERE state_id = 1').run(nextPhase);
  
  return NextResponse.json({ newPhase: nextPhase });
}

function updateStandings(homeId: number, awayId: number, result: any) {
  const db = getDatabase();
  
  const updateWin = db.prepare(`
    UPDATE season_standings 
    SET wins = wins + 1 
    WHERE team_id = ? AND season = ?
  `);
  
  const updateLoss = db.prepare(`
    UPDATE season_standings 
    SET losses = losses + 1 
    WHERE team_id = ? AND season = ?
  `);
  
  const season = db.prepare('SELECT current_season FROM game_state WHERE state_id = 1').get().current_season;
  
  if (result.home_score > result.away_score) {
    updateWin.run(homeId, season);
    updateLoss.run(awayId, season);
  } else {
    updateWin.run(awayId, season);
    updateLoss.run(homeId, season);
  }
}

// Helper functions for phase initialization
function initializeFreeAgency() {
  // Create free agents from expiring contracts
  // Set up AI team cap space
  // Generate initial player demands
}

function initializeDraft() {
  // Generate draft prospects
  // Set draft order
  // Initialize draft boards for AI teams
}

function generateSchedule() {
  // Create 18-week schedule
  // Balance home/away games
  // Ensure division games
}

function startNewSeason() {
  // Age players
  // Process retirements
  // Update contracts
  // Reset standings
  // Initialize new season state
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
// src/lib/__tests__/cap.test.ts
import { calculateCapHit, calculateDeadMoney, calculateRestructure } from '@/lib/cap/calculator';

describe('Salary Cap Calculator', () => {
  test('calculates cap hit correctly', () => {
    const contract = {
      annual_breakdown: [
        { year: 1, base_salary: 5000000, roster_bonus: 1000000, workout_bonus: 100000, guarantees: 6000000 }
      ],
      signing_bonus_total: 10000000,
      total_years: 4,
      signing_bonus_remaining: 10000000
    };
    
    const capHit = calculateCapHit(contract, 1);
    expect(capHit.total_cap_hit).toBe(8600000); // 5M + 1M + 0.1M + 2.5M proration
  });
  
  test('calculates dead money correctly', () => {
    // Test pre-June 1 and June 1 cuts
  });
  
  test('restructure respects minimum salary', () => {
    // Test that restructure leaves minimum base salary
  });
});
```

### 8.2 Integration Tests

```typescript
// src/app/__tests__/freeagency.test.ts
describe('Free Agency Flow', () => {
  test('complete contract negotiation', async () => {
    // Test offer -> counter -> accept flow
  });
  
  test('AI teams make competitive offers', async () => {
    // Test that AI generates reasonable offers
  });
  
  test('cap space updates after signing', async () => {
    // Verify cap calculations update correctly
  });
});
```

---

## 9. Phase 1 Deliverables Checklist

### Free Agency System
- [ ] Free agent market browser with filters
- [ ] Contract offer interface
- [ ] Negotiation logic with counter offers
- [ ] AI teams bidding on free agents
- [ ] RFA tender system
- [ ] Franchise tag implementation
- [ ] Cap space real-time updates
- [ ] Transaction logging

### Draft System
- [ ] Draft board construction with drag-and-drop
- [ ] Prospect scouting reports
- [ ] Live draft room interface
- [ ] Pick timer
- [ ] Trade offers during draft
- [ ] AI draft logic (BPA vs need)
- [ ] Rookie contract auto-generation
- [ ] UDFA signing period

### Roster Management
- [ ] 53-man roster cuts interface
- [ ] Practice squad management
- [ ] Depth chart editor
- [ ] Position group requirements
- [ ] Cap implications display
- [ ] Waiver wire system
- [ ] IR designations

### Game Simulation
- [ ] Schedule generation
- [ ] Game outcome calculation
- [ ] Team stats generation
- [ ] Player stats generation
- [ ] Injury simulation
- [ ] Standings updates
- [ ] Playoff seeding

### AI System
- [ ] GM personality generation
- [ ] Free agency bidding logic
- [ ] Draft pick evaluation
- [ ] Trade evaluation
- [ ] Roster cut decisions
- [ ] Realistic decision variance

### Season Management
- [ ] Phase progression system
- [ ] Calendar management
- [ ] Multi-season support
- [ ] Player aging/development
- [ ] Contract year progression
- [ ] Retirement processing

---

## 10. Performance Targets

### Response Times
- Page load: < 500ms
- API responses: < 200ms
- Game simulation: < 1s per game
- Week simulation: < 5s for all games

### Data Limits
- Support 32 teams
- ~1700 active players
- ~400 draft prospects
- 10+ year career mode
- 1000+ transactions per season

### UI Responsiveness
- 60 FPS drag-and-drop
- Instant filter updates
- No lag on large lists
- Smooth animations

---

## Next Steps

1. **Begin with Free Agency UI** - This is the most complex user-facing system
2. **Implement contract negotiation logic** - Core to player experience
3. **Build draft board interface** - Visual and interactive
4. **Create basic game simulation** - Can be refined later
5. **Add AI decision making** - Start simple, enhance over time
6. **Connect all systems** - Ensure smooth phase transitions

Remember: Focus on getting a playable game loop first, then enhance each system. The goal is to complete a full season cycle, even if simplified, before adding complexity.
