'use strict'

var gBoard
const MINE = '<img src="./img/bomb.png" alt="mine">'
const FLAG = '<img src="./img/flag.png" alt="flag">'
const SMILEY = './img/smiley-face.png'
const SAD_SMILEY = './img/dead-face.png'
const COOL_SMILEY = './img/cool-face.png'

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
}

function onInit() {
    var elSmiley = document.querySelector('.smiley')
    elSmiley.src = SMILEY
    buildBoard()
    renderBoard(gBoard)
    console.log(`${gGame.lives} lives left`)
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
    }
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

function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]
    const boardSize = gLevel.ROWS * gLevel.COLLS

    if (cell.isShown || cell.isMarked) return

    if (gGame.revealedCount === 0) {
        addMines(gBoard, i, j)
        setMinesNegsCount(gBoard)
        gGame.isOn = true
    }
    if (!gGame.isOn) return

    cell.isShown = true
    renderCell(i, j)

    if (cell.isMine) {
        gGame.lives--
        console.log(`${gGame.lives} lives left`)
        if (!checkGameOver()) {
            setTimeout(() => {
                cell.isShown = false
                renderCell(i, j)
            }, 500)
        }
        return
    }
    gGame.revealedCount++
    if (gGame.revealedCount === boardSize - gLevel.MINES) {
        gGame.isOn = false
        var elSmiley = document.querySelector('.smiley')
        elSmiley.src = COOL_SMILEY
    }
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

function expandReveal(board, elCell, i, j) {}

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
