'use strict'

function createMat(rows, cols) {
    const mat = []

    for (var i = 0; i < rows; i++) {
        const row = []

        for (var j = 0; j < cols; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomNumInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function getRandomColor() {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)]
    return color
}

function getRandomItem(arr) {
    if (!arr || !arr.length) return null
    return arr[Math.floor(Math.random() * arr.length)]
}

function shuffleArray(arr) {
    var temp
    for (let i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
    }
}
