import React, { useState, useEffect } from 'react';
import '../style/GuessGame.scss';
import gameData from '../data/gameData.json';

// Types
interface Letra {
  id: number;
  content: string;
  artist: string;
  recording: string;
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

interface FilterState {
  selectedOrigins: string[];
  selectedEstilos: number[];
  showFilters: boolean;
}

const GuessGame: React.FC = () => {

  
  
  const [gameState, setGameState] = useState<GameState>({
    paloId: 1,
    currentRoundIndex: 0,
    rounds: [],
    score: 0,
    showResult: false,
    selectedOptionId: null,
    gameMode: 'estilo'
  });

  // Extract all unique origins and estilo IDs for filters
  const allOrigins = gameData ? [...new Set(gameData.estilos.map(estilo => estilo.origin))] : [];
  const allEstiloIds = gameData ? gameData.estilos.map(estilo => estilo.id) : [];
  
  // Initialize filter state with all options selected
  const [filters, setFilters] = useState<FilterState>({
    selectedOrigins: allOrigins,
    selectedEstilos: allEstiloIds,
    showFilters: false
  });

  // Toggle filter visibility
  const toggleFilters = () => {
    setFilters(prev => ({
      ...prev,
      showFilters: !prev.showFilters
    }));
  };

  // Handle origin filter changes
  const handleOriginChange = (origin: string) => {
    setFilters(prev => {
      const newSelectedOrigins = prev.selectedOrigins.includes(origin)
        ? prev.selectedOrigins.filter(o => o !== origin)
        : [...prev.selectedOrigins, origin];
        
      // Make sure at least one origin is selected
      if (newSelectedOrigins.length === 0) {
        return prev;
      }
      
      return {
        ...prev,
        selectedOrigins: newSelectedOrigins
      };
    });
  };

  // Handle estilo filter changes
  const handleEstiloChange = (estiloId: number) => {
    setFilters(prev => {
      const newSelectedEstilos = prev.selectedEstilos.includes(estiloId)
        ? prev.selectedEstilos.filter(id => id !== estiloId)
        : [...prev.selectedEstilos, estiloId];
        
      // Make sure at least one estilo is selected
      if (newSelectedEstilos.length === 0) {
        return prev;
      }
      
      return {
        ...prev,
        selectedEstilos: newSelectedEstilos
      };
    });
  };

  // Setup game rounds when palo data is loaded or filters change
  useEffect(() => {
    if (!gameData) return;
    
    // Create game rounds based on the current game mode and filters
    const setupGameRounds = () => {
      // Get all letras that have recordings and match the filters
      const filteredLetrasWithRecordings: {
        letra: Letra;
        estiloId: number;
        estiloName: string;
        origin: string;
      }[] = [];
      
      gameData.estilos.forEach(estilo => {
        // Skip if estilo doesn't match filters
        if (!filters.selectedEstilos.includes(estilo.id) || 
            !filters.selectedOrigins.includes(estilo.origin)) {
          return;
        }
        
        estilo.letras.forEach(letra => {
          if (letra.recording) {
            filteredLetrasWithRecordings.push({
              letra,
              estiloId: estilo.id,
              estiloName: estilo.name,
              origin: estilo.origin
            });
          }
        });
      });
      
      // If no letras match the filters, return early
      if (filteredLetrasWithRecordings.length === 0) {
        setGameState(prev => ({
          ...prev,
          rounds: [],
        }));
        return;
      }
      
      // Shuffle the letras for randomness
      const shuffledLetras = [...filteredLetrasWithRecordings].sort(() => Math.random() - 0.5);
      
      // Create game rounds
      const gameRounds: GameRound[] = shuffledLetras.map(item => {
        const correctOptionId = gameState.gameMode === 'estilo' ? item.estiloId : item.estiloId;
        const correctOptionName = gameState.gameMode === 'estilo' ? item.estiloName : item.origin;
        
        // Generate wrong options from filtered estilos only
        const filteredEstilos = gameData.estilos.filter(e => 
          filters.selectedEstilos.includes(e.id) && 
          filters.selectedOrigins.includes(e.origin)
        );
        
        // Generate 3 wrong options
        const otherOptions = gameState.gameMode === 'estilo'
          ? filteredEstilos
              .filter(e => e.id !== item.estiloId)
              .map(e => ({ id: e.id, name: e.name }))
          : filteredEstilos
              .filter(e => e.origin !== item.origin)
              .map(e => ({ id: e.id, name: e.origin }));
        
        // Get unique origins if in origin mode
        const uniqueOptions = gameState.gameMode === 'origin' 
          ? Array.from(new Set(otherOptions.map(o => o.name)))
              .map(name => otherOptions.find(o => o.name === name))
              .filter(Boolean)
              .map(o => o!)
          : otherOptions;
        
        // Select up to 3 random wrong options (might be fewer if not enough estilos/origins)
        const selectedWrongOptions = uniqueOptions
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(3, uniqueOptions.length));
        
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
  }, [gameData, gameState.gameMode, filters.selectedOrigins, filters.selectedEstilos]);

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
          // Instead of showing game over, loop back to the first round
          // But shuffle the options first for variety
          const shuffledRounds = prev.rounds.map(round => ({
            ...round,
            options: [...round.options].sort(() => Math.random() - 0.5)
          }));
          
          return {
            ...prev,
            rounds: shuffledRounds,
            currentRoundIndex: 0,
            showResult: false,
            selectedOptionId: null,
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
    }, 1000);
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

  if (!gameData || gameState.rounds.length === 0) {
    return (
      <div className="guess-game">
        <div className="guess-game__container">
          <h1 className="guess-game__title">
            <span className="guess-game__title-main">Flamenco Guess Game</span>
            <span className="guess-game__title-palo">{gameData?.palo.name|| 'Loading...'}</span>
          </h1>
          
          {/* Filter Controls */}
          {renderFilterControls()}
          
          <div className="guess-game__empty">
            No game data available with current filters. Please adjust your filters.
          </div>
        </div>
      </div>
    );
  }

  const currentRound = gameState.rounds[gameState.currentRoundIndex];
  const isGameOver = gameState.currentRoundIndex === gameState.rounds.length - 1 && gameState.showResult;

  // Function to render filter controls
  function renderFilterControls() {
    return (
      <div className="guess-game__filter-section">
        <button 
          className="guess-game__filter-toggle"
          onClick={toggleFilters}
        >
          {filters.showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        {filters.showFilters && (
          <div className="guess-game__filters">
            <div className="guess-game__filter-group">
              <h4 className="guess-game__filter-title">Filter by Origin:</h4>
              <div className="guess-game__filter-options">
                {allOrigins.map(origin => (
                  <label key={origin} className="guess-game__filter-label">
                    <input
                      type="checkbox"
                      checked={filters.selectedOrigins.includes(origin)}
                      onChange={() => handleOriginChange(origin)}
                      className="guess-game__filter-checkbox"
                    />
                    <span className="guess-game__filter-text">{origin}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="guess-game__filter-group">
              <h4 className="guess-game__filter-title">Filter by Estilo:</h4>
              <div className="guess-game__filter-options">
                {gameData?.estilos.map(estilo => (
                  <label key={estilo.id} className="guess-game__filter-label">
                    <input
                      type="checkbox"
                      checked={filters.selectedEstilos.includes(estilo.id)}
                      onChange={() => handleEstiloChange(estilo.id)}
                      className="guess-game__filter-checkbox"
                    />
                    <span className="guess-game__filter-text">{estilo.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="guess-game">
      <div className="guess-game__container">
        <h1 className="guess-game__title">
          <span className="guess-game__title-main">Flamenco Guess Game</span>
          <span className="guess-game__title-palo">{gameData.palo.name}</span>
        </h1>
        
        {/* Filter Controls */}
        {renderFilterControls()}
        
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
              src={currentRound.recording}
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