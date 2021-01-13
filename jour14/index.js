const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

const INSTRUCTION_REGEX = /mem\[(\d+)\] = (\d+)/;

function getMasks(maskLine) {
    let oneMask = "0b";
    let zeroMask = "0b";

    maskLine
        .split(" = ")[1]
        .split("")
        .forEach((c) => {
            oneMask = `${oneMask}${c === "1" ? "1" : "0"}`;
            zeroMask = `${zeroMask}${c === "0" ? "0" : "1"}`;
        });

    return { oneMask: BigInt(oneMask), zeroMask: BigInt(zeroMask) };
}

function getMasks2(maskLine) {
    let mask = "0b";

    const maskRaw = maskLine.split(" = ")[1].split("");

    maskRaw.forEach((c) => {
        mask = `${mask}${c === "1" ? "1" : "0"}`;
    });

    const xMasks = getPermutations(maskRaw).map((mask) => getMasks(`mask = ${mask}`));

    return { mask: BigInt(mask), xMasks };
}

function getPermutations(indices) {
    if (indices.length === 1) {
        if (indices[0] === "X") {
            return ["1", "0"];
        } else {
            return ["X"];
        }
    }
    const perms = getPermutations(indices.slice(1));
    if (indices[0] === "X") {
        return perms.map((p) => `${0}${p}`).concat(perms.map((p) => `${1}${p}`));
    } else {
        return perms.map((p) => `X${p}`);
    }
}

function transformValue(value, oneMask, zeroMask) {
    return (value | oneMask) & zeroMask;
}

function transformValue2(value, mask, xMasks) {
    const base = value | mask;

    return xMasks.map(({ oneMask, zeroMask }) => transformValue(base, oneMask, zeroMask));
}

function sumMemory(memory) {
    return Object.values(memory).reduce((sum, num) => sum + num, 0n);
}

function main() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const instructions = rawInput.split("\n").map((line) => {
        if (line.startsWith("mask")) {
            return { type: "mask", value: line };
        }
        const [, address, value] = line.match(INSTRUCTION_REGEX);
        return { address, value: BigInt(value) };
    });

    const memory = {};
    let oneMask,
        zeroMask = 0n;
    instructions.forEach(({ address, value, type }) => {
        if (type === "mask") {
            ({ oneMask, zeroMask } = getMasks(value));
        } else {
            memory[address] = transformValue(value, oneMask, zeroMask);
        }
    });

    resolving.succeed(`Jour ${chalk.red(14)} - the answer is ${chalk.bold.magenta(sumMemory(memory))}`);
}

function main2() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const instructions = rawInput.split("\n").map((line) => {
        if (line.startsWith("mask")) {
            return { type: "mask", value: line };
        }
        const [, address, value] = line.match(INSTRUCTION_REGEX);
        return { address: BigInt(address), value: BigInt(value) };
    });

    const memory = {};
    let mask, xMasks;
    instructions.forEach(({ address, value, type }) => {
        if (type === "mask") {
            ({ mask, xMasks } = getMasks2(value));
        } else {
            const addresses = transformValue2(address, mask, xMasks);
            addresses.forEach((a) => {
                memory[a] = value;
            });
        }
    });

    resolving.succeed(`Jour ${chalk.red(14)} - the answer is ${chalk.bold.magenta(sumMemory(memory))}`);
}

// main();
main2();
