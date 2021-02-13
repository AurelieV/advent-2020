const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

const DIRECTIONS = ["e", "w", "se", "sw", "ne", "nw"];

function getVoisin({ x, y }, direction) {
    switch (direction) {
        case "e":
            return { x: x + 2, y };
        case "w":
            return { x: x - 2, y };
        case "se":
            return { x: x + 1, y: y + 1 };
        case "sw":
            return { x: x - 1, y: y + 1 };
        case "ne":
            return { x: x + 1, y: y - 1 };
        case "nw":
            return { x: x - 1, y: y - 1 };
    }
}

function getBlackVoisinsCount(tile, blackTiles) {
    let count = 0;
    DIRECTIONS.forEach(direction => {
        const {x, y} = getVoisin(tile, direction)
        const id = `${x}/${y}`;
        if (blackTiles.has(id)) {
            count++;
        }
    })
    return count;
}

function getTile(path, originTile = { x: 0, y: 0 }) {
    if (path === "") return originTile;
    const direction = DIRECTIONS.find((dir) => path.startsWith(dir));
    const voisin = getVoisin(originTile, direction);
    return getTile(path.replace(direction, ''), voisin);
}

function flipTile({x, y}, blackTiles) {
    const id = `${x}/${y}`
    if (blackTiles.has(id)) {
        blackTiles.delete(id)
    } else {
        blackTiles.set(id, true)
    }
}

function main() {
    console.time("exec");
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const blackTiles = new Map();
    const instructions = rawInput.split("\n");

    instructions.forEach(path => {
        const tile = getTile(path);
        flipTile(tile, blackTiles)
    })

    let turn = 1;
    while (turn <= 100) {
        const keys = [...blackTiles.keys()]
        const blackXs = keys.map(id => id.split('/')[0]);
        const blackYs = keys.map(id => id.split('/')[1]);
        const maxX = Math.max(...blackXs) + 2;
        const minX = Math.min(...blackXs) - 2;
        const maxY = Math.max(...blackYs) + 1;
        const minY = Math.min(...blackYs) - 1;

        const flipped = []
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const count = getBlackVoisinsCount({x, y}, blackTiles)
                const isBlack = blackTiles.has(`${x}/${y}`)
                if (isBlack && (count === 0 || count > 2)) {
                    flipped.push({x, y})
                }
                if (!isBlack && count === 2) {
                    flipped.push({x, y})
                }
            }
        }
        flipped.forEach(tile => flipTile(tile, blackTiles))
        turn++;
    }

    resolving.succeed(`Jour ${chalk.red(24)} - the answer is ${chalk.bold.magenta(blackTiles.size)}`);
    console.timeEnd("exec");
}

main();
