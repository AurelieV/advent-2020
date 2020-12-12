const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function checkPassword1(passwords) {
    const searching = ora("Searching valid passwords ...").start();
    const validPasswords = passwords.filter(({ policy, password }) => {
        const nbLetters = [...password].filter((letter) => letter === policy.letter).length;
        return nbLetters >= policy.min && nbLetters <= policy.max;
    });
    searching.succeed(`Find ${validPasswords.length} valid passwords`);
}

function checkPassword2(passwords) {
    const searching = ora("Searching valid passwords ...").start();
    const validPasswords = passwords.filter(({ policy, password }) => {
        const letters = [...password];
        const pos1 = policy.min - 1;
        const pos2 = policy.max - 1;
        const match1 = pos1 < letters.length && letters[pos1] === policy.letter;
        const match2 = pos2 < letters.length && letters[pos2] === policy.letter;

        return (match1 && !match2) || (!match1 && match2);
    });
    searching.succeed(`Find ${chalk.magenta.bold(validPasswords.length)} valid passwords`);
}

async function main() {
    const readingFile = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
    const passwords = rawInput.split("\n").map((raw) => {
        const [rawPolicy, password] = raw.split(": ");
        const [, rawMin, rawMax, letter] = rawPolicy.match(/^(\d+)-(\d+) (.)$/);
        const policy = {
            min: parseInt(rawMin),
            max: parseInt(rawMax),
            letter,
        };
        return { policy, password };
    });
    readingFile.succeed(`Input parsed ! ${chalk.magenta.bold(passwords.length)} passwords to check`);

    // Step 1
    // checkPassword1(passwords);

    checkPassword2(passwords);
}

main();
