'use client';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          NFL GM Simulator
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          The most authentic NFL General Manager experience
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/new-game')}
          >
            New Game
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/load-game')}
          >
            Load Game
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
