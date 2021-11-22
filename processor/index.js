const scraper = require("./scraper");
const simulator = require("./simulator");

main();

async function main() {
    const data = await scraper.scrapeData();
    const results = simulator.simulate(data.teams, data.matchups);
    console.log(JSON.stringify(results));
}
