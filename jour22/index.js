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
    console.log(`FINISH in Turn ${turn}`);

    return deck1.length === 0 ? deck2 : deck1;
}

function isEqual(deck1, deck2) {
    if (deck1.length !== deck2.length) return false;
    const result = deck1.every((card, index) => card === deck2[index]);
    return result;
}
function isALoop(deck1, deck2, previousRounds) {
    return previousRounds.some(({ deck1: d1, deck2: d2 }) => isEqual(d1, deck1) && isEqual(d2, deck2));
}

function playRecursiveRound(deck1, deck2, previousRounds) {
    if (isALoop(deck1, deck2, previousRounds)) {
        return true;
    }
    const currentRound = {
        deck1: [...deck1],
        deck2: [...deck2],
    };
    previousRounds.push(currentRound);

    const card1 = deck1.shift();
    const card2 = deck2.shift();

    let winner;
    if (card1 <= deck1.length && card2 <= deck2.length) {
        console.log(" ???? SUBGAME ????");
        winner = playRecursiveGame([...deck1], [...deck2], previousRounds);
    } else {
        winner = card1 > card2 ? 1 : 2;
    }

    const winnerDeck = winner === 1 ? deck1 : deck2;
    winnerDeck.push(winner === 1 ? card1 : card2);
    winnerDeck.push(winner === 1 ? card2 : card1);
}

function playRecursiveGame(deck1, deck2, previousRounds = []) {
    let turn = 1;
    let isLoop;
    while (deck1.length > 0 && deck2.length > 0 && !isLoop) {
        console.log(`TURN ${turn}, ${previousRounds.length}`);
        isLoop = playRecursiveRound(deck1, deck2, previousRounds);
        turn++;
        if (isLoop) {
            console.log("==== LOOPING OUPS ====");
        }
    }
    let winner;
    if (isLoop) {
        winner = 1;
    } else {
        winner = deck1.length === 0 ? 2 : 1;
    }
    console.log(`====== FINISH GAME =====, WINNER: ${winner}`);
    return winner;
}

function getScore(deck) {
    return [...deck].reverse().reduce((score, value, i) => score + (i + 1) * value, 0);
}

function main() {
    console.time("exec");
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "test.txt"), "utf-8");

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

    console.log(winner, winningDeck)
    const result = getScore(winningDeck);

    resolving.succeed(`Jour ${chalk.red(22)} - the answer is ${chalk.bold.magenta(result)}`);
    console.timeEnd("exec");
}

main();
