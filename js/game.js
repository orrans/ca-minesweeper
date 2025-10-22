'use strict'

var gBoard
const MINE = '<img src="./img/bomb.png" alt="mine">'
const FLAG = '<img src="./img/flag.png" alt="flag">'
const SMILEY = './img/smiley-face.png'
const SAD_SMILEY = './img/dead-face.png'
const COOL_SMILEY = './img/cool-face.png'
const HINT = './img/hint.png'
const HINT_USED = './img/hint-used.png'
const LIFE = './img/life.png'
const LIFE_LOST = './img/life-lost.png'

var isHintActivated = false

var gLevel = {
    ROWS: 4,
    COLLS: 4,
    MINES: 2,
}

var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    safeClicks: 3,
}

function onInit() {
    var elSmiley = document.querySelector('.smiley')
    const elHints = document.querySelectorAll('.hint')
    var clicksRemained = document.querySelector('.safe-clicks-remains')
    const elLives = document.querySelectorAll('.life')

    clicksRemained.innerText = gGame.safeClicks
    elSmiley.src = SMILEY
    isHintActivated = false

    buildBoard()
    renderBoard(gBoard)
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        safeClicks: 3,
    }
    elHints.forEach((hint) => {
        hint.classList.remove('used')
        hint.src = HINT
    })
    elLives.forEach(life => {
        life.classList.remove('lost')
        life.src = LIFE
    });
}

function changeDifficulty(rows, colls, mines) {
    gLevel.ROWS = rows
    gLevel.COLLS = colls
    gLevel.MINES = mines
    onInit()
    buildBoard()
    renderBoard(gBoard)
}

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
    for (var i = 0; i < gLevel.ROWS; i++) {
        for (var j = 0; j < gLevel.COLLS; j++) {
            if (board[i][j].isMine) {
                countNeighborMines(i, j, board)
            }
        }
    }
}

function renderBoard(board) {
    var mineBoard = document.querySelector('.game-board')
    var strHTML = ''

    for (let i = 0; i < gLevel.ROWS; i++) {
        strHTML += '<tr>\n'
        for (let j = 0; j < gLevel.COLLS; j++) {
            const cell = board[i][j]
            var classes = `cell cell-${i}-${j} `
            if (cell.isShown) classes += 'shown'
            const content = cell.isMine ? MINE : cell.minesAroundCount || ``
            strHTML += `

              <td class="${classes}" oncontextmenu="onCellMarked(event, this, ${i}, ${j})" onclick="onCellClicked(this, ${i}, ${j})">
                  <span>${content}</span>
              </td>`
        }
        strHTML += '</tr>\n'
    }
    mineBoard.innerHTML = strHTML
}

function renderCell(i, j) {
    const cell = gBoard[i][j]
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    const elSpan = elCell.querySelector('span')

    const content = cell.isMine ? MINE : cell.minesAroundCount || ''
    elSpan.innerHTML = content

    if (cell.isShown) {
        elCell.classList.add('shown')
        elSpan.style.visibility = 'visible'
    } else {
        elCell.classList.remove('shown')
        elSpan.style.visibility = 'hidden'
    }

    if (cell.isMarked) {
        elSpan.innerHTML = FLAG
        elSpan.style.visibility = 'visible'
    }
}

function onHintClicked(elHint) {
    if (elHint.classList.contains('used') || isHintActivated) return
    elHint.src = HINT_USED
    elHint.classList.add('used')
    isHintActivated = true
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

function loseLife() {
    const elLives = document.querySelectorAll('.life')
    if (gGame.lives <= 0) return

    for (let i = elLives.length - 1; i >= 0; i--) {
        const elLife = elLives[i]
        if (!elLife.classList.contains('lost')) {
            elLife.classList.add('lost')
            elLife.src = LIFE_LOST
            gGame.lives--
            return
        }
    }
}

function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]
    const boardSize = gLevel.ROWS * gLevel.COLLS

    if (cell.isShown || cell.isMarked) return

    if (isHintActivated) {
        hintReveal(i, j)
        return
    }

    if (gGame.revealedCount === 0 && !gGame.isOn) {
        addMines(gBoard, i, j)
        setMinesNegsCount(gBoard)
        gGame.isOn = true
    }

    if (!gGame.isOn) return

    if (cell.isMine) {
        loseLife()
        cell.isShown = true
        renderCell(i, j)

        if (!checkGameOver()) {
            setTimeout(() => {
                cell.isShown = false
                renderCell(i, j)
            }, 500)
        }
        return
    }

    expandReveal(gBoard, i, j)

    if (gGame.revealedCount === boardSize - gLevel.MINES) {
        gGame.isOn = false
        var elSmiley = document.querySelector('.smiley')
        elSmiley.src = COOL_SMILEY
        console.log('You won!')
    }
}

function onSafeClicked() {
    if (!gGame.isOn) return
    if (gGame.safeClicks <= 0) return
    var isRevealed = false
    var clicksRemained = document.querySelector('.safe-clicks-remains')
    while (!isRevealed) {
        var iRandom = getRandomNumInclusive(0, gLevel.ROWS - 1)
        var jRandom = getRandomNumInclusive(0, gLevel.COLLS - 1)
        var cell = gBoard[iRandom][jRandom]

        if (cell.isMine || cell.isShown || cell.isMarked) continue

        cell.isShown = true
        renderCell(iRandom, jRandom)
        const elCell = document.querySelector(`.cell-${iRandom}-${jRandom}`)
        elCell.style.backgroundColor = '#8f8'

        setTimeout(() => {
            elCell.style.backgroundColor = ''
            cell.isShown = false
            renderCell(iRandom, jRandom)
        }, 1500)

        isRevealed = true
    }
    gGame.safeClicks--
    clicksRemained.innerText = gGame.safeClicks
}

function onCellMarked(event, elCell, i, j) {
    event.preventDefault()
    const cell = gBoard[i][j]
    if (cell.isShown) return

    cell.isMarked = !cell.isMarked
    renderCell(i, j)
}

function checkGameOver() {
    var elSmiley = document.querySelector('.smiley')
    if (gGame.lives === 0) {
        elSmiley.src = SAD_SMILEY
        gGame.isOn = false
        return true
    }
    return false
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
