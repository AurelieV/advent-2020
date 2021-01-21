const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function findClosing(symbols, from = 1) {
    let weight = 1;
    for (let i = from; i < symbols.length; i++) {
        if (symbols[i] === "(") {
            weight++;
        } else if (symbols[i] === ")") {
            weight--;
        }
        if (weight === 0) return i;
    }

    throw new Error("Invalid Expression");
}

function evaluate(symbols) {
    if (symbols.length === 1) {
        return symbols[0];
    }
    if (symbols[0] === "(") {
        const index = findClosing(symbols);
        const value = evaluate(symbols.slice(1, index));

        return evaluate([value, ...symbols.slice(index + 1)]);
    }
    if (symbols[0] === "+" || symbols[0] === "*" || symbols[0] === ")") {
        throw new Error("Invalid expression");
    }
    if (symbols[1] !== "+" && symbols[1] !== "*") {
        throw new Error("Invalid expression");
    }

    if (symbols[2] === "(") {
        const index = findClosing(symbols, 3);
        const parentheses  = evaluate(symbols.slice(3, index));
        return evaluate([symbols[0], symbols[1], parentheses , ...(symbols.slice(index + 1))]);
    } else if (!isFinite(symbols[2])) {
        throw new Error("Invalid expression");
    } else if (symbols[1] === "+") {
        const value = symbols[0] + symbols[2];
        return evaluate([value, ...(symbols.slice(3))])
        // return symbols[0] + evaluate(symbols.slice(2));
    } else {
        return symbols[0] * evaluate(symbols.slice(2));
    }
}

function main() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const values = rawInput.split("\n").map((line) =>
        line
            .split("")
            .filter((c) => c !== " ")
            .map((symbol) => (isFinite(symbol) ? parseInt(symbol) : symbol))
            .map((symbol) => {
                if (symbol === ")") return "(";
                else if (symbol === "(") return ")";
                else return symbol;
            })
            .reverse()
    );

    const result = values.reduce((sum, val) => sum + evaluate(val), 0);
    resolving.succeed(`Jour ${chalk.red(18)} - the answer is ${chalk.bold.magenta(result)}`);
}

main();

