const puppeteer = require("puppeteer");

async function scrapeData() {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto("https://fantasy.nfl.com/league/1697750");
    console.log("navigated to login");
    await page.waitForSelector("#gigya-loginID-60062076330815260", { visible: true });
    console.log("username element loaded");
    await page.waitForSelector("#gigya-password-85118380969228590", { visible: true });
    console.log("password element loaded");
    await page.evaluate(`document.getElementById("gigya-loginID-60062076330815260").value="${process.env.username}";`);
    console.log("username typed");
    await page.evaluate(`document.getElementById("gigya-password-85118380969228590").value="${process.env.password}";`);
    console.log("password typed");
    await page.evaluate("document.querySelector(\"input[value='Sign In']\").click()");
    console.log("sign in clicked");

    // scrape team data
    await page.waitForSelector(".tableType-team .teamName");
    console.log("scraping team data");
    const teams = await page.evaluate(() => {
        const teams = {};
        const elements = document.querySelectorAll(".tableType-team .teamName");
        for (let e of elements) {
            const id = e.getAttribute("href").match(/\d+$/)[0];
            const name = e.textContent;
            teams[id] = name;
        }
        return teams;
    });

    // get all matchups and scrape scores from matchups that have already occurred
    const matchups = {};
    for (let i = 1; i <= 15; i++) {
        await page.goto(`https://fantasy.nfl.com/league/1697750?scoreStripType=fantasy&week=${i}`);
        await page.waitForFunction("document.querySelectorAll(\"#leagueHomeScoreStrip .teamNav li .teamTotal\").length == 12");
        console.log(`scraping week ${i} data`);
        matchups[i] = await getWeeklyMatchups(page);
    }

    await browser.close();
    return { "teams": teams, "matchups": matchups }
}

async function getWeeklyMatchups(page) {
    const results = await page.evaluate(() => {
        const weeklyMatchups = [];
        const elements = document.querySelectorAll("#leagueHomeScoreStrip .teamNav li");
        for (let e of elements) {
            const id1 = e.querySelector(".first > .teamTotal").classList[1].match(/\d+$/)[0];
            const score1 = e.querySelector(".first > .teamTotal").textContent;
            const id2 = e.querySelector(".last > .teamTotal").classList[1].match(/\d+$/)[0];
            const score2 = e.querySelector(".last > .teamTotal").textContent;
            const matchup = { id1: parseInt(id1), score1: parseFloat(score1), id2: parseInt(id2), score2: parseFloat(score2) };
            weeklyMatchups.push(matchup);
        }
        return weeklyMatchups;
    });
    return results;
}

module.exports = {
    scrapeData: scrapeData
}
