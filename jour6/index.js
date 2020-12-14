const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function getNbAnswers(group) {
    const answersByPerson = group.map(person => [...person]);
    let answers = new Set([].concat(...answersByPerson));

    return answers.size;
}

function getNbAnswers2(group) {
    const answersByPerson = group.map(person => [...person]);
    let answers = [].concat(...answersByPerson);
    const nbPersonsByAnswer = {};
    answers.forEach(a => {
        nbPersonsByAnswer[a] = (nbPersonsByAnswer[a] || 0) + 1
    })

    return Object.keys(nbPersonsByAnswer).filter(a => nbPersonsByAnswer[a] === group.length).length
}


async function main() {
    const readingFile = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const groups = rawInput.split('\n\n').map(group => group.split('\n'))
    const nbAnsersByGroup = groups.map(getNbAnswers);
    const nbAnsersByGroup2 = groups.map(getNbAnswers2);

    const totalAnswers = nbAnsersByGroup.reduce((total, nb) => total + nb, 0)
    const totalAnswers2 = nbAnsersByGroup2.reduce((total, nb) => total + nb, 0)

    readingFile.succeed(`There is ${groups.length} groups, total answers ${chalk.bold.magenta(totalAnswers)}, or for exo 2 ${chalk.bold.magenta(totalAnswers2)}`)

}

main();
