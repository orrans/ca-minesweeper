function renderBoard(board) {
    var mineBoard = document.querySelector('.game-board')
    var strHTML = ''

    for (let i = 0; i < gLevel.ROWS; i++) {
        strHTML += '<tr>\n'
        for (let j = 0; j < gLevel.COLLS; j++) {
            const cell = board[i][j]
            var classes = `cell cell-${i}-${j} `

            if (cell.isShown) {
                classes += 'shown '
                if (!cell.isMine && cell.minesAroundCount > 0) {
                    classes += `num-${cell.minesAroundCount} `
                }
            }

            if (cell.isMarked) {
                classes += 'marked '
            }

            let content = ''
            if (cell.isMarked) {
                content = FLAG
            } else if (cell.isShown && cell.isMine) {
                content = MINE
            } else if (cell.isShown && cell.minesAroundCount > 0) {
                content = cell.minesAroundCount
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
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    if (!elCell) return

    const cell = gBoard[i][j]
    const elSpan = elCell.querySelector('span')
    if (!elSpan) return

    for (let k = 1; k <= 8; k++) {
        elCell.classList.remove(`num-${k}`)
    }

    if (cell.isShown) {
        elCell.classList.add('shown')
        if (cell.isMine) {
            elSpan.innerHTML = MINE
        } else if (cell.minesAroundCount > 0) {
            elSpan.innerHTML = cell.minesAroundCount
            elCell.classList.add(`num-${cell.minesAroundCount}`)
        } else {
            elSpan.innerHTML = ''
        }
    } else {
        elCell.classList.remove('shown')
        if (!cell.isMarked) {
            elSpan.innerHTML = ''
        }
    }
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
            html += `<li>${s.name}: ${Math.floor(s.time)} <span style="font-size: 8px;">sec</span></li>`
        })
        html += '</ol>'
        el.innerHTML = html
    })
}
