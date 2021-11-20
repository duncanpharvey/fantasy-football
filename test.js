const puppeteer = require('puppeteer');

class Team {
    constructor(id, name, wins, points, mean, stddev) {
        this.id = id;
        this.name = name;
        this.wins = wins;
        this.poins = points;
        this.mean = mean;
        this.stddev = stddev;
    }
}

(async () => {

    async function getMatchups() {
        const results = await page.evaluate(() => {
            const matchups = [];
            const elements = document.querySelectorAll(".matchup");
            for (const e of elements) {
                const id1 = e.querySelector(".teamWrap-1 > a").getAttribute("href").match(/\d+$/)[0];
                const score1 = e.querySelector(".teamWrap-1 > .teamTotal").textContent;
                const id2 = e.querySelector(".teamWrap-2 > a").getAttribute("href").match(/\d+$/)[0];
                const score2 = e.querySelector(".teamWrap-2 > .teamTotal").textContent;
                const matchup = { id1: parseInt(id1), score1: parseFloat(score1), id2: parseInt(id2), score2: parseFloat(score2) };
                matchups.push(matchup);
            }
            return matchups;
        });
        return results;
    }

    // const browser = await puppeteer.launch({ headless: false });
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://fantasy.nfl.com/league/1697750?scheduleDetail=1&scheduleType=week&standingsTab=schedule");
    console.log('navigated to login');
    await page.waitForSelector("#gigya-loginID-60062076330815260", { visible: true });
    console.log('username loaded');
    await page.waitForSelector("#gigya-password-85118380969228590", { visible: true });
    console.log('password loaded');
    await page.evaluate(`document.getElementById("gigya-loginID-60062076330815260").value="${process.env.username}";`);
    console.log('username typed');
    await page.evaluate(`document.getElementById("gigya-password-85118380969228590").value="${process.env.password}";`);
    console.log('password typed');
    await page.evaluate("document.querySelector(\"input[value='Sign In']\").click()");
    console.log('sign in clicked');
    await page.waitForSelector(".scheduleContent");
    console.log('scraping week 1');
    const matchups = {};
    matchups[1] = await getMatchups();
    for (let i = 2; i <= 15; i++) {
        await page.goto(`https://fantasy.nfl.com/league/1697750?scheduleDetail=${i}&scheduleType=week&standingsTab=schedule`);
        await page.waitForSelector(".scheduleContent");
        console.log(`scraping week ${i}`);
        matchups[i] = await getMatchups();
    }
    console.log(matchups);
    await sleep(30000);
    await browser.close();
})();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/*
determine current week
collect schedule and scores
loop through game results up to current week and calculate:
    total score
    wins
    means score
    score standard deviation

run simulation for games that have not been played and aggregate results

*/