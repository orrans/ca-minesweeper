function buildBoard() {
    gBoard = createMat(gLevel.ROWS, gLevel.COLLS)
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
}

function addMines(board, excludeI, excludeJ) {
    var minesPlaced = 0
    while (minesPlaced < gLevel.MINES) {
        const i = getRandomNumInclusive(0, board.length - 1)
        const j = getRandomNumInclusive(0, board[0].length - 1)
        if ((i === excludeI && j === excludeJ) || board[i][j].isMine) continue
        if (!board[i][j].isMine) {
            board[i][j].isMine = true
            minesPlaced++
        }
    }
}

function setMinesNegsCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = 0
        }
    }

    for (var i = 0; i < gLevel.ROWS; i++) {
        for (var j = 0; j < gLevel.COLLS; j++) {
            if (board[i][j].isMine) {
                countNeighborMines(i, j, board)
            }
        }
    }
}

function countNeighborMines(rowIdx, colIdx, board) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            if (!board[i][j].isMine) board[i][j].minesAroundCount++
        }
    }
}