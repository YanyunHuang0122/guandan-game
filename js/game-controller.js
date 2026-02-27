// game-controller.js - UI controller

class GameController {
    constructor() {
        this.gameEngine = new GameEngine();
        this.selectedCards = new Set();
        this.isProcessing = false;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Screens
        this.mainMenu = document.getElementById('main-menu');
        this.gameBoard = document.getElementById('game-board');

        // Buttons
        this.startGameBtn = document.getElementById('start-game-btn');
        this.playBtn = document.getElementById('play-btn');
        this.passBtn = document.getElementById('pass-btn');

        // Display elements
        this.messageDisplay = document.getElementById('message-display');
        this.gameInfo = document.getElementById('game-info');
        this.handCards = document.getElementById('hand-cards');
        this.handCount = document.getElementById('hand-count');
        this.playedCardsContainer = document.getElementById('played-cards-container');
        this.noCardsText = document.querySelector('.no-cards-text');

        // Player areas
        this.topPlayer = document.getElementById('top-player');
        this.leftPlayer = document.getElementById('left-player');
        this.rightPlayer = document.getElementById('right-player');
    }

    attachEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.playBtn.addEventListener('click', () => this.playSelectedCards());
        this.passBtn.addEventListener('click', () => this.passTurn());
    }

    startGame() {
        this.mainMenu.classList.add('hidden');
        this.gameBoard.classList.remove('hidden');

        this.gameEngine.startNewGame();
        this.selectedCards.clear();

        this.updateUI();
        this.showMessage('Game started! Your turn.');
    }

    updateUI() {
        this.updateGameInfo();
        this.updatePlayerHand();
        this.updateOpponents();
        this.updatePlayArea();
        this.updateButtons();
    }

    updateGameInfo() {
        const team1 = this.gameEngine.gameState.teams[0];
        const team2 = this.gameEngine.gameState.teams[1];
        const levelCard = this.gameEngine.gameState.levelCard;

        this.gameInfo.textContent =
            `Level: ${Rank.displayName(levelCard)} | Team 1: ${Rank.displayName(team1.currentLevel)} | Team 2: ${Rank.displayName(team2.currentLevel)}`;
    }

    updatePlayerHand() {
        const humanPlayer = this.gameEngine.gameState.playerAtPosition(PlayerPosition.BOTTOM);
        if (!humanPlayer) return;

        this.handCount.textContent = humanPlayer.hand.length;
        this.handCards.innerHTML = '';

        humanPlayer.hand.forEach(card => {
            const cardElement = this.createCardElement(card);
            if (this.selectedCards.has(card.id)) {
                cardElement.classList.add('selected');
            }
            cardElement.addEventListener('click', () => this.toggleCardSelection(card));
            this.handCards.appendChild(cardElement);
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';

        // Color based on suit
        if (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) {
            cardDiv.classList.add('red');
        } else {
            cardDiv.classList.add('black');
        }

        const rankSpan = document.createElement('div');
        rankSpan.className = 'card-rank';
        rankSpan.textContent = Rank.displayName(card.rank);

        const suitSpan = document.createElement('div');
        suitSpan.className = 'card-suit';
        suitSpan.textContent = Suit.symbol(card.suit);

        cardDiv.appendChild(rankSpan);
        cardDiv.appendChild(suitSpan);

        return cardDiv;
    }

    createSmallCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'small-card';

        if (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) {
            cardDiv.classList.add('red');
        } else {
            cardDiv.classList.add('black');
        }

        const rankSpan = document.createElement('div');
        rankSpan.className = 'small-card-rank';
        rankSpan.textContent = Rank.displayName(card.rank);

        const suitSpan = document.createElement('div');
        suitSpan.className = 'small-card-suit';
        suitSpan.textContent = Suit.symbol(card.suit);

        cardDiv.appendChild(rankSpan);
        cardDiv.appendChild(suitSpan);

        return cardDiv;
    }

    updateOpponents() {
        // Update each opponent display
        this.updateOpponentDisplay(this.topPlayer, PlayerPosition.TOP);
        this.updateOpponentDisplay(this.leftPlayer, PlayerPosition.LEFT);
        this.updateOpponentDisplay(this.rightPlayer, PlayerPosition.RIGHT);
    }

    updateOpponentDisplay(element, position) {
        const player = this.gameEngine.gameState.playerAtPosition(position);
        if (!player) return;

        const cardCountSpan = element.querySelector('.card-count');
        if (cardCountSpan) {
            cardCountSpan.textContent = player.hand.length;
        }

        // Update card backs
        const opponentCards = element.querySelector('.opponent-cards');
        if (opponentCards) {
            opponentCards.innerHTML = '';
            const numCardsToShow = Math.min(player.hand.length, 10);
            for (let i = 0; i < numCardsToShow; i++) {
                const cardBack = document.createElement('div');
                cardBack.className = 'opponent-card-back';
                opponentCards.appendChild(cardBack);
            }
        }
    }

    updatePlayArea() {
        const lastPlay = this.gameEngine.gameState.lastPlay;

        if (lastPlay.length === 0) {
            this.noCardsText.style.display = 'block';
            this.playedCardsContainer.innerHTML = '';
        } else {
            this.noCardsText.style.display = 'none';
            this.playedCardsContainer.innerHTML = '';

            const cardsToShow = lastPlay.slice(0, 8);
            cardsToShow.forEach(card => {
                const smallCard = this.createSmallCardElement(card);
                this.playedCardsContainer.appendChild(smallCard);
            });

            if (lastPlay.length > 8) {
                const moreText = document.createElement('div');
                moreText.style.fontSize = '11px';
                moreText.style.color = 'rgba(255,255,255,0.8)';
                moreText.textContent = `+${lastPlay.length - 8} more`;
                this.playedCardsContainer.appendChild(moreText);
            }
        }
    }

    updateButtons() {
        const humanPlayer = this.gameEngine.gameState.playerAtPosition(PlayerPosition.BOTTOM);
        if (!humanPlayer) return;

        const isMyTurn = this.gameEngine.gameState.currentPlayer?.id === humanPlayer.id;

        this.playBtn.disabled = !(isMyTurn && this.selectedCards.size > 0);
        this.passBtn.disabled = !(isMyTurn && this.gameEngine.canPass(humanPlayer.id));
    }

    toggleCardSelection(card) {
        if (this.selectedCards.has(card.id)) {
            this.selectedCards.delete(card.id);
        } else {
            this.selectedCards.add(card.id);
        }
        this.updatePlayerHand();
        this.updateButtons();
    }

    playSelectedCards() {
        const humanPlayer = this.gameEngine.gameState.playerAtPosition(PlayerPosition.BOTTOM);
        if (!humanPlayer || this.selectedCards.size === 0) return;

        const cardsToPlay = humanPlayer.hand.filter(card => this.selectedCards.has(card.id));

        if (this.gameEngine.playCards(cardsToPlay, humanPlayer.id)) {
            this.selectedCards.clear();
            this.showMessage('Cards played!');
            this.updateUI();
            this.handleAITurns();
        } else {
            this.showMessage('Invalid play. Try again.');
        }
    }

    passTurn() {
        const humanPlayer = this.gameEngine.gameState.playerAtPosition(PlayerPosition.BOTTOM);
        if (!humanPlayer) return;

        if (this.gameEngine.canPass(humanPlayer.id)) {
            this.gameEngine.pass(humanPlayer.id);
            this.selectedCards.clear();
            this.showMessage('You passed.');
            this.updateUI();
            this.handleAITurns();
        } else {
            this.showMessage('Cannot pass when leading.');
        }
    }

    handleAITurns() {
        if (this.isProcessing) return;

        setTimeout(() => this.processAITurn(), 800);
    }

    processAITurn() {
        const currentPlayer = this.gameEngine.gameState.currentPlayer;

        if (!currentPlayer || !currentPlayer.isAI) {
            this.showMessage('Your turn!');
            this.updateUI();
            return;
        }

        this.isProcessing = true;

        // Get valid plays
        const validPlays = this.gameEngine.getValidPlays(currentPlayer.id);

        // AI decides
        const aiPlay = AIEngine.decidePlay(currentPlayer, this.gameEngine.gameState, validPlays);

        // Execute
        if (aiPlay.length === 0) {
            this.gameEngine.pass(currentPlayer.id);
            this.showMessage(`${currentPlayer.name} passed.`);
        } else {
            this.gameEngine.playCards(aiPlay, currentPlayer.id);
            this.showMessage(`${currentPlayer.name} played ${aiPlay.length} card(s).`);
        }

        this.updateUI();
        this.isProcessing = false;

        // Check for game end
        if (this.gameEngine.gameState.phase === GamePhase.GAME_END) {
            const winnerTeam = this.gameEngine.gameState.teamWithID(this.gameEngine.gameState.winnerTeamID);
            if (winnerTeam) {
                this.showMessage(`🎉 ${winnerTeam.name} wins! 🎉`);
            }
            return;
        }

        // Check if next player is also AI
        const nextPlayer = this.gameEngine.gameState.currentPlayer;
        if (nextPlayer && nextPlayer.isAI) {
            this.handleAITurns();
        } else {
            this.showMessage('Your turn!');
        }
    }

    showMessage(message) {
        this.messageDisplay.textContent = message;
    }
}
