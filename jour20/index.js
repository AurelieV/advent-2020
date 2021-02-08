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

function getDirectionsMatch(versionA, versionB) {
    if (isBorderMatching(versionA.top, versionB.bottom)) {
        return ["top", "bottom"];
    } else if (isBorderMatching(versionA.bottom, versionB.top)) {
        return ["bottom", "top"];
    } else if (isBorderMatching(versionA.right, versionB.left)) {
        return ["right", "left"];
    } else if (isBorderMatching(versionA.left, versionB.right)) {
        return ["left", "right"];
    }

    return null;
}

function canTilesMatch(tileA, tileB) {
    const versionsA = tileA.versions;
    const versionsB = tileB.versions;

    return versionsA.some((versionA) => versionsB.some((versionB) => canVersionsMatch(versionA, versionB)));
}

function getTilesMatches(tileA, tileB) {
    const matches = [];
    tileA.versions.forEach((versionA, indexVersionA) => {
        tileB.versions.forEach((versionB, indexVersionB) => {
            const directions = getDirectionsMatch(versionA, versionB);
            if (directions) {
                matches.push({
                    direction: directions[0],
                    version: indexVersionA,
                    with: { id: tileB.id, version: indexVersionB },
                });
            }
        });
    });

    return matches;
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

function getNext(previous, matches, direction) {
    const match = matches
        .get(previous.id)
        .find((match) => match.direction === direction && match.version === previous.version);

    return match.with;
}

function getImage(partialImage, size, matches) {
    if (partialImage.length === size && partialImage[size - 1].length === size) return partialImage;
    let y = partialImage.length - 1;
    let x = partialImage[y].length;
    if (x === size) {
        y++;
        x = 0;
        partialImage.push([]);
    }
    if (x === 0) {
        partialImage[y].push(getNext(partialImage[y - 1][0], matches, "bottom"));
    } else {
        partialImage[y].push(getNext(partialImage[y][x - 1], matches, "right"));
    }
    return getImage(partialImage, size, matches);
}

function cutFirstAndLast(arr) {
    return arr.slice(1, -1);
}

function rotate(rows) {
    const result = [];
    for (let i = 0; i < rows[0].length; i++) {
        const newRow = rows.map((row) => row[i]).reverse();
        result.push(newRow);
    }

    return result;
}

function getVersion(rows, version) {
    if (version >= 4) {
        rows = rows.map((_, index) => rows[rows.length - 1 - index]);
    }
    const nbRotations = version % 4;
    for (let i = 1; i <= nbRotations; i++) {
        rows = rotate(rows);
    }

    return rows;
}

function convertTile(tileById, { id, version }) {
    let rows = tileById.get(id).rows;
    rows = cutFirstAndLast(rows.map(cutFirstAndLast));

    return getVersion(rows, version);
}
function convertLine(line, tileById) {
    const rows = [];
    const tiles = line.map((tile) => convertTile(tileById, tile));
    for (let i = 0; i < tiles[0].length; i++) {
        const row = tiles.reduce((all, tile) => all.concat(tile[i]), []);
        rows.push(row);
    }

    return rows;
}

function convertImage(image, tileById) {
    return image.reduce((result, line) => result.concat(convertLine(line, tileById)), []);
}

function main() {
    console.time("exec");
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const tiles = rawInput.split("\n\n").map((rawTile, index) => {
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
            rows,
        };
    });

    const matches = new Map(tiles.map((tile) => [tile.id, []]));
    const nbTiles = tiles.length;
    for (let indexA = 0; indexA <= nbTiles - 1; indexA++) {
        for (let indexB = 0; indexB <= nbTiles - 1; indexB++) {
            if (indexA !== indexB) {
                const tileMatches = getTilesMatches(tiles[indexA], tiles[indexB]);
                if (tileMatches.length) {
                    matches.set(tiles[indexA].id, matches.get(tiles[indexA].id).concat(tileMatches));
                }
            }
        }
    }

    const corners = [];
    matches.forEach((matchWith, id) => {
        const ids = matchWith.map((match) => match.with.id);
        const matchingTiles = new Set(ids);
        if (matchingTiles.size === 2) {
            corners.push(id);
        }
    });

    const image = getImage([[{ id: corners[0], version: 0 }]], Math.sqrt(nbTiles), matches);
    const tileById = new Map(
        tiles.map((tile) => {
            return [tile.id, tile];
        })
    );
    const final = convertImage(image, tileById);
    console.log(final);

    const result = corners.reduce((p, corner) => p * corner, 1);

    resolving.succeed(
        `Jour ${chalk.red(20)} - found ${corners.length} corners, the answer is ${chalk.bold.magenta(result)}`
    );
    console.timeEnd("exec");
}

main();
