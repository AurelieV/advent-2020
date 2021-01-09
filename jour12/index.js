const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

const DELTA = {
    N: { dx: 0, dy: -1 },
    S: { dx: 0, dy: 1 },
    E: { dx: 1, dy: 0 },
    W: { dx: -1, dy: 0 },
};
const DIRECTIONS = ["N", "E", "S", "W"];

function main() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const instructions = rawInput.split("\n").map((line) => {
        return { command: line[0], value: parseInt(line.substring(1)) };
    });
    let currentDirection = "E";
    let position = { x: 0, y: 0 };
    instructions.forEach(({ command, value }) => {
        switch (command) {
            case "F": {
                let { dx, dy } = DELTA[currentDirection];
                position.x = position.x + dx * value;
                position.y = position.y + dy * value;
                break;
            }
            case "R": {
                let angle = value / 90;
                let currentIndex = DIRECTIONS.findIndex(dir => dir === currentDirection);
                currentDirection = DIRECTIONS[(currentIndex + angle) % 4];
                break;
            }
            case "L": {
                let angle = value / 90;
                let currentIndex = DIRECTIONS.findIndex(dir => dir === currentDirection);
                currentDirection = DIRECTIONS[(currentIndex - angle + 4) % 4];
                break;
            }
            default: {
                let { dx, dy } = DELTA[command];
                position.x = position.x + dx * value;
                position.y = position.y + dy * value;
                break;
            }
        }
    });

    resolving.succeed(
        `Finish ${instructions.length} instructions. Finishing at ${position.x}//${
            position.y
        }, answers is ${chalk.bold.magenta(Math.abs(position.x) + Math.abs(position.y))}`
    );
}

function rotateLeft(x, y) {
     return {
         x: y,
         y: -x
     }
}

function rotateRight(x, y) {
    return {
        x: -y,
        y: x
    }
}

function main2() {
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const instructions = rawInput.split("\n").map((line) => {
        return { command: line[0], value: parseInt(line.substring(1)) };
    });

    let position = { x: 0, y: 0 };
    let waypoint = { x: 10, y: -1};

    instructions.forEach(({ command, value }) => {
        switch (command) {
            case "F": {
                const tx = waypoint.x * value;
                const ty = waypoint.y * value;

                position.x = position.x + tx;
                position.y = position.y + ty;
                break;
            }
            case "R": {
                let x = waypoint.x
                let y = waypoint.y
                const angle = value / 90;
                for (let i = 0; i < angle; i++) {
                    ({x, y} = rotateRight(x, y))
                }
                waypoint.x = x;
                waypoint.y = y;
                break;
            }
            case "L": {
                let x = waypoint.x
                let y = waypoint.y
                const angle = value / 90;
                for (let i = 0; i < angle; i++) {
                    ({x, y} = rotateLeft(x, y))
                }
                waypoint.x = x;
                waypoint.y = y;
                break;
            }
            default: {
                let { dx, dy } = DELTA[command];
                waypoint.x = waypoint.x + dx * value;
                waypoint.y = waypoint.y + dy * value;
                break;
            }
        }
    });

    resolving.succeed(
        `Finish ${instructions.length} instructions. Finishing at ${position.x}//${
            position.y
        }, answers is ${chalk.bold.magenta(Math.abs(position.x) + Math.abs(position.y))}`
    );
}

main2();
