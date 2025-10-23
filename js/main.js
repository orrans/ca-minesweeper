'use strict'

//globals
var gBoard
var gPrevGameState = { board: null, game: null }
var isPlacingMines = false
var minesToPlace = 0

// consts
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

// hints vars
var isHintActivated = false
var isMegaHintActivated = false
var gMegaHintFirstCorner = null

// timer vars
var timerInterval
var gTime

// data objects
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

// funcs
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


function onDarkToggleClicked() {
    var body = document.body
    body.classList.toggle('dark-mode')
}

function changeDifficulty(rows, colls, mines, difficulty, elBtn) {
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

    minesToPlace = gLevel.MINES

    const allBtns = document.querySelectorAll('.difficulty')
    allBtns.forEach((btn) => btn.classList.remove('clicked'))
    if (elBtn) elBtn.classList.add('clicked')

    onInit()
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
