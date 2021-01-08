const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function getGaps(adaptaters) {
    const gaps = [0, 0, 0];
    adaptaters.forEach((adaptater, index) => {
        if (index === 0) return;
        const gap = adaptater - adaptaters[index - 1];
        gaps[gap - 1] = gaps[gap - 1] + 1;
    });

    return gaps;
}

function isDeletable(adaptaters, index) {
    if (index === 0) return false;
    if (index === adaptaters.length - 1) return false;
    return adaptaters[index + 1] - adaptaters[index - 1] <= 3;
}

function countPermutations(adaptaters, start = 0) {
    let index = start;
    while (index < adaptaters.length) {
        if (isDeletable(adaptaters, index)) {
            const subAdaptaters = [...adaptaters];
            subAdaptaters.splice(index, 1);
            return countPermutations(subAdaptaters, index) + countPermutations(adaptaters, index + 1);
        }
        index++;
    }
    return 1;
}

function smartCount(adaptaters) {
    let counts = { 0: 1 };
    for (let index = 1; index < adaptaters.length; index++) {
        const adaptater = adaptaters[index];
        counts[adaptater] = 0;
        for (let i = 1; i <= 3; i++) {
            counts[adaptater] = counts[adaptater] + (counts[adaptater - i] || 0);
        }
    }

    return counts[adaptaters[adaptaters.length - 1]]
}

async function main() {
    const readingFile = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "test2.txt"), "utf-8");
    // const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
    let adaptaters = rawInput
        .split("\n")
        .map((line) => parseInt(line))
        .sort((a, b) => a - b);
    adaptaters = [0, ...adaptaters, adaptaters[adaptaters.length - 1] + 3];

    // const gaps = getGaps(adaptaters);
    const nbPermutations = smartCount(adaptaters);
    // readingFile.succeed(`You have a map of ${chalk.magenta.bold(adaptaters.length)} adaptaters, solution is ${gaps[0] * gaps[2]}, nb of permutations is ${nbPermutations}`);
    readingFile.succeed(`Nb of permutations is ${chalk.magenta.bold(nbPermutations)}`);
}

main();
