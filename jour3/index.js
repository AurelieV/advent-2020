const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function countTree(map, slop) {
    let currentPos = {x: 0, y: 0};
    const width = map[0].length;
    const height = map.length;

    let nbTree = 0;
    while (currentPos.y < height) {
        const isTree = map[currentPos.y][currentPos.x];
        if (isTree) {
            nbTree++;
        }
        currentPos = {x: (currentPos.x + slop.x) % width, y: currentPos.y + slop.y}
    }

    return nbTree;
}

async function main() {
    const readingFile = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
    const map = rawInput.split("\n").map((row) => [...row].map((c) => c === "#"));

    const width = map[0].length;
    const height = map.length;
    const mapSizes = `${width}x${height}`

    readingFile.succeed(`You have a map of ${chalk.magenta.bold(mapSizes)} tiles`)

    const slops = [{x:1, y:1}, {x: 3, y: 1}, {x: 5, y:1}, {x: 7, y:1}, {x: 1, y:2}];

    const counting = ora('Counting tree').start();
    const nbTrees = slops.map(slop => countTree(map, slop));
    counting.succeed(`You crash into ${nbTrees.join('/')} trees, ${chalk.magenta.bold(nbTrees.reduce((p, nb) => nb * p, 1))}`)
}

main();
