const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function getOutput({ rows, turnNumber, nbChanges = 0 }) {
    const infoLine = `Tour numéro ${chalk.bold.green(turnNumber)} (${nbChanges} changes)`;
    const seats = rows.map((row) => row.map(({ label }) => label).join("")).join("\n");

    return `\n${infoLine}\n\n${seats}`;
}

function getVoisins(rows, { x, y }) {
    const voisins = [];
    const maxX = rows[0].length - 1;
    const maxY = rows.length - 1;

    if (x > 0) {
        voisins.push(rows[y][x - 1]);
        if (y !== 0) {
            voisins.push(rows[y - 1][x - 1]);
        }
        if (y < maxY) {
            voisins.push(rows[y + 1][x - 1]);
        }
    }
    if (x < maxX) {
        voisins.push(rows[y][x + 1]);
        if (y !== 0) {
            voisins.push(rows[y - 1][x + 1]);
        }
        if (y < maxY) {
            voisins.push(rows[y + 1][x + 1]);
        }
    }
    if (y > 0) {
        voisins.push(rows[y - 1][x]);
    }
    if (y < maxY) {
        voisins.push(rows[y + 1][x]);
    }

    return voisins;
}

function getAdjacentOccupiedCount(rows, { x, y }) {
    const voisins = getVoisins(rows, { x, y });
    return voisins.filter(({ value }) => value === "#").length;
}

function countOccupied(rows) {
    return rows.reduce((total, row) => total + row.filter(({ value }) => value === "#").length, 0);
}

function countOccupied2(seats) {
    return Object.values(seats).filter(({ value }) => value === "#").length;
}

function nextTurn(rows) {
    let nbChanges = 0;
    const newsRows = rows.map((row, y) =>
        row.map(({ value }, x) => {
            if (value === ".") return { value, label: "." };
            const count = getAdjacentOccupiedCount(rows, { x, y });
            if (value === "L") {
                if (count === 0) {
                    nbChanges++;
                    return { value: "#", label: `${chalk.bold.red("#")}` };
                } else {
                    return { value: "L", label: "L" };
                }
            }
            if (value === "#") {
                if (count >= 4) {
                    nbChanges++;
                    return { value: "L", label: `${chalk.bold.red("L")}` };
                } else {
                    return { value: "#", label: "#" };
                }
            }
        })
    );

    return { rows: newsRows, nbChanges };
}

function nextTurn2(seats) {
    const newSeats = {};
    let nbChanges = 0;
    for (let id in seats) {
        const voisins = seats[id].voisins;
        const countOccupied = voisins.map((i) => seats[i].value).filter((value) => value === "#").length;
        const { value } = seats[id];
        if (value === "L") {
            if (countOccupied === 0) {
                newSeats[id] = { value: "#", voisins };
                nbChanges++;
            } else {
                newSeats[id] = seats[id];
            }
        } else if (value === "#") {
            if (countOccupied >= 5) {
                newSeats[id] = { value: "L", voisins };
                nbChanges++;
            } else {
                newSeats[id] = seats[id];
            }
        }
    }

    return { nbChanges, seats: newSeats };
}

async function print(data) {
    return new Promise((res) => {
        setTimeout(() => {
            console.clear();
            console.log(data);
            res();
        }, 10);
    });
}

function getSeatInDirection({ seats, maxX, maxY }, id, { dx, dy }) {
    let [x, y] = id.split("-").map((n) => parseInt(n));
    x = x + dx;
    y = y + dy;
    while (x >= 0 && x <= maxX && y >= 0 && y <= maxY) {
        if (seats[`${x}-${y}`]) {
            return seats[`${x}-${y}`];
        }
        x = x + dx;
        y = y + dy;
    }

    return null;
}

async function main() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    let rows = rawInput.split("\n").map((row) => [...row].map((value) => ({ value, label: value })));

    let turnNumber = 1;
    let nbChanges = -1;
    while (nbChanges !== 0) {
        ({ rows, nbChanges } = nextTurn(rows));
        turnNumber++;
        resolving.text = await print(getOutput({ rows, turnNumber, nbChanges }));
    }
    resolving.succeed(`Finish in ${turnNumber} turns, answer is ${chalk.bold.magenta(countOccupied(rows))}`);
}

function main2() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
    const rows = rawInput.split("\n");
    const maxX = rows[0].length;
    const maxY = rows.length;

    let seats = {};
    rows.forEach((row, y) => {
        [...row].forEach((value, x) => {
            if (value !== ".") {
                const id = `${x}-${y}`;
                seats[id] = { value, id };
            }
        });
    });
    const directions = [
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
        { dx: 1, dy: 1 },
        { dx: 1, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: -1, dy: 1 },
        { dx: -1, dy: -1 },
        { dx: -1, dy: 0 },
    ];
    Object.keys(seats).map((id) => {
        const voisins = directions
            .map((dir) => {
                const voisin = getSeatInDirection({ seats, maxX, maxY }, id, dir);
                return voisin && voisin.id;
            })
            .filter((voisin) => !!voisin);
        seats[id].voisins = voisins;
    });

    let turnNumber = 1;
    let nbChanges = -1;
    while (nbChanges !== 0) {
        ({ seats, nbChanges } = nextTurn2(seats));
        turnNumber++;
    }
    resolving.succeed(`Finish in ${turnNumber} turns, answer is ${chalk.bold.magenta(countOccupied2(seats))}`);
}

//main();
main2();
