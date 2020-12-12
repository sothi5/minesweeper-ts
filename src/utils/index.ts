import { MAX_ROWS, MAX_COLUMNS, NO_OF_BOMBS } from "../constans";
import { Cell, CellValue, CellState } from "../types";

export const generateCells = (): Cell[][] => {
    let cells: Cell[][] = [];

    // generating all cells 
    for (let row = 0; row < MAX_ROWS; row++) {
        cells.push([]);

        for (let col = 0; col < MAX_COLUMNS; col++) {
            cells[row].push({
                value: CellValue.none,
                state: CellState.open
            });
        }
    }

    // randomly put 10 bombs
    let bombsPlaced = 0;

    while(bombsPlaced < NO_OF_BOMBS) {
        const randomRow = Math.floor(Math.random() * MAX_ROWS);
        const randomCol = Math.floor(Math.random() * MAX_COLUMNS);

        const currentCell = cells[randomRow][randomCol];

        if (currentCell.value !== CellValue.bomb) {
            cells[randomRow][randomCol] = { ...cells[randomRow][randomCol], value: CellValue.bomb };
            bombsPlaced++;
        }
    }

    // calculate the numbers for each cell
    for (let rowIndex = 0; rowIndex < MAX_ROWS; rowIndex++) {
        for (let colIndex = 0; colIndex < MAX_COLUMNS; colIndex++) {
            const currentCell = cells[rowIndex][colIndex];

            if (currentCell.value === CellValue.bomb) {
                continue;
            }

            let numberOfBombs = 0;
            const topLeftBomb = rowIndex > 0 && colIndex > 0 ? cells[rowIndex - 1][colIndex - 1] : null;
            const topBomb = rowIndex > 0 ? cells[rowIndex - 1][colIndex] : null;
            const topRightBomb = rowIndex > 0 && colIndex < MAX_COLUMNS - 1 ? cells[rowIndex - 1][colIndex + 1] : null;
            const leftBomb = colIndex > 0 ? cells[rowIndex][colIndex - 1] : null;
            const rightBomb = colIndex < MAX_COLUMNS - 1 ? cells[rowIndex][colIndex + 1] : null;
            const bottomLeftBomb = rowIndex < MAX_ROWS - 1 && colIndex > 0 ? cells[rowIndex + 1][colIndex - 1] : null;
            const bottomBomb = rowIndex < MAX_ROWS - 1 ? cells[rowIndex + 1][colIndex] : null;
            const bottomRightBomb = rowIndex < MAX_ROWS - 1 && colIndex < MAX_COLUMNS - 1 ? cells[rowIndex + 1][colIndex + 1] : null;

            (topLeftBomb?.value === CellValue.bomb) && numberOfBombs++;
            (topBomb?.value === CellValue.bomb) && numberOfBombs++;
            (topRightBomb?.value === CellValue.bomb) && numberOfBombs++;
            (leftBomb?.value === CellValue.bomb) && numberOfBombs++;
            (rightBomb?.value === CellValue.bomb) && numberOfBombs++;
            (bottomLeftBomb?.value === CellValue.bomb) && numberOfBombs++;
            (bottomBomb?.value === CellValue.bomb) && numberOfBombs++;
            (bottomRightBomb?.value === CellValue.bomb) && numberOfBombs++;

            if (numberOfBombs > 0) {
                cells[rowIndex][colIndex] = {
                    ...currentCell,
                    value: numberOfBombs
                }
            }
        }
    }

    return cells;
}