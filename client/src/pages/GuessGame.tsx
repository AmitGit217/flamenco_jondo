import React, { useState, useEffect } from 'react';
import { getPalo } from '../api/palo';
import { Spinner } from '../components/Spinner';

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
  const [loading, setLoading] = useState(true);
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

  // Initial data fetch
  useEffect(() => {
    const fetchPaloData = async () => {
      try {
        setLoading(true);
        const response = await getPalo(gameState.paloId);
        setPaloData(response);
      } catch (err) {
        console.error('Failed to fetch palo data:', err);
        setError('Failed to load game data. Please try again.');
      } finally {
        setLoading(false);
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
          // Game over, stay on the same round but keep showing results
          return {
            ...prev,
            showResult: true
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
    }, 750); // 0.75 seconds delay
  };

  // Toggle game mode
  const toggleGameMode = () => {
    setGameState(prev => ({
      ...prev,
      gameMode: prev.gameMode === 'estilo' ? 'origin' : 'estilo',
      currentRoundIndex: 0,
      score: 0,
      showResult: false,
      selectedOptionId: null
    }));
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-4">{error}</p>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!paloData || gameState.rounds.length === 0) {
    return <div className="p-4">No game data available</div>;
  }

  const currentRound = gameState.rounds[gameState.currentRoundIndex];
  const isGameOver = gameState.currentRoundIndex === gameState.rounds.length - 1 && gameState.showResult;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Flamenco Guess Game - {paloData.name}
      </h1>
      
      {/* Game mode toggle */}
      <div className="flex justify-center mb-8">
        <button
          className={`px-4 py-2 rounded-l-md ${
            gameState.gameMode === 'estilo' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200'
          }`}
          onClick={() => gameState.gameMode !== 'estilo' && toggleGameMode()}
        >
          Guess Estilo
        </button>
        <button
          className={`px-4 py-2 rounded-r-md ${
            gameState.gameMode === 'origin' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200'
          }`}
          onClick={() => gameState.gameMode !== 'origin' && toggleGameMode()}
        >
          Guess Origin
        </button>
      </div>

      {/* Game stats */}
      <div className="bg-gray-100 p-4 rounded-md mb-6 text-center">
        <div className="text-lg">
          Round: {gameState.currentRoundIndex + 1} / {gameState.rounds.length}
        </div>
        <div className="text-lg">
          Score: {gameState.score}
        </div>
      </div>

      {/* Game area */}
      <div className="max-w-2xl mx-auto">
        {/* Audio player */}
        <div className="mb-8 flex justify-center">
          <audio 
            controls
            src={`data:audio/mp3;base64,${currentRound.recording}`}
            className="w-full"
          >
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {currentRound.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={gameState.showResult}
              className={`
                p-4 rounded-md text-center font-medium transition-colors
                ${gameState.showResult
                  ? option.id === currentRound.correctOptionId
                    ? 'bg-green-500 text-white'
                    : option.id === gameState.selectedOptionId
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200'
                  : 'bg-blue-100 hover:bg-blue-200'
                }
              `}
            >
              {option.name}
            </button>
          ))}
        </div>

        {/* Game over screen */}
        {isGameOver && (
          <div className="mt-8 p-6 bg-gray-100 rounded-md text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-6">
              Your Score: {gameState.score} / {gameState.rounds.length}
              <span className="block mt-2 text-lg">
                ({Math.round((gameState.score / gameState.rounds.length) * 100)}%)
              </span>
            </p>
            <button
              onClick={restartGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuessGame;