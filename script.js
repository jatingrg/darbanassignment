let currentPlayer = 1
let board = Array(9).fill(null)
let playerCategories = { 1: null, 2: null }
let playerEmojis = { 1: [], 2: [] }
let playerPositions = { 1: [], 2: [] }
let gameActive = false
let winner = null
let winningPattern = []
let winningEmojis = []

const emojiCategories = {
  animals: ["🐶", "🐱", "🐵", "🐰", "🦊", "🐻", "🐼", "🐨"],
  food: ["🍕", "🍟", "🍔", "🍩", "🌮", "🍎", "🍌", "🍓"],
  sports: ["⚽", "🏀", "🏈", "🎾", "🏐", "🏓", "🥎", "🏑"],
  nature: ["🌸", "🌺", "🌻", "🌷", "🌹", "🌿", "🍀", "🌳"],
}

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners()
  showCategorySelection()
})

function setupEventListeners() {
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", selectCategory)
  })

  document.getElementById("start-game").addEventListener("click", startGame)
  document.getElementById("new-game").addEventListener("click", newGame)
  document.getElementById("play-again").addEventListener("click", newGame)
  document.getElementById("show-help").addEventListener("click", showHelp)
  document.getElementById("show-rules").addEventListener("click", showHelp)

  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", closeModals)
  })

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModals()
    }
  })

  document.getElementById("game-board").addEventListener("click", (e) => {
    if (e.target.classList.contains("cell")) {
      makeMove(Number.parseInt(e.target.dataset.index))
    }
  })
}

function selectCategory(e) {
  const player = Number.parseInt(e.target.dataset.player)
  const category = e.target.dataset.category

  document.querySelectorAll('[data-player="' + player + '"]').forEach((btn) => {
    btn.classList.remove("selected")
  })

  e.target.classList.add("selected")

  playerCategories[player] = category

  const selectedDiv = document.getElementById("player" + player + "-selected")
  const categoryEmojis = emojiCategories[category].slice(0, 4).join(" ")
  selectedDiv.textContent = "Selected: " + categoryEmojis

  checkStartGameAvailability()
}

function checkStartGameAvailability() {
  const startBtn = document.getElementById("start-game")
  const bothSelected = playerCategories[1] && playerCategories[2]
  const differentCategories = playerCategories[1] !== playerCategories[2]

  if (bothSelected && differentCategories) {
    startBtn.disabled = false
  } else {
    startBtn.disabled = true
  }
}

function startGame() {
  gameActive = true
  currentPlayer = 1
  board = Array(9).fill(null)
  playerEmojis = { 1: [], 2: [] }
  playerPositions = { 1: [], 2: [] }
  winner = null

  showGameScreen()
  updateGameDisplay()
  generateCurrentEmoji()
}

function newGame() {
  closeModals()
  showCategorySelection()

  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.classList.remove("selected")
  })
  document.getElementById("player1-selected").textContent = ""
  document.getElementById("player2-selected").textContent = ""
  document.getElementById("start-game").disabled = true

  currentPlayer = 1
  board = Array(9).fill(null)
  playerCategories = { 1: null, 2: null }
  playerEmojis = { 1: [], 2: [] }
  playerPositions = { 1: [], 2: [] }
  gameActive = false
  winner = null
}

function showCategorySelection() {
  document.getElementById("category-selection").classList.add("active")
  document.getElementById("game-screen").classList.remove("active")
}

function showGameScreen() {
  document.getElementById("category-selection").classList.remove("active")
  document.getElementById("game-screen").classList.add("active")
}

function generateCurrentEmoji() {
  const category = playerCategories[currentPlayer]
  const emojis = emojiCategories[category]
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

  document.getElementById("current-emoji").textContent = randomEmoji
  return randomEmoji
}

function makeMove(index) {
  if (!gameActive || board[index] !== null) {
    return
  }

  const emoji = document.getElementById("current-emoji").textContent

  if (playerPositions[currentPlayer].length === 3) {
    const firstPosition = playerPositions[currentPlayer][0]
    if (index === firstPosition) {
      showTemporaryMessage("Cannot place here! This is where your first emoji was.")
      return
    }
  }

  if (playerPositions[currentPlayer].length === 3) {
    removeOldestEmoji(currentPlayer)
  }

  placeEmoji(index, emoji, currentPlayer)

  if (checkWin()) {
    handleWin()
    return
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1
  updateGameDisplay()
  generateCurrentEmoji()
}

function removeOldestEmoji(player) {
  const oldestPosition = playerPositions[player].shift()
  const oldestEmoji = playerEmojis[player].shift()

  const cell = document.querySelector('[data-index="' + oldestPosition + '"]')
  cell.classList.add("vanishing")

  setTimeout(() => {
    board[oldestPosition] = null
    cell.textContent = ""
    cell.classList.remove("vanishing", "occupied")
  }, 500)
}

function placeEmoji(index, emoji, player) {
  board[index] = { emoji: emoji, player: player }
  playerEmojis[player].push(emoji)
  playerPositions[player].push(index)

  const cell = document.querySelector('[data-index="' + index + '"]')
  cell.textContent = emoji
  cell.classList.add("occupied", "appearing")

  setTimeout(() => {
    cell.classList.remove("appearing")
  }, 500)
}

function updateGameDisplay() {
  document.getElementById("current-player-text").textContent = "Player " + currentPlayer + "'s Turn"

  for (let player = 1; player <= 2; player++) {
    const emojiList = document.getElementById("player" + player + "-emojis")
    emojiList.innerHTML = ""

    playerEmojis[player].forEach((emoji, index) => {
      const emojiSpan = document.createElement("span")
      emojiSpan.textContent = emoji
      emojiSpan.className = "emoji-item"

      if (playerEmojis[player].length === 3 && index === 0) {
        emojiSpan.classList.add("oldest")
      }

      emojiList.appendChild(emojiSpan)
    })
  }
}

function checkWin() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], 
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], 
    [0, 4, 8],
    [2, 4, 6], 
  ]

  for (let i = 0; i < winPatterns.length; i++) {
    const pattern = winPatterns[i]
    const a = pattern[0]
    const b = pattern[1]
    const c = pattern[2]

    const cellA = board[a]
    const cellB = board[b]
    const cellC = board[c]

    if (cellA && cellB && cellC && cellA.player === cellB.player && cellA.player === cellC.player) {
      winner = cellA.player
      winningPattern = pattern
      winningEmojis = [cellA.emoji, cellB.emoji, cellC.emoji]
      return true
    }
  }

  return false
}

function handleWin() {
  gameActive = false

  winningPattern.forEach((index) => {
    const cell = document.querySelector('[data-index="' + index + '"]')
    cell.classList.add("winning")
  })

  setTimeout(() => {
    showWinModal()
  }, 1000)
}

function showWinModal() {
  const modal = document.getElementById("win-modal")
  const winnerText = document.getElementById("winner-text")
  const winningLine = document.getElementById("winning-line")

  winnerText.textContent = "Player " + winner + " Wins! 🎉"
  winningLine.textContent = winningEmojis.join(" ")

  modal.style.display = "block"
}

function showHelp() {
  document.getElementById("help-modal").style.display = "block"
}

function closeModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none"
  })
}

function showTemporaryMessage(message) {
  const messageDiv = document.createElement("div")
  messageDiv.textContent = message
  messageDiv.style.cssText =
    "position: fixed;" +
    "top: 50%;" +
    "left: 50%;" +
    "transform: translate(-50%, -50%);" +
    "background: #ff4444;" +
    "color: white;" +
    "padding: 15px 25px;" +
    "border-radius: 10px;" +
    "z-index: 2000;" +
    "font-weight: bold;" +
    "box-shadow: 0 5px 15px rgba(0,0,0,0.3);"

  document.body.appendChild(messageDiv)

  setTimeout(() => {
    document.body.removeChild(messageDiv)
  }, 2000)
}
