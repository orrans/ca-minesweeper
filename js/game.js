'use strict'

var gBoard
var gPrevGameState = { board: null, game: null }

const MINE = '<img src="./img/bomb.png" alt="mine">'
const FLAG = '<img src="./img/flag.png" alt="flag">'
const SMILEY = './img/smiley-face.png'
const SAD_SMILEY = './img/dead-face.png'
const COOL_SMILEY = './img/cool-face.png'
const HINT = './img/hint.png'
const MEGA_HINT = './img/mega-hint.png'
const HINT_USED = './img/hint-used.png'
const LIFE = './img/life.png'
const LIFE_LOST = './img/life-lost.png'
const TERMINATOR = './img/exterminator.png'
const TERMINATOR_USED = './img/exterminator-used.png'

var isHintActivated = false

var gHighScores = {
    beginner: [],
    medium: [],
    expert: [],
}

var gLevel = {
    ROWS: 4,
    COLLS: 4,
    MINES: 2,
    DIFFICULTY: 'beginner',
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
    clearInterval(timerInterval)

    const elSmiley = document.querySelector('.smiley')
    const elTimer = document.querySelector('.timer')
    const elFlagsCounter = document.querySelector('.flags-counter')
    const elHints = document.querySelectorAll('.hint')
    const clicksRemained = document.querySelector('.safe-clicks-remains')
    const elLives = document.querySelectorAll('.life')
    const elTerminate = document.querySelector('.exterminator')

    const savedScores = JSON.parse(localStorage.getItem('highScores'))
    if (savedScores) gHighScores = savedScores
    renderHighScores()

    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: gLevel.MINES,
        secsPassed: 0,
        lives: 3,
        safeClicks: 3,
    }

    elSmiley.src = SMILEY
    elTerminate.src = TERMINATOR
    elTimer.innerText = 0
    elFlagsCounter.innerText = gLevel.MINES
    clicksRemained.innerText = gGame.safeClicks
    isHintActivated = false
    elTerminate.classList.remove('used')

    elHints.forEach((hint) => {
        hint.classList.remove('used')
        var isMega = hint.classList.contains('mega')
        hint.src = isMega ? MEGA_HINT : HINT
    })

    elLives.forEach((life) => {
        life.classList.remove('lost')
        life.src = LIFE
    })

    buildBoard()
    renderBoard(gBoard)
}

function changeDifficulty(rows, colls, mines, difficulty) {
    gLevel.DIFFICULTY = difficulty
    if (difficulty === 'custom') {
        const customRows = +prompt('Enter number of rows:')
        const customCols = +prompt('Enter number of columns:')
        const customMines = +prompt('Enter number of mines:')
        gLevel.ROWS = customRows
        gLevel.COLLS = customCols
        gLevel.MINES = customMines
    } else {
        gLevel.ROWS = rows
        gLevel.COLLS = colls
        gLevel.MINES = mines
    }
    if (gLevel.MINES >= gLevel.ROWS * gLevel.COLLS) {
        console.log('Too many mines, adjusting to safe value')
        gLevel.MINES = Math.floor((gLevel.ROWS * gLevel.COLLS) / 3)
    }

    onInit()
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

function onPlaceMinesClicked(){

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

function renderBoard(board) {
    var mineBoard = document.querySelector('.game-board')
    var strHTML = ''

    for (let i = 0; i < gLevel.ROWS; i++) {
        strHTML += '<tr>\n'
        for (let j = 0; j < gLevel.COLLS; j++) {
            const cell = board[i][j]
            var classes = `cell cell-${i}-${j} `
            if (cell.isShown) classes += 'shown'
            if (cell.isMarked) classes += ' marked'
            let content = ''
            if (cell.isMarked) {
                content = FLAG
            } else {
                content = cell.isMine ? MINE : cell.minesAroundCount || ``
            }
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

    let content = ''
    if (cell.isMarked) {
        content = FLAG
    } else if (cell.isMine) {
        content = MINE
    } else if (cell.minesAroundCount) {
        content = cell.minesAroundCount
    } else {
        content = ''
    }

    elSpan.innerHTML = content

    if (cell.isShown) {
        elCell.classList.add('shown')
    } else {
        elCell.classList.remove('shown')
    }

    if (cell.isMarked) {
        elCell.classList.add('marked')
    } else {
        elCell.classList.remove('marked')
    }
}

function onHintClicked(elHint) {
    if (elHint.classList.contains('used') || isHintActivated) return
    elHint.src = HINT_USED
    elHint.classList.add('used')
    isHintActivated = true
}

function onTerminateClicked() {
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

    const minesToRemove = Math.min(3, mines.length)

    for (let k = 0; k < minesToRemove; k++) {
        const randomIndex = getRandomNumInclusive(0, mines.length - 1)
        const mine = mines[randomIndex]

        gBoard[mine.i][mine.j].isMine = false

        mines.splice(randomIndex, 1)
    }

    gLevel.MINES -= minesToRemove
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)

    elTerminate.src = TERMINATOR_USED
    elTerminate.classList.add('used')
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
        startTimer()
        addMines(gBoard, i, j)
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
            }, 500)
        }
        return
    }

    expandReveal(gBoard, i, j)

    if (gGame.revealedCount === boardSize - gLevel.MINES) {
        gGame.isOn = false
        var elSmiley = document.querySelector('.smiley')
        elSmiley.src = COOL_SMILEY
        stopTimer()
        setHighScore()
        renderHighScores()
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
    var elFlagsCounter = document.querySelector('.flags-counter')

    const cell = gBoard[i][j]
    if (cell.isShown) return

    saveGameState()

    cell.isMarked = !cell.isMarked
    renderCell(i, j)
    gGame.markedCount = cell.isMarked ? gGame.markedCount - 1 : gGame.markedCount + 1
    elFlagsCounter.innerText = gGame.markedCount
}

function checkGameOver() {
    var elSmiley = document.querySelector('.smiley')
    if (gGame.lives === 0) {
        elSmiley.src = SAD_SMILEY
        gGame.isOn = false
        stopTimer()
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

var timerInterval
var gTime
function startTimer() {
    var elTimer = document.querySelector('.timer')
    var startTime = Date.now()
    timerInterval = setInterval(() => {
        var deltaTime = Date.now()
        var calculatedTime = Math.floor((deltaTime - startTime) / 1000 + 1)
        elTimer.innerText = calculatedTime
        gTime = calculatedTime
    })
}
function stopTimer() {
    clearInterval(timerInterval)
}

function setHighScore() {
    const difficulty = gLevel.DIFFICULTY
    const highScore = gHighScores[difficulty]
    const lastPlace = highScore.length - 1
    let name = null

    if (highScore.length < 10) {
        name = prompt('You just got into the highscores board!\nWhat’s your name?')
        if (!name) name = 'John Doe'
        highScore.push({ name, time: gTime })
        highScore.sort((a, b) => a.time - b.time)
    } else if (gTime < highScore[lastPlace].time) {
        name = prompt('You just got into the highscores board!\nWhat’s your name?')
        if (!name) name = 'John Doe'
        highScore.splice(lastPlace, 1, { name, time: gTime })
        highScore.sort((a, b) => a.time - b.time)
    } else {
        return
    }

    localStorage.setItem('highScores', JSON.stringify(gHighScores))
}

function renderHighScores() {
    const levels = ['beginner', 'medium', 'expert']

    levels.forEach((level) => {
        const el = document.querySelector(`.${level}`)
        const scores = gHighScores[level]

        if (!scores || scores.length === 0) {
            el.innerHTML = 'No scores yet!'
            return
        }

        let html = '<ol>'
        scores.forEach((s) => {
            html += `<li>${s.name}: ${Math.floor(s.time)}s</li>`
        })
        html += '</ol>'
        el.innerHTML = html
    })
}

function onUndoClicked() {
    if (!gPrevGameState.board || !gPrevGameState.game) return

    gBoard = structuredClone(gPrevGameState.board)
    gGame = structuredClone(gPrevGameState.game)
    renderBoard(gBoard)
    document.querySelector('.flags-counter').innerText = gGame.markedCount
}

function saveGameState() {
    gPrevGameState = {
        board: structuredClone(gBoard),
        game: structuredClone(gGame),
    }
    console.table(gPrevGameState.board)
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