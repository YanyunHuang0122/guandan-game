// game-engine.js - Core game orchestration

class GameEngine {
    constructor() {
        this.deck = new Deck();
        this.gameState = null;
        this.initialize();
    }

    initialize() {
        // Create teams
        const team1 = new Team('Team 1', Rank.TWO);
        const team2 = new Team('Team 2', Rank.TWO);

        // Create players
        const humanPlayer = new Player('You', false, PlayerPosition.BOTTOM, team1.id);
        const aiLeft = new Player('Left', true, PlayerPosition.LEFT, team2.id);
        const aiTop = new Player('Top', true, PlayerPosition.TOP, team1.id);
        const aiRight = new Player('Right', true, PlayerPosition.RIGHT, team2.id);

        team1.playerIDs = [humanPlayer.id, aiTop.id];
        team2.playerIDs = [aiLeft.id, aiRight.id];

        this.gameState = new GameState(
            [humanPlayer, aiLeft, aiTop, aiRight],
            [team1, team2]
        );
    }

    startNewGame() {
        this.deck.reset();
        this.gameState.phase = GamePhase.DEALING;
        this.dealCards();
        this.gameState.phase = GamePhase.PLAYING;
        this.startNewRound();
    }

    dealCards() {
        this.deck.reset();
        const hands = this.deck.deal(4, 27);

        this.gameState.players.forEach((player, index) => {
            player.hand = hands[index];
            player.sortHand(this.gameState.levelCard);
        });
    }

    startNewRound() {
        // Skip tribute for MVP (can add later)
        this.gameState.phase = GamePhase.PLAYING;
        this.gameState.currentRound = new GameRound(this.gameState.currentRound.roundNumber + 1);
        this.gameState.currentRound.startNewTrick(this.gameState.currentPlayer.id);
        this.gameState.lastPlay = [];
        this.gameState.consecutivePasses = 0;
    }

    playCards(cards, playerID) {
        const playerIndex = this.gameState.players.findIndex(p => p.id === playerID);
        if (playerIndex === -1) return false;

        const player = this.gameState.players[playerIndex];

        // Validate the play
        const currentPattern = this.gameState.lastPlay.length === 0 ?
            null :
            RulesEngine.identifyPattern(this.gameState.lastPlay, this.gameState.levelCard);

        if (cards.length > 0) {
            // Check if play is valid
            if (!RulesEngine.isValidPlay(cards, this.gameState.levelCard)) {
                return false;
            }

            // Check if it beats current play
            if (currentPattern) {
                if (!RulesEngine.beats(cards, this.gameState.lastPlay, this.gameState.levelCard)) {
                    return false;
                }
            }
        }

        // Remove cards from player's hand
        player.removeCards(cards);

        // Add play to current trick
        this.gameState.currentRound.addPlay(playerID, cards);

        // Update game state
        if (cards.length > 0) {
            this.gameState.lastPlay = cards;
            this.gameState.consecutivePasses = 0;
        } else {
            this.gameState.consecutivePasses++;
        }

        // Check if player finished
        if (player.hasFinished) {
            this.gameState.currentRound.playerFinished(playerID);

            if (this.gameState.isRoundComplete) {
                this.completeRound();
                return true;
            }

            // Next player leads
            this.gameState.lastPlay = [];
            this.gameState.consecutivePasses = 0;
        }

        // Move to next player
        this.advanceTurn();

        // Check if everyone passed (new trick)
        if (this.gameState.consecutivePasses >= 3) {
            this.gameState.lastPlay = [];
            this.gameState.consecutivePasses = 0;
            this.gameState.currentRound.startNewTrick(this.gameState.currentPlayer.id);
        }

        return true;
    }

    pass(playerID) {
        return this.playCards([], playerID);
    }

    advanceTurn() {
        this.gameState.currentPlayerPosition =
            this.gameState.nextActivePlayerPosition(this.gameState.currentPlayerPosition);
    }

    completeRound() {
        this.gameState.phase = GamePhase.ROUND_END;

        const result = this.getRoundResult();

        // Update team levels
        const advancement = this.getLevelAdvancement(result);

        if (result.winningTeamID) {
            const teamIndex = this.gameState.teams.findIndex(t => t.id === result.winningTeamID);
            if (teamIndex !== -1) {
                this.gameState.teams[teamIndex].advanceLevel(advancement);

                // Check for winner
                if (this.gameState.teams[teamIndex].hasWon()) {
                    this.gameState.winnerTeamID = result.winningTeamID;
                    this.gameState.phase = GamePhase.GAME_END;
                    return;
                }
            }
        } else {
            // Draw - both teams advance by 1
            this.gameState.teams.forEach(team => team.advanceLevel(1));
        }

        // Deal new cards for next round
        this.dealCards();

        // Start new round
        this.startNewRound();
    }

    getRoundResult() {
        const finishOrder = this.gameState.currentRound.finishOrder;

        if (finishOrder.length < 2) {
            return { type: 'draw', winningTeamID: null };
        }

        const firstPlayer = this.gameState.playerWithID(finishOrder[0]);
        const secondPlayer = this.gameState.playerWithID(finishOrder[1]);

        if (!firstPlayer || !secondPlayer) {
            return { type: 'draw', winningTeamID: null };
        }

        const firstTeamID = firstPlayer.teamID;
        const secondTeamID = secondPlayer.teamID;

        if (firstTeamID === secondTeamID) {
            return { type: 'double', winningTeamID: firstTeamID };
        } else {
            return { type: 'single', winningTeamID: firstTeamID };
        }
    }

    getLevelAdvancement(result) {
        switch (result.type) {
            case 'double': return 3;
            case 'single': return 2;
            case 'draw': return 1;
            default: return 1;
        }
    }

    getValidPlays(playerID) {
        const player = this.gameState.playerWithID(playerID);
        if (!player) return [];

        const currentPattern = this.gameState.lastPlay.length === 0 ?
            null :
            RulesEngine.identifyPattern(this.gameState.lastPlay, this.gameState.levelCard);

        return RulesEngine.findAllValidPlays(
            player.hand,
            currentPattern,
            this.gameState.levelCard
        );
    }

    canPass(playerID) {
        return this.gameState.lastPlay.length > 0;
    }
}
