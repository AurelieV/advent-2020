const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function main() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
    const lines = rawInput.split("\n");

    const currentTimestamp = parseInt(lines[0]);
    const buses = lines[1]
        .split(",")
        .filter((c) => c !== "x")
        .map((c) => parseInt(c));

    console.log(buses);
    const waitings = buses.map((bus) => {
        return { waiting: bus - (currentTimestamp % bus), bus };
    });

    waitings.sort(({ waiting: waitingA }, { waiting: waitingB }) => waitingA - waitingB);

    resolving.succeed(
        `You have to wait ${waitings[0].waiting}, the bus ${waitings[0].bus}, answer is ${chalk.bold.magenta(
            waitings[0].waiting * waitings[0].bus
        )}`
    );
}

function search(start, step, interval, modulo) {
    let solution = start;
    while (((solution + modulo) % interval) !== 0) {
        solution = solution + step;
    }

    return solution;
}

function main2() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
    const lines = rawInput.split("\n");
    const buses = lines[1]
        .split(",")
        .map((c, index) => (c === "x" ? null : { interval: parseInt(c), modulo: index }))
        .filter((c) => !!c);

    console.log(buses.map(({interval, modulo}, index) => `t = ${interval}*x_${index} - ${modulo}`).join('\n'));

    let solution = 0;
    let step = 1;
    buses.forEach(({interval, modulo}, index) => {
        console.log(`Calculating for bus ${index}, with ${step} step`)
        solution = search(solution, step, interval, modulo)
        step = step * interval //TODO: calculer le ppcm instead
    })

    resolving.succeed(`Solution is ${chalk.bold.magenta(solution)}`)

}

// main();
main2();
