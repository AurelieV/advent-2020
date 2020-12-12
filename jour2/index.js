const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require('chalk')




async function main() {
    const readingFile = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
    const passwords = rawInput.split("\n").map((raw) => {
        const [rule, password] = raw.split(": ");
        return { rule, password };
    });
    readingFile.succeed(`Input parsed ! ${chalk.magenta.bold(passwords.length)} passwords to check`);
}

main();
