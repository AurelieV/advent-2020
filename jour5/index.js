const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function getCoordinates(boardingPass) {
    const row = parseInt(boardingPass.substring(0, 7).replace(/F/g, "0").replace(/B/g, "1"), 2);
    const seat = parseInt(boardingPass.substring(7).replace(/L/g, "0").replace(/R/g, "1"), 2);

    return { row, seat };
}

async function main() {
    const readingFile = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const seatIds = rawInput.split("\n").map(pnr => {
        const {row, seat} = getCoordinates(pnr)
        return row * 8 + seat
        
    });
    readingFile.succeed(
        `Parsing ${seatIds.length} boarding passes, maximum seatId: ${chalk.bold.magenta(
            Math.max(...seatIds)
        )}`
    );

    seatIds.sort();
    const missingSeats = seatIds.find((id, index) => {
        if (index === seatIds.length - 1) return false;
        return seatIds[index + 1] === id + 2
    });
    console.log(`Missing seat: ${chalk.bold.magenta(missingSeats + 1)}`)
}

main();
