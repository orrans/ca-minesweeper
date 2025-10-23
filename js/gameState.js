function onUndoClicked() {
    if (!gPrevGameState.board || !gPrevGameState.game) return

    gBoard = structuredClone(gPrevGameState.board)
    gGame = structuredClone(gPrevGameState.game)
    renderBoard(gBoard)
    document.querySelector('.flags-counter').innerText = gGame.markedCount
}


function saveGameState() {
    const safeBoard = gBoard.map((row) =>
        row.map((cell) => ({
            isMine: cell.isMine,
            isMarked: cell.isMarked,
            isShown: cell.isShown,
            minesAroundCount: cell.minesAroundCount,
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
