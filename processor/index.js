const scraper = require("./scraper");
const simulator = require("./simulator");
const fs = require("fs");

main();

async function main() {
    const data = await scraper.scrapeData();
    const results = simulator.simulate(data.teams, data.matchups);
    fs.writeFile('./data/data.json', JSON.stringify(results), 'utf8', err => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("File written successfully");
        }
    });
}
