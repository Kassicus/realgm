'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import { AttachMoney, TrendingDown, TrendingUp } from '@mui/icons-material';

interface TeamCapSpaceProps {
  availableSpace: number;
  totalCap: number;
}

export function TeamCapSpace({ availableSpace, totalCap }: TeamCapSpaceProps) {
  const usedCap = totalCap - availableSpace;
  const usedPct = (usedCap / totalCap) * 100;

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle2" color="text.secondary">
              Available Cap Space
            </Typography>
          </Box>
          <Chip
            label={`${usedPct.toFixed(1)}% Used`}
            size="small"
            color={usedPct > 90 ? 'error' : usedPct > 75 ? 'warning' : 'success'}
          />
        </Box>

        <Typography variant="h4" fontWeight="bold" color={availableSpace < 10000000 ? 'error.main' : 'success.main'}>
          {formatCurrency(availableSpace)}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          of {formatCurrency(totalCap)} total cap
        </Typography>

        <LinearProgress
          variant="determinate"
          value={usedPct}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              bgcolor:
                usedPct > 90 ? '#d32f2f' :
                usedPct > 75 ? '#ed6c02' :
                '#2e7d32'
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
