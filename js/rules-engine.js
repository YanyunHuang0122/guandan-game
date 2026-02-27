// rules-engine.js - Card pattern validation and comparison

const CardPattern = {
    SINGLE: 'single',
    PAIR: 'pair',
    TRIPLE: 'triple',
    STRAIGHT: 'straight',
    PAIR_STRAIGHT: 'pairStraight',
    TRIPLE_STRAIGHT: 'tripleStraight',
    FULL_HOUSE: 'fullHouse',
    BOMB: 'bomb'
};

class RulesEngine {
    static identifyPattern(cards, levelCard) {
        if (!cards || cards.length === 0) return null;

        const sortedCards = [...cards].sort((a, b) => Card.compare(a, b, levelCard));

        // Check for bombs first
        const bomb = this.checkBomb(sortedCards, levelCard);
        if (bomb) return bomb;

        // Check other patterns
        if (sortedCards.length === 1) {
            return { type: CardPattern.SINGLE, rank: sortedCards[0].effectiveRank(levelCard) };
        }

        if (sortedCards.length === 2) {
            return this.checkPair(sortedCards, levelCard);
        }

        if (sortedCards.length === 3) {
            return this.checkTriple(sortedCards, levelCard);
        }

        if (sortedCards.length === 5) {
            const fullHouse = this.checkFullHouse(sortedCards, levelCard);
            if (fullHouse) return fullHouse;
        }

        if (sortedCards.length >= 5) {
            const straight = this.checkStraight(sortedCards, levelCard);
            if (straight) return straight;
        }

        if (sortedCards.length >= 6) {
            const pairStraight = this.checkPairStraight(sortedCards, levelCard);
            if (pairStraight) return pairStraight;

            const tripleStraight = this.checkTripleStraight(sortedCards, levelCard);
            if (tripleStraight) return tripleStraight;
        }

        return null;
    }

    static checkPair(cards, levelCard) {
        if (cards.length !== 2) return null;
        const rank1 = cards[0].effectiveRank(levelCard);
        const rank2 = cards[1].effectiveRank(levelCard);
        if (rank1 === rank2) {
            return { type: CardPattern.PAIR, rank: rank1 };
        }
        return null;
    }

    static checkTriple(cards, levelCard) {
        if (cards.length !== 3) return null;
        const ranks = cards.map(c => c.effectiveRank(levelCard));
        if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
            return { type: CardPattern.TRIPLE, rank: ranks[0] };
        }
        return null;
    }

    static checkBomb(cards, levelCard) {
        if (cards.length === 4) {
            const ranks = cards.map(c => c.effectiveRank(levelCard));
            if (ranks[0] === ranks[1] && ranks[1] === ranks[2] && ranks[2] === ranks[3]) {
                return { type: CardPattern.BOMB, rank: ranks[0], count: 4 };
            }
        }

        if (cards.length >= 5) {
            const straight = this.checkStraight(cards, levelCard);
            if (straight) {
                return { type: CardPattern.BOMB, rank: straight.startRank, count: cards.length };
            }
        }

        if (cards.length === 4 && cards.every(c => c.isJoker)) {
            return { type: CardPattern.BOMB, rank: 16, count: 4 };
        }

        return null;
    }

    static checkStraight(cards, levelCard) {
        if (cards.length < 5) return null;

        // Cannot use level cards or jokers
        if (cards.some(c => c.isLevelCard(levelCard) || c.isJoker)) {
            return null;
        }

        const ranks = cards.map(c => c.rank).sort((a, b) => a - b);
        for (let i = 1; i < ranks.length; i++) {
            if (ranks[i] !== ranks[i - 1] + 1) {
                return null;
            }
        }

        return { type: CardPattern.STRAIGHT, startRank: cards[0].effectiveRank(levelCard), length: cards.length };
    }

    static checkPairStraight(cards, levelCard) {
        if (cards.length < 6 || cards.length % 2 !== 0) return null;

        const rankGroups = {};
        cards.forEach(card => {
            const rank = card.effectiveRank(levelCard);
            rankGroups[rank] = (rankGroups[rank] || 0) + 1;
        });

        const ranks = Object.keys(rankGroups).map(Number).sort((a, b) => a - b);
        if (ranks.length !== cards.length / 2) return null;

        if (!Object.values(rankGroups).every(count => count === 2)) return null;

        for (let i = 1; i < ranks.length; i++) {
            if (ranks[i] !== ranks[i - 1] + 1) {
                return null;
            }
        }

        return { type: CardPattern.PAIR_STRAIGHT, startRank: ranks[0], length: ranks.length };
    }

    static checkTripleStraight(cards, levelCard) {
        if (cards.length < 6 || cards.length % 3 !== 0) return null;

        const rankGroups = {};
        cards.forEach(card => {
            const rank = card.effectiveRank(levelCard);
            rankGroups[rank] = (rankGroups[rank] || 0) + 1;
        });

        const ranks = Object.keys(rankGroups).map(Number).sort((a, b) => a - b);
        if (ranks.length !== cards.length / 3) return null;

        if (!Object.values(rankGroups).every(count => count === 3)) return null;

        for (let i = 1; i < ranks.length; i++) {
            if (ranks[i] !== ranks[i - 1] + 1) {
                return null;
            }
        }

        return { type: CardPattern.TRIPLE_STRAIGHT, startRank: ranks[0], length: ranks.length };
    }

    static checkFullHouse(cards, levelCard) {
        if (cards.length !== 5) return null;

        const rankGroups = {};
        cards.forEach(card => {
            const rank = card.effectiveRank(levelCard);
            rankGroups[rank] = (rankGroups[rank] || 0) + 1;
        });

        const counts = Object.values(rankGroups).sort();
        if (counts.length === 2 && counts[0] === 2 && counts[1] === 3) {
            const tripleRank = Object.keys(rankGroups).find(rank => rankGroups[rank] === 3);
            return { type: CardPattern.FULL_HOUSE, tripleRank: Number(tripleRank) };
        }

        return null;
    }

    static isValidPlay(cards, levelCard) {
        return this.identifyPattern(cards, levelCard) !== null;
    }

    static beats(play1Cards, play2Cards, levelCard) {
        const pattern1 = this.identifyPattern(play1Cards, levelCard);
        const pattern2 = this.identifyPattern(play2Cards, levelCard);

        if (!pattern1 || !pattern2) return false;

        return this.patternBeats(pattern1, pattern2);
    }

    static patternBeats(pattern1, pattern2) {
        // Bombs beat everything except bigger bombs
        if (pattern1.type === CardPattern.BOMB && pattern2.type !== CardPattern.BOMB) {
            return true;
        }
        if (pattern1.type !== CardPattern.BOMB && pattern2.type === CardPattern.BOMB) {
            return false;
        }

        // Must be same pattern type
        if (pattern1.type !== pattern2.type) return false;

        switch (pattern1.type) {
            case CardPattern.SINGLE:
            case CardPattern.PAIR:
            case CardPattern.TRIPLE:
                return pattern1.rank > pattern2.rank;

            case CardPattern.STRAIGHT:
            case CardPattern.PAIR_STRAIGHT:
            case CardPattern.TRIPLE_STRAIGHT:
                return pattern1.length === pattern2.length && pattern1.startRank > pattern2.startRank;

            case CardPattern.FULL_HOUSE:
                return pattern1.tripleRank > pattern2.tripleRank;

            case CardPattern.BOMB:
                if (pattern1.count !== pattern2.count) {
                    return pattern1.count > pattern2.count;
                }
                return pattern1.rank > pattern2.rank;

            default:
                return false;
        }
    }

    static findAllValidPlays(hand, toFollowPattern, levelCard) {
        const validPlays = [];

        if (!toFollowPattern) {
            // Leading - can play any valid pattern
            validPlays.push(...this.findAllSingles(hand));
            validPlays.push(...this.findAllPairs(hand, levelCard));
            validPlays.push(...this.findAllTriples(hand, levelCard));
            validPlays.push(...this.findAllBombs(hand, levelCard));
        } else {
            // Following - must match and beat
            validPlays.push(...this.findFollowingPlays(hand, toFollowPattern, levelCard));
        }

        return validPlays;
    }

    static findAllSingles(hand) {
        return hand.map(card => [card]);
    }

    static findAllPairs(hand, levelCard) {
        const pairs = [];
        const rankGroups = {};

        hand.forEach(card => {
            const rank = card.effectiveRank(levelCard);
            if (!rankGroups[rank]) rankGroups[rank] = [];
            rankGroups[rank].push(card);
        });

        Object.values(rankGroups).forEach(cards => {
            if (cards.length >= 2) {
                for (let i = 0; i < cards.length - 1; i++) {
                    for (let j = i + 1; j < cards.length; j++) {
                        pairs.push([cards[i], cards[j]]);
                    }
                }
            }
        });

        return pairs;
    }

    static findAllTriples(hand, levelCard) {
        const triples = [];
        const rankGroups = {};

        hand.forEach(card => {
            const rank = card.effectiveRank(levelCard);
            if (!rankGroups[rank]) rankGroups[rank] = [];
            rankGroups[rank].push(card);
        });

        Object.values(rankGroups).forEach(cards => {
            if (cards.length >= 3) {
                for (let i = 0; i < cards.length - 2; i++) {
                    for (let j = i + 1; j < cards.length - 1; j++) {
                        for (let k = j + 1; k < cards.length; k++) {
                            triples.push([cards[i], cards[j], cards[k]]);
                        }
                    }
                }
            }
        });

        return triples;
    }

    static findAllBombs(hand, levelCard) {
        const bombs = [];
        const rankGroups = {};

        hand.forEach(card => {
            const rank = card.effectiveRank(levelCard);
            if (!rankGroups[rank]) rankGroups[rank] = [];
            rankGroups[rank].push(card);
        });

        // 4 of a kind
        Object.values(rankGroups).forEach(cards => {
            if (cards.length >= 4) {
                bombs.push(cards.slice(0, 4));
            }
        });

        return bombs;
    }

    static findFollowingPlays(hand, toFollowPattern, levelCard) {
        const validPlays = [];

        switch (toFollowPattern.type) {
            case CardPattern.SINGLE:
                hand.forEach(card => {
                    if (card.effectiveRank(levelCard) > toFollowPattern.rank) {
                        validPlays.push([card]);
                    }
                });
                break;

            case CardPattern.PAIR:
                this.findAllPairs(hand, levelCard).forEach(pair => {
                    const pattern = this.identifyPattern(pair, levelCard);
                    if (pattern && this.patternBeats(pattern, toFollowPattern)) {
                        validPlays.push(pair);
                    }
                });
                break;

            case CardPattern.TRIPLE:
                this.findAllTriples(hand, levelCard).forEach(triple => {
                    const pattern = this.identifyPattern(triple, levelCard);
                    if (pattern && this.patternBeats(pattern, toFollowPattern)) {
                        validPlays.push(triple);
                    }
                });
                break;

            case CardPattern.BOMB:
                this.findAllBombs(hand, levelCard).forEach(bomb => {
                    const pattern = this.identifyPattern(bomb, levelCard);
                    if (pattern && this.patternBeats(pattern, toFollowPattern)) {
                        validPlays.push(bomb);
                    }
                });
                break;
        }

        // Can always play a bomb to beat non-bomb patterns
        if (toFollowPattern.type !== CardPattern.BOMB) {
            validPlays.push(...this.findAllBombs(hand, levelCard));
        }

        return validPlays;
    }
}
