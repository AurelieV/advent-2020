const fs = require('fs')
const path = require('path')
const ora = require('ora');


function searchTwo(numbers, total) {
    if (numbers.length === 0) return null;
    const [first, ...others] = numbers;
    for (let number of others) {
        if (first + number === total) {
            return [first, number];
        }
    }
    return searchTwo(others, total);
}

function searchThree(numbers) {
    if (numbers.length === 0) return null;
    for (let i = 0; i < numbers.length - 1; i++) {
        const find = searchTwo(numbers.slice(i + 1), 2020 - numbers[i]);
        if (find) {
            return [numbers[i], ...find];
        }
    }
    const [,...others] = numbers
    return searchThree(others);
}

async function main() {
    const readingFile = ora('Reading file').start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, 'input.txt'), 'utf-8')
    const numbers = rawInput.split('\n').map(txt => parseInt(txt))
    readingFile.succeed(`Input contains ${numbers.length} numbers`)

    const searching = ora('Computing data ...').start();
    const [first, second, third] = searchThree(numbers) ||[];
    searching.succeed(`Find ${first} + ${second} + ${third} === 2020, result = ${first * second * third}`)

}

main()