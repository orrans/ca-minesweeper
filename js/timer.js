let isRunning = false

function startTimer() {
    var elTimer = document.querySelector('.timer')
    var startTime = Date.now()
    timerInterval = setInterval(() => {
        var deltaTime = Date.now()
        var calculatedTime = Math.floor((deltaTime - startTime) / 1000) + 1
        elTimer.innerText = calculatedTime
        gTime = calculatedTime
    }, 100)
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
