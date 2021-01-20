const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function transformLine(line) {
    return new Map(line.split("").map((c, x) => [x, c]));
}
function getCube(pocketDimension, { x, y, z, w }) {
    const time = pocketDimension.get(w);
    if (!time) return '.';
    const plan = time.get(z);
    if (!plan) return ".";
    const line = plan.get(y);
    if (!line) return ".";
    return line.get(x) || ".";
}
function setCube(pocketDimension, { x, y, z, w }, value) {
    if (!pocketDimension.has(w)) {
        pocketDimension.set(w, new Map());
    }
    const time = pocketDimension.get(w)
    if (!time.has(z)) {
        time.set(z, new Map());
    }
    const plan = time.get(z);
    if (!plan.has(y)) {
        plan.set(y, new Map());
    }
    const line = plan.get(y);
    line.set(x, value);
}

function getActiveVoisinsCount(pocketDimension, { x, y, z, w }) {
    const coordinates = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
                for (let dw = -1; dw <= 1; dw++) {
                    if (dx !== 0 || dy !== 0 || dz !== 0 || dw !== 0) {
                        coordinates.push({
                            x: x + dx,
                            y: y + dy,
                            z: z + dz,
                            w: w + dw,
                        });
                    }
                }
            }
        }
    }

    return coordinates.map((cube) => getCube(pocketDimension, cube)).filter((val) => val === "#").length;
}
function getNewCubeValue(pocketDimension, cube) {
    const count = getActiveVoisinsCount(pocketDimension, cube);
    if (getCube(pocketDimension, cube) === ".") {
        return count === 3 ? "#" : ".";
    } else {
        return count === 3 || count === 2 ? "#" : ".";
    }
}

function getNext(pocketDimension, min, max) {
    let newPocketDimension = new Map();
    for (let x = min; x < max; x++) {
        for (let y = min; y < max; y++) {
            for (let z = min; z <= -min; z++) {
                for (let w = min; w <= -min; w++) {
                    const newCube = getNewCubeValue(pocketDimension, { x, y, z, w });
                    setCube(newPocketDimension, { x, y, z, w }, newCube);
                }
            }
        }
    }

    return newPocketDimension;
}

function countActive(pocketDimension) {
    let count = 0;
    for (const time of pocketDimension.values()) {
        for (const plan of time.values()) {
            for (const line of plan.values()) {
                for (const cube of line.values()) {
                    if (cube === "#") {
                        count++;
                    }
                }
            }
        }
    }

    return count;
}

function main() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const planZ0 = new Map(rawInput.split("\n").map((line, y) => [y, transformLine(line)]));

    let pocketDimension = new Map([[0, new Map([[0, planZ0]])]]);
    const initialSize = planZ0.get(0).size;

    for (let turn = 1; turn <= 6; turn++) {
        pocketDimension = getNext(pocketDimension, -turn, initialSize + turn);
    }

    resolving.succeed(`Jour ${chalk.red(17)} - the answer is ${chalk.bold.magenta(countActive(pocketDimension))}`);
}

main();
