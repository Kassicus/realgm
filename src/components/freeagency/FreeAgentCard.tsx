'use client';

import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Stack,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Star,
  StarBorder,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle
} from '@mui/icons-material';

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

interface FreeAgentCardProps {
  player: FreeAgent;
  onMakeOffer: () => void;
  onToggleWatchlist: () => void;
  isWatchlisted: boolean;
  canAfford: boolean;
}

export function FreeAgentCard({
  player,
  onMakeOffer,
  onToggleWatchlist,
  isWatchlisted,
  canAfford
}: FreeAgentCardProps) {
  // Determine rating color
  const getRatingColor = (rating: number): string => {
    if (rating >= 90) return '#1976d2'; // Elite - Blue
    if (rating >= 85) return '#2e7d32'; // Great - Green
    if (rating >= 80) return '#ed6c02'; // Good - Orange
    if (rating >= 75) return '#9c27b0'; // Average - Purple
    return '#757575'; // Below Average - Gray
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <Card
      sx={{
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        },
        border: isWatchlisted ? '2px solid #1976d2' : '1px solid #e0e0e0'
      }}
    >
      <CardContent>
        {/* Header with name and watchlist */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" fontWeight="bold">
              {player.name}
            </Typography>
            {player.college && (
              <Typography variant="caption" color="text.secondary">
                {player.college}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={onToggleWatchlist}
            color={isWatchlisted ? 'primary' : 'default'}
          >
            {isWatchlisted ? <Star /> : <StarBorder />}
          </IconButton>
        </Box>

        {/* Position and Rating */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={player.position}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${player.overall_rating} OVR`}
            size="small"
            sx={{
              bgcolor: getRatingColor(player.overall_rating),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Chip
            label={player.fa_type}
            size="small"
            variant="outlined"
            color={player.fa_type === 'UFA' ? 'default' : 'info'}
          />
          <Chip
            label={`Age ${player.age}`}
            size="small"
            variant="outlined"
          />
        </Stack>

        {/* Contract Demands */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Contract Demands
          </Typography>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">APY:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(player.desired_apy)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Years:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {player.desired_years}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Guaranteed:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(player.desired_guaranteed)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Interest Level */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Interest Level
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {player.interest_level}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={player.interest_level}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor:
                  player.interest_level >= 70 ? '#2e7d32' :
                  player.interest_level >= 40 ? '#ed6c02' :
                  '#d32f2f'
              }
            }}
          />
        </Box>

        {/* Best Offer Indicator */}
        {player.best_offer && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<TrendingUp />}
              label={`Best Offer: ${formatCurrency(player.best_offer.total_value)} / ${player.best_offer.years}yr`}
              size="small"
              color="warning"
              sx={{ width: '100%' }}
            />
          </Box>
        )}

        {/* Cap Space Warning */}
        {!canAfford && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<Warning />}
              label="Insufficient Cap Space"
              size="small"
              color="error"
              sx={{ width: '100%' }}
            />
          </Box>
        )}

        {/* Action Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={onMakeOffer}
          disabled={!canAfford}
          startIcon={<AttachMoney />}
        >
          Make Offer
        </Button>
      </CardContent>
    </Card>
  );
}
