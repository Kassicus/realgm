'use client';

import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack,
  Grid,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Speed,
  FitnessCenter,
  TrendingUp,
  School,
  EmojiEvents
} from '@mui/icons-material';

interface DraftProspect {
  prospect_id: number;
  name: string;
  position: string;
  college: string;
  overall_rating: number;
  draft_grade: string;
  height: string;
  weight: number;
  age: number;
  forty_yard_dash?: number;
  bench_press?: number;
  vertical_jump?: number;
  broad_jump?: number;
  three_cone_drill?: number;
  nfl_comparison?: string;
  is_drafted: boolean;
}

interface ProspectCardProps {
  prospect: DraftProspect;
  rank?: number;
  onClick?: () => void;
  isDragging?: boolean;
}

export function ProspectCard({ prospect, rank, onClick, isDragging }: ProspectCardProps) {
  const getRatingColor = (rating: number): string => {
    if (rating >= 90) return '#1976d2'; // Elite
    if (rating >= 85) return '#2e7d32'; // Great
    if (rating >= 80) return '#ed6c02'; // Good
    if (rating >= 75) return '#9c27b0'; // Average
    return '#757575'; // Below Average
  };

  const getGradeColor = (grade: string): string => {
    if (grade === '1st Round') return 'error';
    if (grade === '2nd-3rd Round') return 'warning';
    if (grade === '4th-5th Round') return 'info';
    return 'default';
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        opacity: prospect.is_drafted ? 0.5 : 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4
        } : {},
        boxShadow: isDragging ? 6 : 1
      }}
    >
      <CardContent>
        {/* Header with rank and name */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            {rank !== undefined && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                #{rank}
              </Typography>
            )}
            <Typography variant="h6" component="div" fontWeight="bold">
              {prospect.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <School fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem' }} />
              <Typography variant="caption" color="text.secondary">
                {prospect.college}
              </Typography>
            </Box>
          </Box>

          {/* Rating Badge */}
          <Box
            sx={{
              bgcolor: getRatingColor(prospect.overall_rating),
              color: 'white',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              minWidth: 50,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {prospect.overall_rating}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              OVR
            </Typography>
          </Box>
        </Box>

        {/* Position and Draft Grade */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={prospect.position} size="small" color="primary" />
          <Chip
            label={prospect.draft_grade}
            size="small"
            color={getGradeColor(prospect.draft_grade) as any}
            variant="outlined"
          />
          {prospect.is_drafted && (
            <Chip label="DRAFTED" size="small" color="default" />
          )}
        </Stack>

        {/* Physical Stats */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Height
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {prospect.height}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Weight
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {prospect.weight} lbs
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Age
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {prospect.age}
            </Typography>
          </Grid>
        </Grid>

        {/* Combine Stats */}
        {(prospect.forty_yard_dash || prospect.bench_press || prospect.vertical_jump) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
              Combine Results
            </Typography>
            <Stack direction="row" spacing={2}>
              {prospect.forty_yard_dash && (
                <Tooltip title="40-Yard Dash">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Speed fontSize="small" sx={{ fontSize: '1rem' }} />
                    <Typography variant="caption" fontWeight="bold">
                      {prospect.forty_yard_dash.toFixed(2)}s
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              {prospect.bench_press && (
                <Tooltip title="Bench Press (225 lbs)">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FitnessCenter fontSize="small" sx={{ fontSize: '1rem' }} />
                    <Typography variant="caption" fontWeight="bold">
                      {prospect.bench_press} reps
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              {prospect.vertical_jump && (
                <Tooltip title="Vertical Jump">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUp fontSize="small" sx={{ fontSize: '1rem' }} />
                    <Typography variant="caption" fontWeight="bold">
                      {prospect.vertical_jump.toFixed(1)}"
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Stack>
          </Box>
        )}

        {/* NFL Comparison */}
        {prospect.nfl_comparison && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <EmojiEvents fontSize="small" color="primary" sx={{ fontSize: '1rem' }} />
            <Typography variant="caption" color="text.secondary">
              Comparison:
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              {prospect.nfl_comparison}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
