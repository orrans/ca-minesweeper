function onUndoClicked() {
    if (
        !gPrevGameState.board ||
        !gPrevGameState.game ||
        gGame.lives < gPrevGameState.game.lives ||
        !gGame.isOn
    )
        return
    const currentSafeClicks = gGame.safeClicks
    gBoard = structuredClone(gPrevGameState.board)
    gGame = structuredClone(gPrevGameState.game)
    gGame.safeClicks = currentSafeClicks
    renderBoard(gBoard)
    document.querySelector('.flags-counter').innerText = gGame.markedCount

    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isShown && !cell.isMine) {
                renderCell(i, j, cell.minesAroundCount || '')
            }
        }
    }
}

function saveGameState() {
    const safeBoard = gBoard.map((row) =>
        row.map((cell) => ({
            isMine: cell.isMine,
            isMarked: cell.isMarked,
            isShown: cell.isShown,
            minesAroundCount: cell.minesAroundCount,
            markState: cell.markState,
        }))
    )

    gPrevGameState = {
        board: safeBoard,
        game: structuredClone(gGame),
    }
}

function getCellCoords(elCell) {
    var className = null
    var classList = elCell.classList

    for (var i = 0; i < classList.length; i++) {
        if (classList[i].includes('cell-')) {
            className = classList[i]
            break
        }
    }

    if (!className) return null

    var parts = className.split('-')
    var row = +parts[1]
    var col = +parts[2]

    return { i: row, j: col }
}
