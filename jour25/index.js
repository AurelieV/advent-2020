const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

const SUBJECT_NUMBER  = 7

function loop(value, subjectNumber) {
    return (value * subjectNumber) % 20201227
}

function getLoopSize(publicKey, subjectNumber) {
    let loopSize = 0;
    let value = 1;
    while (value !== publicKey) {
        value = loop(value, subjectNumber)
        loopSize++;
    }

    return loopSize;
}

function main() {
    console.time('exec')
    const resolving = ora("Reading file").start();
    const publicKeys = [14222596,4057428]
    // const publicKeys = [5764801, 17807724]
    const secrets = publicKeys.map(key => getLoopSize(key, SUBJECT_NUMBER))

    let handshake = 1
    for (let i = 1; i <= secrets[1]; i++) {
        handshake = loop(handshake, publicKeys[0])
    }
    
    resolving.succeed(
        `Jour ${chalk.red(25)} - the answer is ${chalk.bold.magenta(handshake)}`
    );
    console.timeEnd('exec')
}

main();
