const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function executeProgram(instructions) {
    let currentPos = 0;
    let acc = 0;
    let alreadyExecuted = {};

    while (!alreadyExecuted[currentPos] && currentPos < instructions.length) {
        const { cmd, arg } = instructions[currentPos];
        alreadyExecuted[currentPos] = true;
        switch (cmd) {
            case "nop":
                currentPos += 1;
                break;
            case "acc":
                currentPos += 1;
                acc += arg;
                break;
            case "jmp":
                currentPos += arg;
                break;
        }
    }

    return { acc, hasFinished: currentPos === instructions.length };
}

function generateVariations(instructions) {
    const nopIndexes = instructions.reduce((indexes, {cmd}, index) => cmd === 'nop' ? [index, ...indexes] : indexes, [])
    const jmpIndexes = instructions.reduce((indexes, {cmd}, index) => cmd === 'jmp' ? [index, ...indexes] : indexes, [])

    const programms = nopIndexes.map(index => {
        const newProgram = [...instructions]
        newProgram[index] = { cmd: 'jmp', arg: newProgram[index].arg}

        return newProgram;
    })
    const programms2 = jmpIndexes.map(index => {
        const newProgram = [...instructions]
        newProgram[index] = { cmd: 'nop', arg: newProgram[index].arg}

        return newProgram;
    })

    return [...programms, ...programms2];
}

function markInstruction(instructions, pos) {
    if (pos >= instructions.length) {
        return false;
    }
    
    if (instructions[pos].canFinish !== undefined) {
        return instructions[pos].canFinish;
    }

    if (instructions[pos].visited) {
        instruction[pos].canFinish = false;
        return false;
    } else {
        instructions[pos].visited = true;
    }
     
    const { cmd, arg } = instructions[pos];
    let nextPos = cmd === 'jmp' ? pos + arg : pos + 1;

    if (nextPos === instructions.length) {
        instructions[pos].canFinish = true;
    } else {
        instructions[pos].canFinish = markInstruction(instructions, nextPos);
    }
    
    return instructions[pos].canFinish
}

function executeMarkedProgram(instructions) {
    let currentPos = 0;
    let acc = 0;
    const hasSwitch = false;
    let alreadyExecuted = {};

    while (!alreadyExecuted[currentPos] && currentPos < instructions.length) {
        const { cmd, arg } = instructions[currentPos];
        switch (cmd) {
            case "acc":
                currentPos += 1;
                acc += arg;
                break;
            case "nop":
                if (instructions[ currentPos + 1].canFinish) {
                    currentPos += 1;
                } else {
                    currentPos += arg;
                }
                break;
            case "jmp":
                if (instructions[ currentPos + arg].canFinish) {
                    currentPos += arg;
                } else {
                    currentPos += 1;
                }
                break;
        }
    }
}

async function main() {
    const readingFile = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const instructions = rawInput.split("\n").map((instruction) => {
        const [cmd, arg] = instruction.split(" ");

        return { cmd, arg: parseInt(arg) };
    });

    readingFile.succeed(`Program has ${instructions.length} lines of code`);

    const program = ora("Executing programm...").start();
    const { acc } = executeProgram(instructions);
    program.succeed(`Infinite loop find, acc value is ${chalk.bold.magenta(acc)}`);

    const program2 = ora("Executing programm...").start()
    const programms = generateVariations(instructions)
    const correctProgram = programms.find(p => executeProgram(p).hasFinished)
    const {acc: acc2} = executeProgram(correctProgram);
    program2.succeed(`Correct programm find, acc value is ${chalk.bold.magenta(acc2)}`);

    const program3 = ora("Searching more efficiency").start();
    instructions.forEach((_, pos) => markInstruction(instructions, pos));



}

main();
