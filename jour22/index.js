const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function playTurn(deck1, deck2) {
    const card1 = deck1.shift();
    const card2 = deck2.shift();

    const winner = card1 > card2 ? deck1 : deck2;
    winner.push(Math.max(card1, card2));
    winner.push(Math.min(card1, card2));
}

function play(deck1, deck2) {
    let turn = 1;
    while (deck1.length > 0 && deck2.length > 0) {
        playTurn(deck1, deck2);
        turn++;
    }
    // console.log(`FINISH in Turn ${turn}`);

    return deck1.length === 0 ? deck2 : deck1;
}

function getHash(deck) {
    return deck.join('_');
}
function getRoundHash(deck1, deck2) {
    const hash1 = getHash(deck1);
    const hash2 = getHash(deck2);
    
    return `${hash1}//${hash2}`
}
function isALoop(deck1, deck2, previousRounds) {
    const hash = getRoundHash(deck1, deck2)
    return previousRounds.get(hash)
}

function playRecursiveRound(deck1, deck2, previousRounds) {
    if (isALoop(deck1, deck2, previousRounds)) {
        // console.log("Its a LOOP")
        return true;
    }
    previousRounds.set(getRoundHash(deck1, deck2), true)

    const card1 = deck1.shift();
    const card2 = deck2.shift();

    let winner;
    if (card1 <= deck1.length && card2 <= deck2.length) {
        // console.log(` ???? SUBGAME (${card1} ${card2}) ????`);
        winner = playRecursiveGame(deck1.slice(0, card1), deck2.slice(0, card2));
    } else {
        winner = card1 > card2 ? 1 : 2;
    }

    const winnerDeck = winner === 1 ? deck1 : deck2;
    winnerDeck.push(winner === 1 ? card1 : card2);
    winnerDeck.push(winner === 1 ? card2 : card1);
}

function playRecursiveGame(deck1, deck2) {
    let turn = 1;
    let isLoop;
    const previousRounds = new Map();
    while (deck1.length > 0 && deck2.length > 0 && !isLoop) {
        // console.log(`Playing turn ${turn}`)
        isLoop = playRecursiveRound(deck1, deck2, previousRounds);
        turn++;
    }
    let winner;
    if (isLoop) {
        winner = 1;
    } else {
        winner = deck1.length === 0 ? 2 : 1;
    }
    // console.log(`====== FINISH GAME =====, WINNER: ${winner}`);
    return winner;
}

function getScore(deck) {
    return [...deck].reverse().reduce((score, value, i) => score + (i + 1) * value, 0);
}

function main() {
    console.time("exec");
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const decks = rawInput.split("\n\n").map((rawDeck) => {
        return rawDeck
            .split("\n")
            .slice(1)
            .map((val) => parseInt(val));
    });

    // const winningDeck = play(decks[0], decks[1]);
    // const result = getScore(winningDeck);

    const winner = playRecursiveGame(decks[0], decks[1]);
    const winningDeck = decks[winner - 1];
    const result = getScore(winningDeck);

    resolving.succeed(`Jour ${chalk.red(22)} - the answer is ${chalk.bold.magenta(result)}`);
    console.timeEnd("exec");
}

main();
