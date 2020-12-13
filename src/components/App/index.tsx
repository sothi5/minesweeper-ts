import React, {useEffect, useState} from 'react';

import Button from "../Button";
import NumberDisplay from '../NumberDisplay';
import { generateCells, openMultipleCells } from "../../utils";
import { Cell, CellState, CellValue, Face } from "../../types";

import './App.scss';
import { MAX_ROWS, MAX_COLUMNS } from '../../constans';

const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [live, setLive] = useState<boolean>(false);
    const [bombCounter, setBombCounter] = useState<number>(10);
    const [hasLost, setHasLost] = useState<boolean>(false);
    const [hasWon, setHasWon] = useState<boolean>(false);

    useEffect(() => {
        const handleMouseDown = (): void => {
            setFace(Face.oh);
        }

        const handleMouseUp = (): void => {
            setFace(Face.smile);
        }

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mouseup', handleMouseUp);
        };
    }, []);

    useEffect(() => {
        if (live && time < 999) {
            const timer = setInterval(() => {
                setTime(time + 1);
            }, 1000);

            return () => {
                clearInterval(timer);
            }
        }
    }, [live, time]);

    useEffect(() => {
        if (hasLost) {
            setFace(Face.lose);
            setLive(false);
        }
    }, [hasLost]);

    useEffect(() => {
        if (hasWon) {
            setFace(Face.won);
            setLive(false);
        }
    }, [hasWon]);

    const handleCellClick = (rowParam: number, colParam: number) => (): void => {
        // start the game
        
        let newCells = cells.slice();
        
        if (!live) {
            if (newCells[rowParam][colParam].value === CellValue.bomb) {
                let isABomb = true;
                while (isABomb) {
                    newCells = generateCells();

                    if (newCells[rowParam][colParam].value !== CellValue.bomb) {
                        isABomb = false;
                        break;
                    }
                }
            }
            setLive(true);
        }

        const currentCell = newCells[rowParam][colParam];

        if ([CellState.flagged,  CellState.visible].includes(currentCell.state)) return;

        if (currentCell.value === CellValue.bomb) {
            setHasLost(true);
            newCells[rowParam][colParam].red = true;
            newCells = showAllBombs();
            setCells(newCells);
            return;
        } else if (currentCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam, colParam);
        } else {
            newCells[rowParam][colParam].state = CellState.visible;
        }

        // Check to see if you have won
        let safeOpenCellsExists = false;

        for(let row = 0; row < MAX_ROWS; row++) {
            for(let col = 0; col < MAX_COLUMNS; col++) {
                const currentCell = newCells[row][col];

                if (currentCell.value !== CellValue.bomb && currentCell.state === CellState.open) {
                    safeOpenCellsExists = true;
                    break;
                }
            }
        }

        if (!safeOpenCellsExists) {
            newCells = newCells.map(row => row.map(cell => {
                if (cell.value === CellValue.bomb) {
                    return {
                        ...cell,
                       state: CellState.flagged 
                    }
                }

                return cell;
            }));
            setHasWon(true);
        }

        setCells(newCells);
    }

    const handleCellContext = (rowParam: number, colParam: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        e.preventDefault();

        if (!live) return;

        const currentCells = cells.slice();
        const currentCell = cells[rowParam][colParam];

        if (currentCell.state === CellState.visible) {
            return;
        } else if (currentCell.state === CellState.open) {
            currentCells[rowParam][colParam].state = CellState.flagged;
            setCells(currentCells);
            setBombCounter(bombCounter - 1);
        } else if (currentCell.state === CellState.flagged) {
            currentCells[rowParam][colParam].state = CellState.open;
            setCells(currentCells);
            setBombCounter(bombCounter + 1);
        }
    }

    const handleFaceClick = (): void => {
        setLive(false);
        setTime(0);
        setCells(generateCells());
        setBombCounter(10);
        setHasLost(false);
        setHasWon(false);
    }

    const renderCells = (): React.ReactNode => {
        return cells.map((row, rowIndex) => row.map((cell, colIndex) => 
            <Button 
                col={colIndex}
                row={rowIndex} 
                key={`${rowIndex}-${colIndex}`}
                onClick={handleCellClick}
                onContext={handleCellContext}
                red={cell.red}
                state={cell.state} 
                value={cell.value}
            />
        ));
    }

    const showAllBombs = (): Cell[][] => {
        const currentCells = cells.slice();

        return currentCells.map(row => row.map(cell => { 
                if ( cell.value === CellValue.bomb ) {
                    return {
                        ...cell,
                        state: CellState.visible
                    }
                }

                return cell;
            })
        );
    }

    return (
        <div className="App">
            <div className="Header">
                <NumberDisplay value={bombCounter} />
                <div className="Face" onClick={handleFaceClick}>
                    <span role="img" aria-label="face">
                        {face}
                    </span>
                </div>
                <NumberDisplay value={time} />
            </div>
            <div className="Body">{renderCells()}</div>
        </div>
    )
}

export default App;
