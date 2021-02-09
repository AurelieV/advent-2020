const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function resolved(possibleIngredients, matched) {
    let hasChanged = false;
    possibleIngredients.forEach((ingredients, allergen) => {
        if (ingredients.length === 1) {
            matched.set(allergen, ingredients[0]);
            hasChanged = true;
            possibleIngredients.forEach((ingredients2, allergen2) => {
                possibleIngredients.set(
                    allergen2,
                    ingredients2.filter((i) => i !== ingredients[0])
                );
            });
        }
    });
    if (hasChanged) {
        resolved(possibleIngredients, matched);
    }
}

function readFood(possibleIngredients, matched, food) {
    food.allergens.forEach((allergen) => {
        const matchingIngredients = food.allergens.map((allergen) => matched.get(allergen)).filter((i) => !!i);
        const ingredients = food.ingredients.filter((i) => !matchingIngredients.includes(i));
        const possibles = possibleIngredients.get(allergen);
        if (possibles) {
            possibleIngredients.set(
                allergen,
                possibles.filter((i) => ingredients.includes(i))
            );
        } else {
            possibleIngredients.set(allergen, ingredients);
        }
        resolved(possibleIngredients, matched);
    });
}

function main() {
    console.time("exec");
    const resolving = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");

    const foods = rawInput
        .replace(/,/g, "")
        .split("\n")
        .map((line) => {
            const [, rawIngredients, rawAllergens] = line.match(/(.+) \((.+)\)/);
            return {
                ingredients: rawIngredients.split(" "),
                allergens: rawAllergens.split(" ").slice(1),
            };
        });

    const possibleIngredients = new Map();
    const matched = new Map();

    foods.forEach((food) => readFood(possibleIngredients, matched, food));

    const allIngredients = [...new Set([].concat(...foods.map(({ ingredients }) => ingredients)))];
    const matchingIngredients = [...matched.values()];
    const safeIngredients = allIngredients.filter((i) => !matchingIngredients.includes(i));

    const answer = foods.reduce((total, food) => {
        const count = food.ingredients.filter((i) => safeIngredients.includes(i)).length;
        return total + count;
    }, 0);

    const canonical = [...matched.entries()]
        .sort(([allergen1], [allergen2]) => allergen1.localeCompare(allergen2))
        .map(([, ingredient]) => ingredient)
        .join(",");

    resolving.succeed(`Jour ${chalk.red(21)} - the answer is ${chalk.bold.magenta(answer)}, canonical is ${canonical}`);
    console.timeEnd("exec");
}

main();
