const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function gregori(allRules, index) {
    const rules = allRules.get(index);
    return rules.reduce((result, { pattern, values }) => {
        if (values) return result.concat(values);
        const newValues = pattern.reduce((currentPossibilities, ruleNumber) => {
            const possibilities = gregori(allRules, ruleNumber);
            const newValues = [];
            allRules.set(ruleNumber, [{ values: possibilities }]);
            if (currentPossibilities.length === 0) {
                return possibilities;
            }
            for (const possibility of possibilities) {
                for (const val of currentPossibilities) {
                    newValues.push(`${val}${possibility}`);
                }
            }
            return newValues;
        }, []);
        return result.concat(newValues);
    }, []);
}

function checkRule(allRules, checked, value, { pattern, values }) {
    if (values) {
        return values.includes(value);
    }
    const nbPieces = pattern.length
    if (nbPieces === 1) {
        return check(allRules, checked, value, pattern[0])
    }
    else if (nbPieces === 2) {
        for(let i = 1; i <= value.length - 1; i++) {
            if (
                check(allRules, checked, value.slice(0, i), pattern[0]) && 
                check(allRules, checked, value.slice(i), pattern[1])
            ) {
                return true;
            }
        }
        return false;
    } else if (nbPieces === 3) {
        for(let i = 1; i <= value.length - 2; i++) {
            for (let j = i + 1; j <= value.length - 1; j++)
            if (
                check(allRules, checked, value.slice(0, i), pattern[0]) && 
                check(allRules, checked,value.slice(i, j), pattern[1]) &&
                check(allRules, checked,value.slice(j), pattern[2])
            ) {
                return true;
            }
        }
        return false;
    } else {
        throw new Error("J'ai pas géré")
    }
}

function check(allRules, checked, value, ruleNumber) {
    if (value === "") return false;
    const checkKey = `${value}__${ruleNumber}`;
    if (checked.has(checkKey)) return checked.get(checkKey);
    const rules = allRules.get(ruleNumber);
    for (const rule of rules) {
        if (checkRule(allRules, checked, value, rule)) {
            checked.set(checkKey, true);
            return true;
        }
    }
    checked.set(checkKey, false);
    return false;
}

function main() {
    console.time('exec')
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const allRules = new Map();
    const [rulesDescriptionPart, messagesPart] = rawInput.split("\n\n");
    rulesDescriptionPart.split("\n").forEach((line) => {
        const [key, description] = line.split(": ");
        let result = description.split(" | ");
        result = result.map((rule) => {
            if (rule.startsWith('"')) {
                return { values: [rule.substr(1, rule.length - 2)] };
            } else {
                return { pattern: rule.split(" ") };
            }
        });
        allRules.set(key, result);
    });
    const messages = messagesPart.split("\n");

    const allValues = gregori(allRules, "0");
    const mapping = new Map();
    allValues.forEach((value) => mapping.set(value, true));
    const errorCount = messages.reduce((count, message) => (mapping.has(message) ? count + 1 : count), 0);

    resolving.succeed(`Jour ${chalk.red(19)} - the answer is ${chalk.bold.magenta(errorCount)}`);
    console.timeEnd('exec')
}

function main2() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input2.txt"), "utf-8");

    console.time('exec')
    const allRules = new Map();
    const [rulesDescriptionPart, messagesPart] = rawInput.split("\n\n");
    rulesDescriptionPart.split("\n").forEach((line) => {
        const [key, description] = line.split(": ");
        let result = description.split(" | ");
        result = result.map((rule) => {
            if (rule.startsWith('"')) {
                return { values: [rule.substr(1, rule.length - 2)] };
            } else {
                return { pattern: rule.split(" ") };
            }
        });
        allRules.set(key, result);
    });
    const messages = messagesPart.split("\n");

    const checked = new Map()
    const validMessages = messages.filter(message => check(allRules, checked, message, '0'))

    resolving.succeed(`Jour ${chalk.red(19)} - the answer is ${chalk.bold.magenta(validMessages.length)}`);
    console.timeEnd('exec')
}

main2();
