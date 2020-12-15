const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function extractRules(line) {
    let [type, rules] = line.split(" bags contain ");
    if (rules === "no other bags.") {
        return { type, rules: [] };
    }
    rules = rules.split(", ").map((rule) => {
        const words = rule.split(" ");
        const nb = parseInt(words[0]);
        const type = words.slice(1, -1).join(" ");

        return { nb, type };
    });

    return { type, rules };
}

function uniques(arr1, arr2) {
    return [...new Set([...arr1, ...arr2])];
}

function setPossibleChildren(bagRules, type, childrenByType) {
    if (childrenByType[type]) return;
    if (bagRules[type].length === 0) {
        childrenByType[type] = [];
    }

    bagRules[type].forEach(({ type: childType }) => {
        setPossibleChildren(bagRules, childType, childrenByType);
        childrenByType[type] = childrenByType[type] || [];
        childrenByType[type].push(childType);
        childrenByType[type] = uniques(childrenByType[type] || [], childrenByType[childType] || []);
    });
}

function setQuantities(bagRules, type, quantitiesByType) {
    if (quantitiesByType[type] !== undefined) return;
    if (bagRules[type].length === 0) {
        quantitiesByType[type] = 0;
    }
    bagRules[type].forEach(({ type: childType }) => {
        setQuantities(bagRules, childType, quantitiesByType);
    });
    quantitiesByType[type] = 0
    bagRules[type].forEach(({ type: childType, nb: childNb }) => {
        quantitiesByType[type] = quantitiesByType[type] + childNb * (quantitiesByType[childType]+ 1)
    });
}

async function main() {
    const readingFile = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
    const rawRules = rawInput.split("\n");
    const bagRules = {};
    rawRules.forEach((rawRule) => {
        const { type, rules } = extractRules(rawRule);
        bagRules[type] = rules;
    });
    readingFile.succeed(`Parsing ${rawRules.length} rules`);

    const constructing = ora("Constructing ...").start();
    const childrenByType = {};
    Object.keys(bagRules).forEach((type) => setPossibleChildren(bagRules, type, childrenByType));
    constructing.succeed(`All children constructed`);

    const result = Object.keys(childrenByType).filter((type) => childrenByType[type].includes("shiny gold"));
    console.log(`Found ${chalk.bold.magenta(result.length)} possibilityes for shiny gold`);

    const constructingQuantities = ora("Constructing ...").start();
    const quantitiesByType = {};
    Object.keys(bagRules).forEach((type) => setQuantities(bagRules, type, quantitiesByType));
    constructingQuantities.succeed(`All quantities constructed`);

    fs.writeFileSync('./test2.json', JSON.stringify(quantitiesByType, null, 4))

    console.log(`Shiny gold contains ${chalk.bold.magenta(quantitiesByType['shiny gold'])} bags}`)

}

main();
