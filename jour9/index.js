const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");


function getPossibilities(numbers, size, index) {
    let possibilities = [];
    for (let i = 1; i < size; i++) {
        for (let j = i + 1; j <= size; j++) {
            possibilities.push(numbers[index - i] + numbers[index - j])
        }
    }

    return possibilities;
}

function findWeakness(numbers, size) {
    for (let index = size; index < numbers.length; index++) {
        const possibilities = getPossibilities(numbers, size, index)
        if (!possibilities.includes(numbers[index])) {
            return numbers[index];
        }
    }
}

function check(numbers, weakness, index) {
    let sum = numbers[index];
    for (let i = index + 1; i < numbers.length; i++) {
        sum = sum + numbers[i];
        if (sum > weakness) {
            return null;
        }
        if (sum === weakness) {
            const ranges = numbers.slice(index, i + 1);
            return [Math.min(...ranges), Math.max(...ranges)];
        }
    }
    return null;
}

function findSolution(numbers, weakness) {
    for (let i = 0; i < numbers.length - 1; i++) {
        const solution = check(numbers, weakness, i);
        if (solution) {
            return solution[0] + solution[1]
        }
    } 
}

async function main() {
    const readingFile = ora("Reading file").start();
    // const rawInput = fs.readFileSync(path.resolve(__dirname, "test.txt"), "utf-8");
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const numbers = rawInput.split('\n').map(line => parseInt(line));

    readingFile.succeed(`You have a map of ${chalk.magenta.bold(numbers.length)} numbers`)
    const searching = ora("Resolving").start();
    const weakness = findWeakness(numbers, 25);
    const solution = findSolution(numbers, weakness);
    searching.succeed(`Solution is ${weakness}, solution is ${solution}`)
}

main();