// ai-engine.js - AI decision making

class AIEngine {
    static decidePlay(player, gameState, validPlays) {
        const levelCard = gameState.levelCard;
        const lastPlay = gameState.lastPlay;
        const isLeading = lastPlay.length === 0;

        const partner = gameState.partnerOf(player);
        if (!partner) {
            return this.decideSoloPlay(player, gameState, validPlays, levelCard);
        }

        const partnerIsLeading = this.isPartnerLeading(gameState, partner);

        if (isLeading) {
            return this.decideLeadingPlay(player, validPlays, levelCard);
        } else if (partnerIsLeading) {
            return this.decideFollowPartnerPlay(player, validPlays, levelCard);
        } else {
            return this.decideFollowOpponentPlay(player, validPlays, gameState, levelCard);
        }
    }

    static decideLeadingPlay(player, validPlays, levelCard) {
        // Play smallest single card
        const singles = validPlays.filter(play => play.length === 1);

        if (singles.length > 0) {
            const sortedSingles = singles.sort((a, b) => Card.compare(a[0], b[0], levelCard));
            return sortedSingles[0];
        }

        // If no singles, play smallest pair
        const pairs = validPlays.filter(play => play.length === 2);
        if (pairs.length > 0) {
            const sortedPairs = pairs.sort((a, b) => Card.compare(a[0], b[0], levelCard));
            return sortedPairs[0];
        }

        // Fallback
        if (validPlays.length > 0) {
            return validPlays[0];
        }

        return [];
    }

    static decideFollowPartnerPlay(player, validPlays, levelCard) {
        // Pass to let partner win, unless we can finish our hand
        if (player.hand.length <= 3) {
            const playAllCards = validPlays.find(play => play.length === player.hand.length);
            if (playAllCards) {
                return playAllCards;
            }
        }

        return []; // Pass
    }

    static decideFollowOpponentPlay(player, validPlays, gameState, levelCard) {
        // Filter out bombs
        const nonBombPlays = validPlays.filter(play => {
            const pattern = RulesEngine.identifyPattern(play, levelCard);
            return pattern && pattern.type !== CardPattern.BOMB;
        });

        // If we have non-bomb plays and hand is large, use them
        if (nonBombPlays.length > 0 && player.hand.length > 10) {
            const sorted = nonBombPlays.sort((a, b) => Card.compare(a[0], b[0], levelCard));
            return sorted[0];
        }

        // If hand is small or only bombs available, use bombs
        if (validPlays.length > 0 && player.hand.length < 10) {
            const sorted = validPlays.sort((a, b) => Card.compare(a[0], b[0], levelCard));
            return sorted[0];
        }

        return []; // Pass
    }

    static decideSoloPlay(player, gameState, validPlays, levelCard) {
        if (gameState.lastPlay.length === 0) {
            return this.decideLeadingPlay(player, validPlays, levelCard);
        } else {
            return this.decideFollowOpponentPlay(player, validPlays, gameState, levelCard);
        }
    }

    static isPartnerLeading(gameState, partner) {
        if (!gameState.currentRound.currentTrick) return false;

        const plays = gameState.currentRound.currentTrick.plays;
        if (plays.length === 0) return false;

        // Find the current leading play
        let leadingPlay = plays[0];
        for (let i = 1; i < plays.length; i++) {
            if (!plays[i].isPass &&
                RulesEngine.beats(plays[i].cards, leadingPlay.cards, gameState.levelCard)) {
                leadingPlay = plays[i];
            }
        }

        return leadingPlay.playerID === partner.id;
    }
}
