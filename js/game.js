'use strict'

var gBoard
const MINE = '<img src="./img/bomb.png" alt="mine">'
const FLAG = '<img src="./img/flag.png" alt="flag">'
const SMILEY = '<img src="./img/smiley-face.png" alt="flag">'
const SAD_SMILEY = '<img src="./img/sad-face.png" alt="flag">'
const COOL_SMILEY = '<img src="./img/cool-face.png" alt="flag">'

var gLevel = {
    SIZE: 4,
    MINES: 2,
}

var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

function onInit() {
    buildBoard()
    console.table(gBoard)
    renderBoard(gBoard)
}

function buildBoard() {
    gBoard = createMat(gLevel.SIZE, gLevel.SIZE)
    var minesPlaced = 0
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

    // gBoard[0][0].isMine = true
    // gBoard[3][3].isMine = true
    while (minesPlaced < gLevel.MINES) {
        const i = getRandomNumInclusive(0, gBoard.length - 1)
        const j = getRandomNumInclusive(0, gBoard[0].length - 1)
        if (!gBoard[i][j].isMine) {
            gBoard[i][j].isMine = true
            minesPlaced++
        }
    }
}

function setMinesNegsCount(board) {
    const boardSize = gLevel.SIZE
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if (board[i][j].isMine) {
                countNeighborMines(i, j, board)
            }
        }
    }
}

function renderBoard(board) {
    var mineBoard = document.querySelector('.game-board')
    setMinesNegsCount(gBoard)

    var strHTML = ''

    var boardSize = gLevel.SIZE
    for (let i = 0; i < boardSize; i++) {
        strHTML += '<tr>\n'
        for (let j = 0; j < boardSize; j++) {
            const cell = board[i][j]
            var classes = `cell cell-${i}-${j}"`
            const content = cell.isMine ? MINE : cell.minesAroundCount || ``
            strHTML += `

              <td class="${classes}" onclick="onCellClicked(this, ${i}, ${j})">
                  <span>${content}</span>
              </td>`
        }
        strHTML += '</tr>\n'
    }
    mineBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (gGame.revealedCount === 0) {
    }
    elCell.classList.add('shown')
}

function onCellMarked(elCell, i, j) {}

function checkGameOver() {}

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
