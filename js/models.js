// models.js - Game data models converted from Swift

// Rank enum
const Rank = {
    TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6, SEVEN: 7, EIGHT: 8, NINE: 9, TEN: 10,
    JACK: 11, QUEEN: 12, KING: 13, ACE: 14,
    SMALL_JOKER: 98, BIG_JOKER: 99,

    displayName: function(rank) {
        const names = {
            2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
            11: 'J', 12: 'Q', 13: 'K', 14: 'A', 98: '🃏', 99: '🃏'
        };
        return names[rank] || rank.toString();
    },

    normalRanks: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],

    advance: function(rank, steps) {
        const ranks = this.normalRanks;
        const index = ranks.indexOf(rank);
        if (index === -1) return rank;
        const newIndex = Math.min(index + steps, ranks.length - 1);
        return ranks[newIndex];
    }
};

// Suit enum
const Suit = {
    CLUBS: 1, DIAMONDS: 2, HEARTS: 3, SPADES: 4,

    symbol: function(suit) {
        const symbols = { 1: '♣', 2: '♦', 3: '♥', 4: '♠' };
        return symbols[suit] || '';
    },

    displayName: function(suit) {
        const names = { 1: 'Clubs', 2: 'Diamonds', 3: 'Hearts', 4: 'Spades' };
        return names[suit] || '';
    },

    all: [1, 2, 3, 4]
};

// Card class
class Card {
    constructor(rank, suit) {
        this.id = this.generateId();
        this.rank = rank;
        this.suit = suit;
    }

    generateId() {
        return `card-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    }

    get displayName() {
        return `${Rank.displayName(this.rank)}${Suit.symbol(this.suit)}`;
    }

    isLevelCard(levelCard) {
        return this.rank === levelCard;
    }

    get isJoker() {
        return this.rank === Rank.SMALL_JOKER || this.rank === Rank.BIG_JOKER;
    }

    effectiveRank(levelCard) {
        if (this.rank === Rank.BIG_JOKER) return 16;
        if (this.rank === Rank.SMALL_JOKER) return 15;
        if (this.isLevelCard(levelCard)) return 14;
        return this.rank;
    }

    static compare(card1, card2, levelCard) {
        const rank1 = card1.effectiveRank(levelCard);
        const rank2 = card2.effectiveRank(levelCard);

        if (rank1 < rank2) return -1;
        if (rank1 > rank2) return 1;

        if (card1.suit < card2.suit) return -1;
        if (card1.suit > card2.suit) return 1;
        return 0;
    }
}

// Deck class
class Deck {
    constructor() {
        this.cards = [];
        this.createDoubleDeck();
    }

    createDoubleDeck() {
        this.cards = [];

        // Add two standard decks
        for (let deckNum = 0; deckNum < 2; deckNum++) {
            for (const suit of Suit.all) {
                for (const rank of Rank.normalRanks) {
                    this.cards.push(new Card(rank, suit));
                }
            }
        }

        // Add 4 jokers (2 small, 2 big)
        for (let i = 0; i < 2; i++) {
            this.cards.push(new Card(Rank.SMALL_JOKER, Suit.SPADES));
            this.cards.push(new Card(Rank.BIG_JOKER, Suit.SPADES));
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(numberOfPlayers, cardsPerPlayer) {
        const hands = Array(numberOfPlayers).fill(null).map(() => []);

        for (let playerIndex = 0; playerIndex < numberOfPlayers; playerIndex++) {
            for (let cardIndex = 0; cardIndex < cardsPerPlayer; cardIndex++) {
                if (this.cards.length > 0) {
                    hands[playerIndex].push(this.cards.shift());
                }
            }
        }

        return hands;
    }

    reset() {
        this.createDoubleDeck();
        this.shuffle();
    }
}

// Player Position enum
const PlayerPosition = {
    BOTTOM: 'bottom',
    LEFT: 'left',
    TOP: 'top',
    RIGHT: 'right',

    displayName: function(position) {
        const names = {
            'bottom': 'You',
            'left': 'Left',
            'top': 'Top',
            'right': 'Right'
        };
        return names[position] || position;
    },

    partnerPosition: function(position) {
        const partners = {
            'bottom': 'top',
            'left': 'right',
            'top': 'bottom',
            'right': 'left'
        };
        return partners[position];
    },

    nextPosition: function(position) {
        const next = {
            'bottom': 'left',
            'left': 'top',
            'top': 'right',
            'right': 'bottom'
        };
        return next[position];
    },

    all: ['bottom', 'left', 'top', 'right']
};

// Player class
class Player {
    constructor(name, isAI, position, teamID) {
        this.id = this.generateId();
        this.name = name;
        this.isAI = isAI;
        this.position = position;
        this.hand = [];
        this.teamID = teamID;
    }

    generateId() {
        return `player-${Math.random().toString(36).substr(2, 9)}`;
    }

    addCard(card) {
        this.hand.push(card);
    }

    addCards(cards) {
        this.hand.push(...cards);
    }

    removeCard(card) {
        const index = this.hand.findIndex(c => c.id === card.id);
        if (index !== -1) {
            this.hand.splice(index, 1);
        }
    }

    removeCards(cards) {
        cards.forEach(card => this.removeCard(card));
    }

    sortHand(levelCard) {
        this.hand.sort((a, b) => Card.compare(a, b, levelCard));
    }

    get hasFinished() {
        return this.hand.length === 0;
    }
}

// Team class
class Team {
    constructor(name, startingLevel = Rank.TWO) {
        this.id = this.generateId();
        this.name = name;
        this.currentLevel = startingLevel;
        this.playerIDs = [];
    }

    generateId() {
        return `team-${Math.random().toString(36).substr(2, 9)}`;
    }

    advanceLevel(steps) {
        this.currentLevel = Rank.advance(this.currentLevel, steps);
    }

    hasWon() {
        return this.currentLevel === Rank.ACE;
    }
}

// GamePhase enum
const GamePhase = {
    DEALING: 'dealing',
    TRIBUTE: 'tribute',
    PLAYING: 'playing',
    ROUND_END: 'roundEnd',
    GAME_END: 'gameEnd'
};

// TributeType enum
const TributeType = {
    DOUBLE: 'double',
    SINGLE: 'single',
    NONE: 'none'
};

// Play class
class Play {
    constructor(playerID, cards) {
        this.id = this.generateId();
        this.playerID = playerID;
        this.cards = cards;
    }

    generateId() {
        return `play-${Math.random().toString(36).substr(2, 9)}`;
    }

    get isPass() {
        return this.cards.length === 0;
    }
}

// Trick class
class Trick {
    constructor(leadPlayerID) {
        this.id = this.generateId();
        this.leadPlayerID = leadPlayerID;
        this.plays = [];
    }

    generateId() {
        return `trick-${Math.random().toString(36).substr(2, 9)}`;
    }

    addPlay(playerID, cards) {
        this.plays.push(new Play(playerID, cards));
    }
}

// GameRound class
class GameRound {
    constructor(roundNumber) {
        this.id = this.generateId();
        this.roundNumber = roundNumber;
        this.tricks = [];
        this.currentTrick = null;
        this.finishOrder = [];
    }

    generateId() {
        return `round-${Math.random().toString(36).substr(2, 9)}`;
    }

    startNewTrick(leadPlayerID) {
        if (this.currentTrick) {
            this.tricks.push(this.currentTrick);
        }
        this.currentTrick = new Trick(leadPlayerID);
    }

    addPlay(playerID, cards) {
        if (this.currentTrick) {
            this.currentTrick.addPlay(playerID, cards);
        }
    }

    playerFinished(playerID) {
        if (!this.finishOrder.includes(playerID)) {
            this.finishOrder.push(playerID);
        }
    }

    isRoundComplete() {
        return this.finishOrder.length >= 3;
    }
}

// GameState class
class GameState {
    constructor(players, teams) {
        this.players = players;
        this.teams = teams;
        this.currentRound = new GameRound(1);
        this.phase = GamePhase.DEALING;
        this.currentPlayerPosition = PlayerPosition.BOTTOM;
        this.tributeState = null;
        this.lastPlay = [];
        this.consecutivePasses = 0;
        this.winnerTeamID = null;
    }

    get levelCard() {
        const team1Level = this.teams[0].currentLevel;
        const team2Level = this.teams[1].currentLevel;
        return team1Level <= team2Level ? team1Level : team2Level;
    }

    playerAtPosition(position) {
        return this.players.find(p => p.position === position);
    }

    playerWithID(id) {
        return this.players.find(p => p.id === id);
    }

    teamWithID(id) {
        return this.teams.find(t => t.id === id);
    }

    get currentPlayer() {
        return this.playerAtPosition(this.currentPlayerPosition);
    }

    partnerOf(player) {
        const partnerPos = PlayerPosition.partnerPosition(player.position);
        return this.playerAtPosition(partnerPos);
    }

    arePartners(player1, player2) {
        return player1.teamID === player2.teamID;
    }

    nextActivePlayerPosition(afterPosition) {
        let nextPos = PlayerPosition.nextPosition(afterPosition);
        let iterations = 0;

        while (iterations < 4) {
            const player = this.playerAtPosition(nextPos);
            if (player && !player.hasFinished) {
                return nextPos;
            }
            nextPos = PlayerPosition.nextPosition(nextPos);
            iterations++;
        }

        return afterPosition;
    }

    get finishedPlayerCount() {
        return this.players.filter(p => p.hasFinished).length;
    }

    get isRoundComplete() {
        return this.finishedPlayerCount >= 3;
    }

    get isGameComplete() {
        return this.winnerTeamID !== null;
    }
}
