'use client';

import {
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Groups,
  TrendingUp,
  LocalFireDepartment,
  CheckCircle
} from '@mui/icons-material';

interface RecentSigning {
  player_name: string;
  position: string;
  team_name: string;
  total_value: number;
  years: number;
  apy: number;
}

interface MarketOverviewProps {
  totalFreeAgents: number;
  topSignings: RecentSigning[];
  hottestPositions: string[];
}

export function MarketOverview({
  totalFreeAgents,
  topSignings,
  hottestPositions
}: MarketOverviewProps) {
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
      <Grid container spacing={2}>
        {/* Market Stats */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Groups sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Available Players
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {totalFreeAgents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Hottest Positions */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalFireDepartment sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Hottest Positions
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {hottestPositions.map((pos) => (
                  <Chip
                    key={pos}
                    label={pos}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Top Signings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Recent Top Signings
                </Typography>
              </Box>
              {topSignings.length > 0 ? (
                <List dense disablePadding>
                  {topSignings.slice(0, 3).map((signing, idx) => (
                    <ListItem key={idx} disablePadding sx={{ mb: 0.5 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem', bgcolor: 'success.main' }}>
                        {signing.position}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{signing.player_name}</strong> → {signing.team_name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(signing.total_value)} / {signing.years}yr ({formatCurrency(signing.apy)} APY)
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No signings yet - legal tampering period just started!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}
