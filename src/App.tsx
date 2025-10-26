import {useState} from 'react';

// ---- Types ------------------------------------------------------------------

type SquareValue = "X" | "O" | null;
type SquaresArray = SquareValue[];

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  highlight?: boolean;
}

interface BoardProps {
  xIsNext: boolean;
  squares: SquaresArray;
  onPlay: (nextSquares: SquaresArray) => void;
}

interface WinnerInfo {
  winner: Exclude<SquareValue, null>;
  line: [number, number, number];
}


// ---- Square Component -------------------------------------------------------

function Square({value, onSquareClick, highlight = false}: SquareProps) {
	return (
    <button
      className={"square" + (highlight ? " highlight" : "")}
      onClick={onSquareClick}
      aria-label={`Square ${value ?? "empty"}`}
    >
      {value}
    </button>
  );
}


// ---- Board Component --------------------------------------------------------

function Board({xIsNext, squares, onPlay}: BoardProps) {
  // Handle square click
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext
      ? "X"
      : "O";
    onPlay(nextSquares)
  }

  const winnerInfo = calculateWinner(squares);
  const winningSquares = winnerInfo ? winnerInfo.line : [];
  const status = winnerInfo
    ? `Winner: ${winnerInfo.winner}`
    : `Next player: " + ${xIsNext ? "X" : "O"}`;

  const rows = [];
  for (let row = 0; row < 3; row++) {
    const squaresInRow = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      squaresInRow.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          highlight={winningSquares.includes(index)}
        />
      );
    }
    rows.push(<div key={row} className="board-row">{squaresInRow}</div>)
  }

  return (
    <>
      <div className="status">{status}</div>
      {rows}
    </>
  )
}


// ---- Game Component ---------------------------------------------------------

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: SquaresArray) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    if (move === currentMove) {
      return (
        <li key={move}>
          You are at move #{move}
        </li>
      )
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{getDescription(move)}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
        />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}


// ---- Helper Functions -------------------------------------------------------

function getDescription(move: number): string {
  return (
    move > 0
      ? `Go to move #${move}`
      : "Go to game start"
  );
}

function calculateWinner(squares: SquaresArray): WinnerInfo | null {
  const lines: [number, number, number][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {winner: squares[a], line: [a, b, c]};
    }
  }
  return null;
}