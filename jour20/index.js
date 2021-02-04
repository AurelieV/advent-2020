const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function getRotation({ top, bottom, right, left }) {
    return {
        top: [...left].reverse(),
        right: [...top],
        bottom: [...right].reverse(),
        left: [...bottom],
    };
}

function getRotations(tile) {
    const rotations = [tile];
    let rotation = tile;
    for (let i = 1; i <= 3; i++) {
        rotation = getRotation(rotation);
        rotations.push(rotation);
    }

    return rotations;
}

function isBorderMatching(borderA, borderB) {
    return borderA.every((value, index) => value === borderB[index]);
}

function canVersionsMatch(versionA, versionB) {
    return (
        isBorderMatching(versionA.top, versionB.bottom) ||
        isBorderMatching(versionA.bottom, versionB.top) ||
        isBorderMatching(versionA.right, versionB.left) ||
        isBorderMatching(versionA.left, versionB.right)
    );
}

function canTilesMatch(tileA, tileB) {
    const versionsA = tileA.versions;
    const versionsB = tileB.versions;

    return versionsA.some((versionA) => versionsB.some((versionB) => canVersionsMatch(versionA, versionB)));
}

function addMatch(matches, idA, idB) {
    const matchesA = matches.get(idA);
    const matchesB = matches.get(idB);

    matchesA.push(idB);
    matchesB.push(idA);
}

function printTile(tile) {
    console.log(tile.top.join(""));
    tile.left.forEach((val, i) => {
        if (i !== 0 && i !== tile.left.length - 1) {
            const line = `${val}        ${tile.right[i]}`;
            console.log(line);
        }
    });
    console.log(tile.bottom.join(""));
}

function main() {
    console.time("exec");
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const tiles = rawInput.split("\n\n").map((rawTile) => {
        const [tileLine, ...rawRows] = rawTile.split("\n");
        const id = parseInt(tileLine.match(/Tile (\d+):/)[1]);
        const rows = rawRows.map((line) => line.split(""));

        const borders = {
            top: rows[0],
            bottom: rows[rows.length - 1],
            left: rows.reduce((left, row) => [...left, row[0]], []),
            right: rows.reduce((left, row) => [...left, row[rows.length - 1]], []),
        };

        const faces = [
            borders,
            {
                top: [...borders.bottom],
                bottom: [...borders.top],
                left: [...borders.left].reverse(),
                right: [...borders.right].reverse(),
            },
        ];

        const versions = [...getRotations(faces[0]), ...getRotations(faces[1])];

        return {
            id,
            versions,
        };
    });

    const matches = new Map(tiles.map((tile) => [tile.id, []]));
    const nbTiles = tiles.length;
    for (let indexA = 0; indexA <= nbTiles - 1; indexA++) {
        for (let indexB = indexA + 1; indexB <= nbTiles - 1; indexB++) {
            const isMatching = canTilesMatch(tiles[indexA], tiles[indexB]);
            if (isMatching) {
                addMatch(matches, tiles[indexA].id, tiles[indexB].id);
            }
        }
    }

    const corners = [];
    matches.forEach((ids, id) => {
        if (ids.length === 2) {
            corners.push(id);
        }
    });

    // console.log(matches)
    // printTile(tiles[0].versions[0])
    // console.log('\n\n')
    // printTile(tiles[1].versions[0])
    // console.log(canVersionsMatch(tiles[0].versions[0], tiles[1].versions[0]))

    const result = corners.reduce((p, corner) => p * corner, 1);

    resolving.succeed(
        `Jour ${chalk.red(20)} - found ${corners.length} corners, the answer is ${chalk.bold.magenta(result)}`
    );
    console.timeEnd("exec");
}

main();
