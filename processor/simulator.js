const math = require("mathjs");
const randomNormal = require("random-normal");

class Team {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.scores = [];
        this.currentWins = 0;
        this.rankSummary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
}

const today = new Date();
const week1 = new Date(2021, 8, 7) // Tuesday, 9/14 (2 days before start of week 1)
const weeksCompleted = Math.floor((today - week1) / (1000 * 60 * 60 * 24 * 7));

function simulate(teamDict, weeks) {
    const teams = {};
    for (let key in teamDict) {
        teams[key] = new Team(key, teamDict[key])
    }

    // sum wins and scores using matchups to date
    for (let i = 1; i <= weeksCompleted; i++) {
        const matchups = weeks[i];
        for (const matchup of matchups) {
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
        }
    }

    // calculate mean and standard deviation of points scored for each team to use in simulation
    for (let key in teams) {
        const team = teams[key];
        team.currentPoints = math.sum(team.scores);
        team.mean = math.mean(team.scores);
        team.stdDev = math.std(team.scores);
    }

    // simulate future matchups x number of times
    const trials = 1000000;
    for (let x = 0; x < trials; x++) {
        if (x % 10000 == 0) {
            console.log(`completed ${x} trials`);
        }

        for (let key in teams) {
            const team = teams[key];

            // reset team wins and points for the current trial
            team.wins = team.currentWins;
            team.points = team.currentPoints;
        }

        // simulate future games using randomly generated score with mean and standard deviation
        for (let i = weeksCompleted + 1; i <= 15; i++) {
            games = weeks[i];
            for (const game of games) {
                team1 = teams[game.id1];
                team2 = teams[game.id2];

                score1 = randomNormal({ mean: team1.mean, dev: team1.stdDev });
                score2 = randomNormal({ mean: team2.mean, dev: team2.stdDev });

                if (score1 > score2) team1.wins += 1;
                else if (score2 > score1) team2.wins += 1;
                else {
                    team1.wins += 0.5;
                    team2.wins += 0.5;
                }

                team1.points += score1;
                team2.points += score2;
            }
        }

        // sort by descending wins then by descending points
        const sorted = Object.values(teams).sort((a, b) => { return b.wins - a.wins || b.points - a.points });

        // summarize ranks of teams for trial
        for (let i = 0; i < sorted.length; i++) {
            const team = sorted[i];
            team.rankSummary[i] += 1;
        }
    }

    // calculate expected rank based on weighting of rank summary to use for sorting graphs
    for (let key in teams) {
        const team = teams[key];
        var expectedRank = 0;
        for (let i = 0; i < team.rankSummary.length; i++) {
            expectedRank += (i + 1) * (team.rankSummary[i] / trials);
        }
        team.expectedRank = expectedRank.toFixed(2);
    }

    // convert results to a usable format for the front end
    const results = Object.values(teams).sort((a, b) => { return a.expectedRank - b.expectedRank }).map(team => {
        const ranks = [];
        for (let i = 0; i < team.rankSummary.length; i++) {
            ranks.push({
                "rank": i + 1,
                "pct": team.rankSummary[i] / trials
            });
        }
        return {
            "id": team.id,
            "name": team.name,
            "ranks": ranks
        };
    });

    return results;
}

module.exports = {
    simulate: simulate
}
