const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function isValidFor({ min1, max1, min2, max2 }, value) {
    return (value >= min1 && value <= max1) || (value >= min2 && value <= max2);
}

function isValid(rules, value) {
    return rules.some((rule) => isValidFor(rule, value));
}

function isTicketValid(rules, ticket) {
    return ticket.every((value) => isValid(rules, value));
}

function isNotValid(rules, value) {
    return !rules.some((rule) => isValidFor(rule, value));
}

function getScanningRateError(rules, ticket) {
    return ticket.reduce((rate, value) => (isNotValid(rules, value) ? rate + value : rate), 0);
}

function siftTicket(possibilities, ticket) {
    ticket.forEach((value, index) => {
        possibilities[index] = possibilities[index].filter((rule) => isValidFor(rule, value));
    });
}

function main() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const [fieldsPart, myTicketPart, ticketsParts] = rawInput.split("\n\n");

    const FIELD_REGEXP = /(.+): (\d+)-(\d+) or (\d+)-(\d+)/;
    const rules = fieldsPart.split("\n").map((line) => {
        [, field, min1, max1, min2, max2] = line.match(FIELD_REGEXP);

        return { field, min1: parseInt(min1), max1: parseInt(max1), min2: parseInt(min2), max2: parseInt(max2) };
    });
    const myTicket = myTicketPart
        .split("\n")[1]
        .split(",")
        .map((val) => parseInt(val));

    const tickets = ticketsParts
        .split("\n")
        .slice(1)
        .map((line) => line.split(",").map((val) => parseInt(val)));

    const ticketScanningErrorRate = tickets.reduce((rate, ticket) => rate + getScanningRateError(rules, ticket), 0);

    resolving.succeed(`Jour ${chalk.red(16)} - the answer is ${chalk.bold.magenta(ticketScanningErrorRate)}`);
}

function main2() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const [fieldsPart, myTicketPart, ticketsParts] = rawInput.split("\n\n");

    const FIELD_REGEXP = /(.+): (\d+)-(\d+) or (\d+)-(\d+)/;
    const rules = fieldsPart.split("\n").map((line) => {
        [, field, min1, max1, min2, max2] = line.match(FIELD_REGEXP);

        return { field, min1: parseInt(min1), max1: parseInt(max1), min2: parseInt(min2), max2: parseInt(max2) };
    });
    const myTicket = myTicketPart
        .split("\n")[1]
        .split(",")
        .map((val) => parseInt(val));

    const tickets = ticketsParts
        .split("\n")
        .slice(1)
        .map((line) => line.split(",").map((val) => parseInt(val)));
    const validTickets = tickets.filter((ticket) => isTicketValid(rules, ticket));

    let possibilities = new Array(myTicket.length).fill([]).map(() => [...rules]);

    for (ticket of validTickets) {
        siftTicket(possibilities, ticket);
    }
    siftTicket(possibilities, myTicket)


    const solution = {};
    let fieldFound = 0;
    while (fieldFound < myTicket.length) {
        const resolvedRules = possibilities
            .map((rules, index) => ({ rules, index }))
            .filter(({ rules }) => rules.length === 1);
        resolvedRules.forEach(({ rules, index }) => {
            const { field } = rules[0];
            solution[field] = myTicket[index];
            fieldFound++;
            possibilities = possibilities.map((rules) => rules.filter(({ field: f }) => field !== f));
        });
    }

    const product = Object.keys(solution).reduce((product, field) => field.startsWith('departure') ? product * solution[field] : product, 1)

    resolving.succeed(`Jour ${chalk.red(16)} - the answer is ${chalk.bold.magenta(product)}`);
}

main2();
