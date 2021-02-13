const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

const MAX_NUMBER = 1000000;

function getDestinationCup(ThreeCups, currentCup) {
    let destination = currentCup === 1 ? MAX_NUMBER : currentCup - 1;
    while (ThreeCups.includes(destination)) {
        destination = destination === 1 ? MAX_NUMBER : destination - 1;
    }

    return destination;
}

function goNextTurn({ cups, currentCup }) {
    const ThreeCups = [];
    ThreeCups.push(cups.get(currentCup).next);
    ThreeCups.push(cups.get(ThreeCups[0]).next);
    ThreeCups.push(cups.get(ThreeCups[1]).next);
    const currentNext = cups.get(ThreeCups[2]).next;
    cups.get(currentCup).next = currentNext;

    const destination = getDestinationCup(ThreeCups, currentCup);
    const afterDestination = cups.get(destination).next;
    cups.get(destination).next = ThreeCups[0];
    cups.get(ThreeCups[2]).next = afterDestination;
}

function main() {
    console.time("exec");
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const cups = new Map(
        rawInput
            .split("")
            .map((val) => parseInt(val))
            .map((cup, index, cups) => {
                const next = index === cups.length - 1 ? 10 : cups[index + 1];
                return [cup, { value: cup, next }];
            })
    );
    const firstCup = parseInt(rawInput[0]);
    for (let i = 10; i <= MAX_NUMBER; i++) {
        cups.set(i, { value: i, next: i === MAX_NUMBER ? firstCup : i + 1 });
    }

    const game = { cups, currentCup: firstCup };
    const nbTurn = 10000000;
    for (let turn = 1; turn <= nbTurn; turn++) {
        goNextTurn(game);
        game.currentCup = game.cups.get(game.currentCup).next;
    }

    const first = game.cups.get(1).next;
    const second = game.cups.get(first).next;
    // let result = "";
    // while (cursor !== 1) {
    //     result = `${result}${cursor}`;
    //     cursor = game.cups.get(cursor).next;
    // }
    const result = first * second;


    resolving.succeed(`Jour ${chalk.red(23)} - the answer is ${chalk.bold.magenta(result)}`);
    console.timeEnd("exec");
}

main();
