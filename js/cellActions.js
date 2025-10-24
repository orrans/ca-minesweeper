function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]
    const boardSize = gLevel.ROWS * gLevel.COLLS
    var elMinesRemained = document.querySelector('.mines-remained')

    if (isPlacingMines) {
        if (cell.isMine) {
            cell.isMine = false
            cell.isShown = false
            minesToPlace++
            elMinesRemained.innerText = minesToPlace
        } else {
            cell.isMine = true
            cell.isShown = true
            minesToPlace--
            elMinesRemained.innerText = minesToPlace
        }

        renderCell(i, j)

        if (minesToPlace <= 0) {
            isPlacingMines = false

            setMinesNegsCount(gBoard)

            gGame.markedCount = gLevel.MINES
            document.querySelector('.flags-counter').innerText = gGame.markedCount

            setTimeout(() => {
                for (let x = 0; x < gBoard.length; x++) {
                    for (let y = 0; y < gBoard[x].length; y++) {
                        const c = gBoard[x][y]
                        if (c.isMine) c.isShown = false
                        renderCell(x, y)
                    }
                }

                gGame.isOn = false
                gGame.revealedCount = 0
                elMinesRemained.innerText = ''
            }, 500)
        }

        return
    }

    if (cell.isShown || cell.isMarked) return

    if (isHintActivated) {
        hintReveal(i, j)
        return
    }

    if (isMegaHintActivated) {
        if (!gMegaHintFirstCorner) {
            gMegaHintFirstCorner = { i, j }
            elCell.classList.add('hint-selection')
            return
        } else {
            megaHintReveal(gMegaHintFirstCorner, { i, j })

            isMegaHintActivated = false
            gMegaHintFirstCorner = null
            document
                .querySelectorAll('.hint-selection')
                .forEach((cell) => cell.classList.remove('hint-selection'))
        }
        return
    }

    if (gGame.revealedCount === 0 && !gGame.isOn && !isPlacingMines) {
        startTimer()

        let foundMine = false
        for (let x = 0; x < gBoard.length && !foundMine; x++) {
            for (let y = 0; y < gBoard[x].length; y++) {
                if (gBoard[x][y].isMine) {
                    foundMine = true
                    break
                }
            }
        }

        if (!foundMine) {
            addMines(gBoard, i, j)
        }

        setMinesNegsCount(gBoard)
        gGame.isOn = true
    }

    saveGameState()

    if (!gGame.isOn) return

    if (cell.isMine) {
        loseLife()
        cell.isShown = true
        renderCell(i, j)

        if (!checkGameOver()) {
            setTimeout(() => {
                cell.isShown = false
                renderCell(i, j)
                const elCell = document.querySelector(`.cell-${i}-${j}`)
                if (elCell && !cell.isShown) elCell.innerHTML = '<span></span>'
            }, 1000)
        } else {
            revealAllMines(gBoard, i, j)
            elCell.style.background = 'red'
        }

        return
    }

    expandReveal(gBoard, i, j)

    if (CheckWinCondition()) {
        gGame.isOn = false
        const elSmiley = document.querySelector('.smiley')
        elSmiley.src = COOL_SMILEY
        stopTimer()
        setHighScore()
        renderHighScores()
    }
}

function onCellMarked(event, elCell, i, j) {
    event.preventDefault()
    const cell = gBoard[i][j]
    if (cell.isShown) return

    saveGameState()

    const elFlagsCounter = document.querySelector('.flags-counter')
    const wasFlagged = cell.markState === 1

    cell.markState = (cell.markState + 1) % 3

    if (cell.markState === 1) {
        elCell.innerHTML = FLAG
        cell.isMarked = true
        gGame.markedCount--
        if (cell.isMine) gGame.correctMarkedMines++
    } else {
        cell.isMarked = false
        elCell.innerHTML = cell.markState === 2 ? QUESTION_MARK : '<span></span>'

        if (wasFlagged) {
            gGame.markedCount++
            if (cell.isMine) gGame.correctMarkedMines--
        }
    }

    elFlagsCounter.innerText = gGame.markedCount

    if (CheckWinCondition()) {
        gGame.isOn = false
        const elSmiley = document.querySelector('.smiley')
        elSmiley.src = COOL_SMILEY
        stopTimer()
        setHighScore()
        renderHighScores()
    }
}

function expandReveal(board, i, j) {
    if (i < 0 || i >= board.length || j < 0 || j >= board[i].length) return

    const cell = board[i][j]

    if (cell.isShown || cell.isMarked || cell.isMine) return

    cell.isShown = true
    gGame.revealedCount++
    renderCell(i, j)

    if (cell.minesAroundCount === 0) {
        for (let row = i - 1; row <= i + 1; row++) {
            for (let col = j - 1; col <= j + 1; col++) {
                expandReveal(board, row, col)
            }
        }
    }
}

function revealAllMines(board, iIdx, jIdx) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const cell = board[i][j]
            if (!cell.isMine) continue
            if (i === iIdx && j === jIdx) continue

            cell.isShown = true
            renderCell(i, j)
        }
    }
}
