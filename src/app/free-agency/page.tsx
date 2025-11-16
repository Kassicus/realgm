'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Stack,
  Paper,
  Badge
} from '@mui/material';
import {
  FilterList,
  Search
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
  college?: string;
  fa_type: 'UFA' | 'RFA' | 'ERFA';
  desired_apy: number;
  desired_years: number;
  desired_guaranteed: number;
  interest_level: number;
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
  const [teamCapSpace, setTeamCapSpace] = useState(50000000); // Default $50M
  const [isLoading, setIsLoading] = useState(true);

  const offensivePositions = ['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C'];
  const defensivePositions = ['EDGE', 'DT', 'LB', 'CB', 'S'];

  useEffect(() => {
    fetchFreeAgents();
    fetchTeamCapSpace();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [freeAgents, filters, activeTab, sortBy, watchlist]);

  const fetchFreeAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/free-agents');
      const data = await response.json();
      setFreeAgents(data);
      setFilteredAgents(data);
    } catch (error) {
      console.error('Error fetching free agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamCapSpace = async () => {
    try {
      // TODO: Implement cap API endpoint
      // For now, using hardcoded value
      setTeamCapSpace(50000000);
    } catch (error) {
      console.error('Error fetching cap space:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...freeAgents];

    // Position filter
    if (filters.position !== 'ALL') {
      filtered = filtered.filter((p) => p.position === filters.position);
    }

    // Rating filter
    filtered = filtered.filter((p) => p.overall_rating >= filters.minRating);

    // Age filter
    filtered = filtered.filter((p) => p.age <= filters.maxAge);

    // FA Type filter
    if (filters.faType !== 'ALL') {
      filtered = filtered.filter((p) => p.fa_type === filters.faType);
    }

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Tab filter
    if (activeTab === 1) {
      // Offense
      filtered = filtered.filter((p) => offensivePositions.includes(p.position));
    } else if (activeTab === 2) {
      // Defense
      filtered = filtered.filter((p) => defensivePositions.includes(p.position));
    } else if (activeTab === 3) {
      // Watchlist
      filtered = filtered.filter((p) => watchlist.includes(p.player_id));
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

  const handleToggleWatchlist = (playerId: number) => {
    setWatchlist((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const handleOfferAccepted = (contract: any) => {
    console.log('Contract signed!', contract);
    fetchFreeAgents(); // Refresh list
    fetchTeamCapSpace(); // Update cap
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header with Cap Space */}
      <Box sx={{ mb: 3 }}>
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
            <TeamCapSpace availableSpace={teamCapSpace} totalCap={279200000} />
          </Grid>
        </Grid>
      </Box>

      {/* Market Overview */}
      <MarketOverview
        totalFreeAgents={freeAgents.length}
        topSignings={[]} // TODO: Fetch recent signings
        hottestPositions={['QB', 'EDGE', 'WR']}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label={`All (${freeAgents.length})`} />
        <Tab label="Offense" />
        <Tab label="Defense" />
        <Tab
          label={
            <Badge badgeContent={watchlist.length} color="primary">
              <span style={{ marginRight: watchlist.length > 0 ? '16px' : '0' }}>Watchlist</span>
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
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Position</InputLabel>
              <Select
                value={filters.position}
                label="Position"
                onChange={(e) => setFilters({ ...filters, position: e.target.value })}
              >
                <MenuItem value="ALL">All Positions</MenuItem>
                <MenuItem value="QB">Quarterback</MenuItem>
                <MenuItem value="RB">Running Back</MenuItem>
                <MenuItem value="WR">Wide Receiver</MenuItem>
                <MenuItem value="TE">Tight End</MenuItem>
                <MenuItem value="OT">Offensive Tackle</MenuItem>
                <MenuItem value="OG">Offensive Guard</MenuItem>
                <MenuItem value="C">Center</MenuItem>
                <MenuItem value="EDGE">Edge Rusher</MenuItem>
                <MenuItem value="DT">Defensive Tackle</MenuItem>
                <MenuItem value="LB">Linebacker</MenuItem>
                <MenuItem value="CB">Cornerback</MenuItem>
                <MenuItem value="S">Safety</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>FA Type</InputLabel>
              <Select
                value={filters.faType}
                label="FA Type"
                onChange={(e) => setFilters({ ...filters, faType: e.target.value })}
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
              onChange={(e, v) => setFilters({ ...filters, minRating: v as number })}
              min={54}
              max={99}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="overall_rating">Rating</MenuItem>
                <MenuItem value="age">Age</MenuItem>
                <MenuItem value="value">Value</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Free Agent Grid */}
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Loading free agents...
          </Typography>
        </Box>
      ) : filteredAgents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No free agents found matching your criteria
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredAgents.map((player) => (
            <Grid item xs={12} sm={6} md={4} key={player.player_id}>
              <FreeAgentCard
                player={player}
                onMakeOffer={() => handleMakeOffer(player)}
                onToggleWatchlist={() => handleToggleWatchlist(player.player_id)}
                isWatchlisted={watchlist.includes(player.player_id)}
                canAfford={player.desired_apy <= teamCapSpace}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Negotiation Dialog */}
      <NegotiationDialog
        open={negotiationOpen}
        onClose={() => setNegotiationOpen(false)}
        player={selectedPlayer}
        teamCapSpace={teamCapSpace}
        onOfferAccepted={handleOfferAccepted}
      />
    </Container>
  );
}
