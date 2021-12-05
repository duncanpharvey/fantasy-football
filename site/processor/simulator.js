const math = require("mathjs");
const randomNormal = require("random-normal");
const { client, collection } = require("./mongo");

class Team {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.scores = [];
        this.currentWins = 0;
        this.rankSummary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
}

async function simulate() {
    await client.connect();

    const teamResults = await collection.find({ "team_id": { "$exists": true } }).toArray();

    const teams = {};
    teamResults.forEach(team => {
        teams[team.team_id] = new Team(team.team_id, team.name);
    });

    // sum wins and scores using matchups to date
    const completedWeeks = await collection.find({ "week": { "$exists": true }, "completed": true }).toArray();
    console.log(`Weeks to summarize: ${completedWeeks.map(x => x.week)}`);
    completedWeeks.forEach(week => {
        week.matchups.forEach(matchup => {
            id1 = matchup.id1;
            score1 = matchup.score1;
            id2 = matchup.id2;
            score2 = matchup.score2;

            teams[id1].scores.push(score1);
            teams[id2].scores.push(score2);

            if (score1 > score2) teams[id1].currentWins += 1;
            else if (score2 > score1) teams[id2].currentWins += 1;
            else {
                teams[id1].currentWins += 0.5;
                teams[id2].currentWins += 0.5;
            }
        });
    });

    // calculate mean and standard deviation for log of points scored for each team to use in simulation
    // weekly point distribution is right skewed (lognormal distribution)
    Object.values(teams).forEach(team => {
        team.currentPoints = math.sum(team.scores);
        const logScores = team.scores.map(x => math.log(x));
        team.mean = math.mean(logScores);
        team.stdDev = math.std(logScores);
    });

    // simulate future matchups x number of times
    const trials = 1000000;
    const weeksToPlay = await collection.find({ "week": { "$exists": true }, "completed": false }).toArray();
    console.log(`Weeks to simulate: ${weeksToPlay.map(x => x.week)}`);
    for (let x = 1; x <= trials; x++) {
        Object.values(teams).forEach(team => {
            // reset team wins and points for the current trial
            team.wins = team.currentWins;
            team.points = team.currentPoints;
        });

        // simulate future games using randomly generated score with mean and standard deviation
        weeksToPlay.forEach(week => {
            week.matchups.forEach(matchup => {
                const team1 = teams[matchup.id1];
                const team2 = teams[matchup.id2];

                const score1 = math.exp(randomNormal({ mean: team1.mean, dev: team1.stdDev }));
                const score2 = math.exp(randomNormal({ mean: team2.mean, dev: team2.stdDev }));

                if (score1 > score2) team1.wins += 1;
                else if (score2 > score1) team2.wins += 1;
                else {
                    team1.wins += 0.5;
                    team2.wins += 0.5;
                }

                team1.points += score1;
                team2.points += score2;
            });
        });

        // sort by descending wins then by descending points
        const sorted = Object.values(teams).sort((a, b) => { return b.wins - a.wins || b.points - a.points });

        // summarize ranks of teams for trial
        for (let i = 0; i < sorted.length; i++) {
            const team = sorted[i];
            team.rankSummary[i] += 1;
        }

        if (x % 10000 == 0) {
            console.log(`completed ${x} trials`);
        }
    }

    // calculate expected rank based on weighting of rank summary to use for sorting graphs
    Object.values(teams).forEach(team => {
        var expectedRank = 0;
        for (let i = 0; i < team.rankSummary.length; i++) {
            expectedRank += (i + 1) * (team.rankSummary[i] / trials);
        }
        team.expectedRank = expectedRank.toFixed(2);
    });

    // convert results to a usable format for the front end
    const results = Object.values(teams).map(team => {
        const ranks = [];
        for (let i = 0; i < team.rankSummary.length; i++) {
            ranks.push({
                "rank": i + 1,
                "pct": team.rankSummary[i] / trials
            });
        }
        return {
            "expected_rank": team.expectedRank,
            "summary_id": team.id,
            "name": team.name,
            "ranks": ranks
        };
    });

    for (let result of results) {
        await collection.updateOne({ "summary_id": result.summary_id }, { $set: result }, { upsert: true });
    };

    client.close();
}

module.exports = {
    simulate: simulate
};
