function onHintClicked(elHint) {
    if (!gGame.isOn) return
    if (elHint.classList.contains('used') || isHintActivated) return
    var isMega = elHint.classList.contains('mega')
    elHint.src = HINT_USED
    elHint.classList.add('used')
    if (isMega) {
        isMegaHintActivated = true
    } else {
        isHintActivated = true
    }
}

function hintReveal(iIdx, jIdx) {
    const revealedNow = []

    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue

            const cell = gBoard[i][j]
            if (!cell.isShown) {
                cell.isShown = true
                renderCell(i, j)
                revealedNow.push({ i, j })
            }
        }
    }

    setTimeout(() => {
        for (const pos of revealedNow) {
            const cell = gBoard[pos.i][pos.j]
            cell.isShown = false
            renderCell(pos.i, pos.j)
        }
    }, 1500)

    isHintActivated = false
}

function megaHintReveal(firstCorner, secondCorner) {
    const revealedCells = []

    const startRow = Math.min(firstCorner.i, secondCorner.i)
    const endRow = Math.max(firstCorner.i, secondCorner.i)
    const startCol = Math.min(firstCorner.j, secondCorner.j)
    const endCol = Math.max(firstCorner.j, secondCorner.j)

    for (let i = startRow; i <= endRow; i++) {
        for (let j = startCol; j <= endCol; j++) {
            const cell = gBoard[i][j]

            if (!cell.isShown) {
                cell.isShown = true
                renderCell(i, j)
                revealedCells.push({ i, j })
            }
        }
    }

    setTimeout(() => {
        for (const pos of revealedCells) {
            const cell = gBoard[pos.i][pos.j]
            cell.isShown = false
            renderCell(pos.i, pos.j)
        }
    }, 2000)
}

function onTerminateClicked() {
    if (isPlacingMines || !gGame.isOn) return
    const elTerminate = document.querySelector('.exterminator')
    if (elTerminate.classList.contains('used')) return
    const mines = []

    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine) mines.push({ i, j })
        }
    }

    if (mines.length === 0) return

    var minesToRemove = Math.min(3, mines.length)
    if (minesToRemove <= 2) minesToRemove = Math.floor(minesToRemove / 2)
    for (let k = 0; k < minesToRemove; k++) {
        const randomIndex = getRandomNumInclusive(0, mines.length - 1)
        const mine = mines[randomIndex]

        gBoard[mine.i][mine.j].isMine = false

        mines.splice(randomIndex, 1)
    }

    gGame.markedCount -= minesToRemove
    document.querySelector('.flags-counter').innerText = gGame.markedCount

    setMinesNegsCount(gBoard)
    renderBoard(gBoard)

    elTerminate.src = TERMINATOR_USED
    elTerminate.classList.add('used')
}

function onPlaceMinesClicked() {
    const elMinesRemained = document.querySelector('.mines-remained')
    const elPlaceIcon = document.querySelector('.place-mines')

    if (isPlacingMines) {
        isPlacingMines = false
        elMinesRemained.innerText = ''
        onInit()
        return
    }
    fullReset()
    isPlacingMines = true

    minesToPlace = gLevel.MINES

    elPlaceIcon.classList.add('active')

    elMinesRemained.innerText = minesToPlace

    resetVisualState()
    gGame.isOn = false
}

function onSafeClicked() {
    if (!gGame.isOn) return
    if (gGame.safeClicks <= 0) return

    var clicksRemained = document.querySelector('.safe-clicks-remains')
    var isRevealed = false

    while (!isRevealed) {
        var iRandom = getRandomNumInclusive(0, gLevel.ROWS - 1)
        var jRandom = getRandomNumInclusive(0, gLevel.COLLS - 1)
        var cell = gBoard[iRandom][jRandom]

        if (cell.isMine || cell.isShown || cell.isMarked) continue

        cell.isShown = true
        renderCell(iRandom, jRandom)

        const elCell = document.querySelector(`.cell-${iRandom}-${jRandom}`)
        if (!elCell) return

        elCell.style.backgroundColor = '#a5c2f0'

        setTimeout(() => {
            const sameCell = document.querySelector(`.cell-${iRandom}-${jRandom}`)
            if (!sameCell) return
            sameCell.style.backgroundColor = ''
            cell.isShown = false
            renderCell(iRandom, jRandom)
        }, 1500)

        isRevealed = true
    }

    gGame.safeClicks--
    clicksRemained.innerText = gGame.safeClicks
}
