import React, { useState, useEffect } from 'react';
import { getPalo } from '../api/palo';
import { Spinner } from '../components/Spinner';
import '../style/GuessGame.scss';
import { useLoading } from '../hooks/useLoading';


// Types
interface Letra {
  id: number;
  content: string;
  artist: string;
  recording: string;
}

interface Estilo {
  id: number;
  name: string;
  origin: string;
  letras: Letra[];
}

interface PaloResponse {
  id: number;
  name: string;
  description: string;
  estilos: Estilo[];
}

interface GameRound {
  recording: string;
  options: { id: number; name: string }[];
  correctOptionId: number;
}

interface GameState {
  paloId: number;
  currentRoundIndex: number;
  rounds: GameRound[];
  score: number;
  showResult: boolean;
  selectedOptionId: number | null;
  gameMode: 'estilo' | 'origin';
}

const GuessGame: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [paloData, setPaloData] = useState<PaloResponse | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    paloId: 1, // Default palo ID
    currentRoundIndex: 0,
    rounds: [],
    score: 0,
    showResult: false,
    selectedOptionId: null,
    gameMode: 'estilo'
  });
  const { setIsLoading } = useLoading();

  const [loading, setLoading] = useState(true);
  
  // Update the global loading state based on component loading state
  useEffect(() => {
    setIsLoading(loading);
    return () => {
      setIsLoading(false); // Clean up when component unmounts
    };
  }, [loading, setIsLoading]);
  
  // Rest of your component code...
  
  useEffect(() => {
    const fetchPaloData = async () => {
      try {
        setLoading(true); // This will now also set the global loading state
        const response = await getPalo(gameState.paloId);
        setPaloData(response);
      } catch (err) {
        console.error('Failed to fetch palo data:', err);
        setError('Failed to load game data. Please try again.');
      } finally {
        setLoading(false); // This will now also update the global loading state
      }
    };

    fetchPaloData();
  }, [gameState.paloId]);


  // Setup game rounds when palo data is loaded
  useEffect(() => {
    if (!paloData) return;
    
    // Create game rounds based on the current game mode
    const setupGameRounds = () => {
      // Get all letras that have recordings
      const allLetrasWithRecordings: {
        letra: Letra;
        estiloId: number;
        estiloName: string;
        origin: string;
      }[] = [];
      
      paloData.estilos.forEach(estilo => {
        estilo.letras.forEach(letra => {
          if (letra.recording) {
            allLetrasWithRecordings.push({
              letra,
              estiloId: estilo.id,
              estiloName: estilo.name,
              origin: estilo.origin
            });
          }
        });
      });
      
      // Shuffle the letras for randomness
      const shuffledLetras = [...allLetrasWithRecordings].sort(() => Math.random() - 0.5);
      
      // Create game rounds
      const gameRounds: GameRound[] = shuffledLetras.map(item => {
        const correctOptionId = gameState.gameMode === 'estilo' ? item.estiloId : item.estiloId;
        const correctOptionName = gameState.gameMode === 'estilo' ? item.estiloName : item.origin;
        
        // Generate 3 wrong options
        const otherOptions = gameState.gameMode === 'estilo'
          ? paloData.estilos
              .filter(e => e.id !== item.estiloId)
              .map(e => ({ id: e.id, name: e.name }))
          : paloData.estilos
              .filter(e => e.origin !== item.origin)
              .map(e => ({ id: e.id, name: e.origin }));
        
        // Get unique origins if in origin mode
        const uniqueOptions = gameState.gameMode === 'origin' 
          ? Array.from(new Set(otherOptions.map(o => o.name)))
              .map(name => otherOptions.find(o => o.name === name))
              .filter(Boolean)
              .map(o => o!) // Type assertion since we filtered out undefined
          : otherOptions;
        
        // Select 3 random wrong options
        const selectedWrongOptions = uniqueOptions
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        // Combine correct and wrong options, then shuffle
        const options = [
          { id: correctOptionId, name: correctOptionName },
          ...selectedWrongOptions
        ].sort(() => Math.random() - 0.5);
        
        return {
          recording: item.letra.recording,
          options,
          correctOptionId
        };
      });
      
      setGameState(prev => ({
        ...prev,
        rounds: gameRounds,
        currentRoundIndex: 0,
        score: 0,
        showResult: false,
        selectedOptionId: null
      }));
    };
    
    setupGameRounds();
  }, [paloData, gameState.gameMode]);

  // Handle option selection
// Update the handleOptionSelect function 
const handleOptionSelect = (optionId: number) => {
    // Don't allow selection if result is already showing
    if (gameState.showResult) return;
    
    const currentRound = gameState.rounds[gameState.currentRoundIndex];
    const isCorrect = optionId === currentRound.correctOptionId;
    
    // Update score if correct
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
      }));
    }
    
    // Show result
    setGameState(prev => ({
      ...prev,
      showResult: true,
      selectedOptionId: optionId
    }));
    
    // Move to next round after delay
    setTimeout(() => {
      setGameState(prev => {
        // Check if this was the last round
        const isLastRound = prev.currentRoundIndex === prev.rounds.length - 1;
        
        if (isLastRound) {
          // Instead of showing game over, loop back to the first round
          // But shuffle the options first for variety
          const shuffledRounds = prev.rounds.map(round => ({
            ...round,
            options: [...round.options].sort(() => Math.random() - 0.5)
          }));
          
          return {
            ...prev,
            rounds: shuffledRounds,
            currentRoundIndex: 0, // Reset to first round
            showResult: false,
            selectedOptionId: null,
            // Don't reset the score - it continues accumulating
          };
        } else {
          // Move to next round
          return {
            ...prev,
            currentRoundIndex: prev.currentRoundIndex + 1,
            showResult: false,
            selectedOptionId: null
          };
        }
      });
    }, 1000); // 1 second delay
  };

  // Toggle game mode
//   const toggleGameMode = () => {
//     setGameState(prev => ({
//       ...prev,
//       gameMode: prev.gameMode === 'estilo' ? 'origin' : 'estilo',
//       currentRoundIndex: 0,
//       score: 0,
//       showResult: false,
//       selectedOptionId: null
//     }));
//   };

  // Restart game
  const restartGame = () => {
    setGameState(prev => ({
      ...prev,
      currentRoundIndex: 0,
      score: 0,
      showResult: false,
      selectedOptionId: null
    }));
  };

  if (loading) {
    return (
      <div className="guess-game__loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="guess-game__error">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!paloData || gameState.rounds.length === 0) {
    return <div className="guess-game__empty">No game data available</div>;
  }

  const currentRound = gameState.rounds[gameState.currentRoundIndex];
  const isGameOver = gameState.currentRoundIndex === gameState.rounds.length - 1 && gameState.showResult;

  return (
    <div className="guess-game">
      <div className="guess-game__container">
        <h1 className="guess-game__title">
          <span className="guess-game__title-main">Flamenco Guess Game</span>
          <span className="guess-game__title-palo">{paloData.name}</span>
        </h1>
        
        {/* Game stats */}
        <div className="guess-game__stats">
          <div className="guess-game__stat">
            <span className="guess-game__stat-label">Round</span>
            <span className="guess-game__stat-value">{gameState.currentRoundIndex + 1}</span>
          </div>
          <div className="guess-game__stat">
            <span className="guess-game__stat-label">Score</span>
            <span className="guess-game__stat-value">{gameState.score}</span>
          </div>
        </div>
  
        {/* Game area */}
        <div className="guess-game__area">
          {/* Audio player */}
          <div className="guess-game__audio-container">
            <div className="guess-game__audio-label">Listen to the recording</div>
            <audio 
              controls
              src={`data:audio/mp3;base64,${currentRound.recording}`}
              className="guess-game__audio-player"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
  
          {/* Options */}
          <div className="guess-game__question">
            <h3 className="guess-game__question-text">What estilo is this?</h3>
            <div className="guess-game__options">
              {currentRound.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={gameState.showResult}
                  className={`
                    guess-game__option
                    ${gameState.showResult ? 'guess-game__option--result-shown' : ''}
                    ${gameState.showResult && option.id === currentRound.correctOptionId ? 'guess-game__option--correct' : ''}
                    ${gameState.showResult && option.id === gameState.selectedOptionId && 
                      option.id !== currentRound.correctOptionId ? 'guess-game__option--incorrect' : ''}
                  `}
                >
                  <span className="guess-game__option-text">{option.name}</span>
                  {gameState.showResult && option.id === currentRound.correctOptionId && (
                    <span className="guess-game__option-icon guess-game__option-icon--correct">✓</span>
                  )}
                  {gameState.showResult && option.id === gameState.selectedOptionId && 
                    option.id !== currentRound.correctOptionId && (
                    <span className="guess-game__option-icon guess-game__option-icon--incorrect">×</span>
                  )}
                </button>
              ))}
            </div>
          </div>
  
          {/* Game over screen */}
          {isGameOver && (
            <div className="guess-game__overlay">
              <div className="guess-game__game-over">
                <h2 className="guess-game__game-over-title">Game Complete!</h2>
                <div className="guess-game__result">
                  <div className="guess-game__result-score">
                    <span className="guess-game__result-label">Your Score</span>
                    <span className="guess-game__result-value">{gameState.score} / {gameState.rounds.length}</span>
                  </div>
                  <div className="guess-game__result-percentage">
                    {Math.round((gameState.score / gameState.rounds.length) * 100)}%
                  </div>
                  <div className="guess-game__result-message">
                    {gameState.score === gameState.rounds.length ? 'Perfect! You know your flamenco!' : 
                     gameState.score > gameState.rounds.length * 0.7 ? 'Great job! You have good flamenco knowledge!' :
                     gameState.score > gameState.rounds.length * 0.4 ? 'Well done! Keep learning about flamenco!' :
                     'Keep practicing to improve your flamenco knowledge!'}
                  </div>
                </div>
                <button
                  onClick={restartGame}
                  className="guess-game__restart-button"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuessGame;