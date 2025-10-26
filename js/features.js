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
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            if (!elCell) continue

            if (!cell.isShown) {
                const originalContent = elCell.innerHTML

                cell.isShown = true

                let newContent = ''
                if (cell.isMine) {
                    newContent = MINE
                } else if (cell.minesAroundCount > 0) {
                    newContent = cell.minesAroundCount
                    elCell.classList.add(`num-${cell.minesAroundCount}`)
                }

                elCell.innerHTML = `<span>${newContent}</span>`
                elCell.classList.add('shown')
                elCell.style.backgroundColor = '#a5c2f0'

                revealedNow.push({ i, j, originalContent })
            }
        }
    }

    setTimeout(() => {
        for (const pos of revealedNow) {
            const cell = gBoard[pos.i][pos.j]
            cell.isShown = false

            const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
            if (elCell) {
                elCell.style.backgroundColor = ''
                elCell.innerHTML = pos.originalContent
                elCell.classList.remove('shown')

                for (let k = 1; k <= 8; k++) {
                    elCell.classList.remove(`num-${i}`)
                }
            }
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
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            if (!elCell) continue

            if (!cell.isShown) {
                const originalContent = elCell.innerHTML

                cell.isShown = true

                let newContent = ''
                if (cell.isMine) {
                    newContent = MINE
                } else if (cell.minesAroundCount > 0) {
                    newContent = cell.minesAroundCount
                    elCell.classList.add(`num-${cell.minesAroundCount}`)
                }

                elCell.innerHTML = `<span>${newContent}</span>`
                elCell.classList.add('shown')
                elCell.style.backgroundColor = '#a5c2f0'

                revealedCells.push({ i, j, originalContent })
            }
        }
    }

    setTimeout(() => {
        for (const pos of revealedCells) {
            const cell = gBoard[pos.i][pos.j]
            cell.isShown = false

            const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
            if (elCell) {
                elCell.style.backgroundColor = ''
                elCell.innerHTML = pos.originalContent
                elCell.classList.remove('shown')

                for (let i = 1; i <= 8; i++) {
                    elCell.classList.remove(`num-${i}`)
                }
            }
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

    const safeCells = []
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            if (!cell.isMine && !cell.isShown && !cell.isMarked) {
                safeCells.push({ i, j })
            }
        }
    }

    if (safeCells.length === 0) {
        return
    }

    var clicksRemained = document.querySelector('.safe-clicks-remains')

    const randomIdx = getRandomNumInclusive(0, safeCells.length - 1)
    const { i, j } = safeCells[randomIdx]
    const cell = gBoard[i][j]

    cell.isShown = true
    renderCell(i, j)

    const elCell = document.querySelector(`.cell-${i}-${j}`)
    if (!elCell) return

    elCell.style.backgroundColor = '#a5c2f0'

    setTimeout(() => {
        const sameCell = document.querySelector(`.cell-${i}-${j}`)
        if (!sameCell) return
        sameCell.style.backgroundColor = ''
        cell.isShown = false
        renderCell(i, j)
    }, 1500)

    gGame.safeClicks--
    clicksRemained.innerText = gGame.safeClicks
}