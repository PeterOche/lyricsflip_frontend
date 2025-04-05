import { MOCK_LYRICS } from '@/mock/mock';
import { LyricData, SongOption } from '@/store';
import { useGameStore, stopGameTimer } from '@/store/game';
import { useEffect, useState } from 'react';

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useSinglePlayer = (genre: string) => {
  const gameStore = useGameStore();
  const [currentLyric, setCurrentLyric] = useState<LyricData | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SongOption | null>(null);
  const [correctOption, setCorrectOption] = useState<SongOption | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [gameResult, setGameResult] = useState<{
    isWin: boolean;
    isMultiplayer: boolean;
  } | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Start game and timer
  useEffect(() => {
    if (genre && gameStore.gameStatus === 'playing') {
      startNewRound();
      setIsGameStarted(true);
      setIsCardFlipped(true);
    }
    return () => {
      stopGameTimer(); // Cleanup timer on unmount
    };
  }, [genre, gameStore.gameStatus]);

  // Monitor timeLeft and end game only once
  useEffect(() => {
    if (gameStore.timeLeft <= 0 && !gameResult && isGameStarted) {
      endGame(false);
    }
  }, [gameStore.timeLeft, gameResult, isGameStarted]);

  const startNewRound = () => {
    if (gameStore.currentRound >= gameStore.maxRounds) {
      endGame(true); // End if max rounds reached
      return;
    }
    const randomLyric =
      MOCK_LYRICS[Math.floor(Math.random() * MOCK_LYRICS.length)];
    const shuffledOptions = shuffleArray(randomLyric.options);
    setCurrentLyric({ ...randomLyric, options: shuffledOptions });
    setSelectedOption(null);
    setCorrectOption(null);
    setIsCardFlipped(true);
  };

  const handleSongSelect = (option: SongOption) => {
    if (!currentLyric || selectedOption || gameResult) return; // Prevent selection after game end

    setSelectedOption(option);
    setCorrectOption({
      title: currentLyric.title,
      artist: currentLyric.artist,
    });

    const isCorrect = option.title === currentLyric.title;
    const newWrongAttempts = isCorrect ? 0 : wrongAttempts + 1;

    if (isCorrect) {
      gameStore.increaseScore();
      gameStore.setGuessResult('correct');
      setWrongAttempts(0);

      // Check if this is the last round
      if (gameStore.currentRound + 1 >= gameStore.maxRounds) {
        setTimeout(() => {
          setIsCardFlipped(false);
          setTimeout(() => endGame(true), 500); // End after feedback
        }, 2000);
        return;
      }
    } else {
      gameStore.setGuessResult('incorrect');
      setWrongAttempts(newWrongAttempts);
      if (newWrongAttempts >= gameStore.gameConfig.odds) {
        setTimeout(() => {
          setIsCardFlipped(false);
          setTimeout(() => endGame(false), 500); // End after feedback
        }, 2000);
        return;
      }
    }

    // Move to next round if not ended
    setTimeout(() => {
      setIsCardFlipped(false);
      setTimeout(() => startNewRound(), 500);
    }, 2000);
  };

  const endGame = (didWin: boolean) => {
    if (gameResult) return; // Ensure called only once
    setGameResult({
      isWin: didWin,
      isMultiplayer: false,
    });
    gameStore.endGame();
    stopGameTimer();
  };

  const resetGame = () => {
    gameStore.resetGame();
    setIsGameStarted(false);
    setCurrentLyric(null);
    setGameResult(null);
    setWrongAttempts(0);
    setIsCardFlipped(false);
  };

  return {
    currentLyric,
    isGameStarted,
    selectedOption,
    correctOption,
    handleSongSelect,
    gameResult,
    resetGame,
    isCardFlipped,
  };
};