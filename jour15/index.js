const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function main() {
    // const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const numbers = new Map();
    const init = rawInput.split(',').map(n => parseInt(n))
    init.slice(0, -1).forEach((number, i) => numbers.set(number, i + 1))

    let last = init.reverse()[0];
    for (let turn = init.length + 1; turn <= 30000000; turn++) {
        const previousLast = last
        if (numbers.has(last)) {
            last = turn - 1 - numbers.get(last)
        } else {
            last = 0
        }
        numbers.set(previousLast, turn - 1)
    }
    
    console.log(
        `Jour ${chalk.red(15)} - the answer is ${chalk.bold.magenta(last)}`
    );
}

main();
