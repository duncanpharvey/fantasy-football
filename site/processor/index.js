const scraper = require("./scraper");
const { simulate } = require("./simulator");
const { client, collection } = require("./mongo");

(async () => {
    await client.connect();

    const today = new Date();
    const week1 = new Date(2021, 8, 7) // Tuesday, 9/14 (2 days before start of week 1)
    const numWeeksCompleted = Math.min(15, Math.floor((today - week1) / (1000 * 60 * 60 * 24 * 7)));
    console.log(`Completed weeks: ${numWeeksCompleted}`);

    // find matchups that haven't been scraped
    const weeksToScrapeSet = new Set();
    const results1 = await collection.find({ "week": { "$exists": true } }).toArray();
    const scrapedWeeks = new Set(results1.map(item => item.week));
    for (let i = 1; i <= 15; i++) {
        if (!scrapedWeeks.has(i)) weeksToScrapeSet.add(i);
    }

    //  find scores that haven't been scraped for matchups
    const results2 = await collection.find({ "week": { "$lte": numWeeksCompleted }, "completed": false }).toArray();

    results2.forEach(item => weeksToScrapeSet.add(item.week));

    const weeksToScrape = Array.from(weeksToScrapeSet);
    console.log(`Weeks to scrape: ${weeksToScrape.length > 0 ? weeksToScrape : "None"}`);

    // scrape data from weeks as needed
    if (weeksToScrape.length > 0) {
        await scraper.scrapeData(weeksToScrape, numWeeksCompleted);
    }

    await simulate();

    client.close();
})().catch(err => {
    process.send({ isError: true, data: err.message });
});
