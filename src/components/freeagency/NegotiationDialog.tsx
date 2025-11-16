'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Slider,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AttachMoney, Timeline, Shield, TrendingUp } from '@mui/icons-material';

interface FreeAgent {
  player_id: number;
  name: string;
  position: string;
  age: number;
  overall_rating: number;
  desired_apy: number;
  desired_years: number;
  desired_guaranteed: number;
}

interface NegotiationDialogProps {
  open: boolean;
  onClose: () => void;
  player: FreeAgent | null;
  teamCapSpace: number;
  onOfferAccepted: (contract: any) => void;
}

export function NegotiationDialog({
  open,
  onClose,
  player,
  teamCapSpace,
  onOfferAccepted
}: NegotiationDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [offer, setOffer] = useState({
    years: 3,
    totalValue: 0,
    guaranteedMoney: 0,
    signingBonus: 0,
    structure: 'even' as 'frontloaded' | 'backloaded' | 'even'
  });
  const [playerResponse, setPlayerResponse] = useState<any>(null);
  const [negotiationHistory, setNegotiationHistory] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = ['Initial Offer', 'Negotiation', 'Final Terms', 'Contract Signed'];

  // Initialize offer when dialog opens
  useState(() => {
    if (player && open) {
      setOffer({
        years: player.desired_years,
        totalValue: player.desired_apy * player.desired_years,
        guaranteedMoney: player.desired_guaranteed,
        signingBonus: Math.round(player.desired_guaranteed * 0.4),
        structure: 'even'
      });
    }
  });

  const calculateAPY = () => {
    if (offer.years === 0) return 0;
    return Math.round(offer.totalValue / offer.years);
  };

  const calculateYear1Cap = () => {
    if (offer.years === 0) return 0;
    // Simplified calculation
    const bonusProration = offer.signingBonus / Math.min(offer.years, 5);
    const baseSalary = (offer.totalValue - offer.signingBonus) / offer.years;
    return Math.round(bonusProration + baseSalary);
  };

  const calculateAcceptanceProbability = () => {
    if (!player) return 0;

    const apyRatio = calculateAPY() / player.desired_apy;
    const guaranteedRatio = offer.guaranteedMoney / player.desired_guaranteed;
    const yearsMatch = Math.abs(offer.years - player.desired_years) <= 1 ? 1 : 0.8;

    return Math.min(100, Math.round(((apyRatio + guaranteedRatio) / 2) * yearsMatch * 100));
  };

  const submitOffer = async () => {
    if (!player) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/contracts/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.player_id,
          team_id: 1, // Player's team
          offer
        })
      });

      const result = await response.json();
      setPlayerResponse(result);
      setNegotiationHistory([...negotiationHistory, { offer: { ...offer }, response: result }]);

      if (result.decision === 'accept') {
        setActiveStep(3);
        setTimeout(() => {
          onOfferAccepted(result.contract);
          handleClose();
        }, 2000);
      } else if (result.decision === 'counter') {
        setActiveStep(1);
        // Update offer with counter
        if (result.counter) {
          setOffer({
            years: result.counter.years,
            totalValue: result.counter.totalValue,
            guaranteedMoney: result.counter.guaranteedMoney,
            signingBonus: result.counter.signingBonus,
            structure: result.counter.structure || 'even'
          });
        }
      } else {
        // Declined - negotiation failed
        setActiveStep(1);
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert('Failed to submit offer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setPlayerResponse(null);
    setNegotiationHistory([]);
    onClose();
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  if (!player) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Contract Negotiation: {player.name}
        <Typography variant="subtitle2" color="text.secondary">
          {player.position} • {player.age} years old • {player.overall_rating} OVR
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
            Market Value: {formatCurrency(player.desired_apy)}/year •{' '}
            {player.desired_years} years •{' '}
            {formatCurrency(player.desired_guaranteed)} guaranteed
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
                    onChange={(e, v) => setOffer({ ...offer, years: v as number })}
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
                  onChange={(e) => setOffer({ ...offer, totalValue: parseInt(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Guaranteed Money"
                  type="number"
                  value={offer.guaranteedMoney}
                  onChange={(e) =>
                    setOffer({ ...offer, guaranteedMoney: parseInt(e.target.value) || 0 })
                  }
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Signing Bonus"
                  type="number"
                  value={offer.signingBonus}
                  onChange={(e) =>
                    setOffer({ ...offer, signingBonus: parseInt(e.target.value) || 0 })
                  }
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth>
                  <InputLabel>Contract Structure</InputLabel>
                  <Select
                    value={offer.structure}
                    label="Contract Structure"
                    onChange={(e) =>
                      setOffer({ ...offer, structure: e.target.value as any })
                    }
                  >
                    <MenuItem value="frontloaded">Front-loaded</MenuItem>
                    <MenuItem value="even">Even</MenuItem>
                    <MenuItem value="backloaded">Back-loaded</MenuItem>
                  </Select>
                </FormControl>
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
                    <Typography variant="h5">{formatCurrency(calculateAPY())}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Year 1 Cap Hit
                    </Typography>
                    <Typography variant="h5">{formatCurrency(calculateYear1Cap())}</Typography>
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
                      {offer.totalValue > 0
                        ? Math.round((offer.guaranteedMoney / offer.totalValue) * 100)
                        : 0}
                      %
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
                      sx={{ height: 10, borderRadius: 5, mt: 1 }}
                    />
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                      {calculateAcceptanceProbability()}%
                    </Typography>
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
                        Round {idx + 1}: {formatCurrency(item.offer.totalValue)} /{' '}
                        {item.offer.years} years
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
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={submitOffer}
          disabled={isProcessing || calculateYear1Cap() > teamCapSpace || offer.totalValue === 0}
        >
          {isProcessing ? 'Submitting...' : 'Submit Offer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
