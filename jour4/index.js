const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function checkField(field, value) {
    switch (field) {
        case "byr":
            return value.length === 4 && parseInt(value) >= 1920 && parseInt(value) <= 2002;
        case "iyr":
            return value.length === 4 && parseInt(value) >= 2010 && parseInt(value) <= 2020;
        case "eyr":
            return value.length === 4 && parseInt(value) >= 2020 && parseInt(value) <= 2030;
        case "hgt":
            const unit = [...value].reverse().slice(0, 2).reverse().join("");
            if (unit !== "cm" && unit !== "in") {
                return false;
            }
            const height = parseInt(value.substring(0, value.length - 2));
            if (unit === "cm") {
                return height >= 150 && height <= 193;
            } else {
                return height >= 59 && height <= 76;
            }
        case "hcl": {
            const [first, ...others] = value;
            if (first !== "#") {
                return false;
            }
            if (others.length !== 6) return false;
            const authorized = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
            return others.every((digit) => authorized.includes(digit));
        }
        case "ecl":
            return ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"].includes(value);
        case "pid": {
            const authorized = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
            if (value.length !== 9) return false;
            return [...value].every((digit) => authorized.includes(digit));
        }
        default:
            return false;
    }
}

function getValidPassports(passports, mandatoryFields) {
    return passports.filter((passport) => {
        return mandatoryFields.every(f => {
            const field = passport.find(({key}) => key === f)
            return field && checkField(field.key, field.value)
        })
    });
}

async function main() {
    const readingFile = ora("Reading file").start();
    const rawInput = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
    const passports = rawInput.split("\n\n").map((raw) => {
        const fields = raw.split(/\n| /);
        return fields.map((field) => {
            const [key, value] = field.split(":");
            return { key, value };
        });
    });
    readingFile.succeed(`Reading ${chalk.magenta.bold(passports.length)} passports`);

    const parsing = ora("Computing data").start();
    const mandatoryFields = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"];
    const validPassports = getValidPassports(passports, mandatoryFields);

    parsing.succeed(`Found ${chalk.magenta.bold(validPassports.length)} valid passports`);
}

main();
