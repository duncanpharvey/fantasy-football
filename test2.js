const math = require('mathjs');
const randomNormal = require('random-normal');

class Team {
    constructor(id) {
        this.id = id;
        this.scores = [];
        this.currentWins = 0;
        this.rankSummary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
}

const today = new Date();
const week1 = new Date(2021, 8, 7) // Tuesday, 9/14 (2 days before start of week 1)

const weeksCompleted = Math.floor((today - week1) / (1000 * 60 * 60 * 24 * 7));
console.log(weeksCompleted);

const weeks = {
    '1': [
        { id1: 2, score1: 78.58, id2: 1, score2: 90.32 },
        { id1: 3, score1: 101.1, id2: 13, score2: 95.36 },
        { id1: 4, score1: 91.82, id2: 12, score2: 73.5 },
        { id1: 5, score1: 79.68, id2: 11, score2: 116.46 },
        { id1: 6, score1: 100.22, id2: 10, score2: 114.44 },
        { id1: 7, score1: 92.36, id2: 8, score2: 73.44 }
    ],
    '2': [
        { id1: 2, score1: 124.28, id2: 4, score2: 92.58 },
        { id1: 3, score1: 74.76, id2: 1, score2: 86.6 },
        { id1: 13, score1: 123.54, id2: 5, score2: 110.72 },
        { id1: 12, score1: 65.96, id2: 6, score2: 101.92 },
        { id1: 11, score1: 100.9, id2: 7, score2: 67.92 },
        { id1: 10, score1: 121.24, id2: 8, score2: 86.62 }
    ],
    '3': [
        { id1: 2, score1: 74.78, id2: 6, score2: 99.2 },
        { id1: 1, score1: 74.94, id2: 4, score2: 82.72 },
        { id1: 5, score1: 95.34, id2: 3, score2: 69.08 },
        { id1: 7, score1: 61.82, id2: 13, score2: 96.94 },
        { id1: 8, score1: 126.82, id2: 12, score2: 126.32 },
        { id1: 10, score1: 105.04, id2: 11, score2: 80.94 }
    ],
    '4': [
        { id1: 2, score1: 90.42, id2: 8, score2: 92.9 },
        { id1: 5, score1: 116.28, id2: 1, score2: 90.42 },
        { id1: 4, score1: 101.54, id2: 6, score2: 116.22 },
        { id1: 3, score1: 77.64, id2: 7, score2: 112.46 },
        { id1: 13, score1: 76.26, id2: 10, score2: 88.32 },
        { id1: 12, score1: 58.82, id2: 11, score2: 67.92 }
    ],
    '5': [
        { id1: 2, score1: 109.28, id2: 11, score2: 55.66 },
        { id1: 1, score1: 80.66, id2: 6, score2: 140.18 },
        { id1: 7, score1: 121.88, id2: 5, score2: 133.22 },
        { id1: 8, score1: 86.1, id2: 4, score2: 90.18 },
        { id1: 10, score1: 121.32, id2: 3, score2: 134.28 },
        { id1: 12, score1: 128.1, id2: 13, score2: 86.34 }
    ],
    '6': [
        { id1: 2, score1: 79.74, id2: 13, score2: 87.28 },
        { id1: 7, score1: 125.54, id2: 1, score2: 136.6 },
        { id1: 6, score1: 106.38, id2: 8, score2: 88.04 },
        { id1: 5, score1: 97.7, id2: 10, score2: 83.02 },
        { id1: 4, score1: 86.7, id2: 11, score2: 91.36 },
        { id1: 3, score1: 91.18, id2: 12, score2: 92.02 }
    ],
    '7': [
        { id1: 2, score1: 91.2, id2: 3, score2: 113.18 },
        { id1: 1, score1: 71.96, id2: 8, score2: 120.76 },
        { id1: 10, score1: 43.98, id2: 7, score2: 116.04 },
        { id1: 11, score1: 82.94, id2: 6, score2: 110.24 },
        { id1: 12, score1: 119.64, id2: 5, score2: 82.8 },
        { id1: 13, score1: 104.54, id2: 4, score2: 115.02 }
    ],
    '8': [
        { id1: 2, score1: 63.1, id2: 5, score2: 80.62 },
        { id1: 10, score1: 64.26, id2: 1, score2: 93.46 },
        { id1: 8, score1: 83.3, id2: 11, score2: 69.56 },
        { id1: 7, score1: 111.66, id2: 12, score2: 101.36 },
        { id1: 6, score1: 81.9, id2: 13, score2: 89.02 },
        { id1: 4, score1: 83.3, id2: 3, score2: 68.28 }
    ],
    '9': [
        { id1: 2, score1: 88.52, id2: 7, score2: 104.38 },
        { id1: 1, score1: 68.36, id2: 11, score2: 85.9 },
        { id1: 12, score1: 59.86, id2: 10, score2: 73.78 },
        { id1: 13, score1: 69.08, id2: 8, score2: 64.16 },
        { id1: 3, score1: 95.64, id2: 6, score2: 75.54 },
        { id1: 4, score1: 99.48, id2: 5, score2: 69.14 }
    ],
    '10': [
        { id1: 2, score1: 95.62, id2: 10, score2: 64.96 },
        { id1: 12, score1: 88.54, id2: 1, score2: 94.48 },
        { id1: 11, score1: 62.36, id2: 13, score2: 65.1 },
        { id1: 8, score1: 101.56, id2: 3, score2: 73.02 },
        { id1: 7, score1: 80.78, id2: 4, score2: 78.14 },
        { id1: 6, score1: 116.64, id2: 5, score2: 46.8 }
    ],
    '11': [
        { id1: 2, score1: 0, id2: 12, score2: 0 },
        { id1: 1, score1: 0, id2: 13, score2: 0 },
        { id1: 3, score1: 0, id2: 11, score2: 0 },
        { id1: 4, score1: 0, id2: 10, score2: 0 },
        { id1: 5, score1: 0, id2: 8, score2: 0 },
        { id1: 6, score1: 0, id2: 7, score2: 0 }
    ],
    '12': [
        { id1: 2, score1: 0, id2: 1, score2: 0 },
        { id1: 13, score1: 0, id2: 3, score2: 0 },
        { id1: 12, score1: 0, id2: 4, score2: 0 },
        { id1: 11, score1: 0, id2: 5, score2: 0 },
        { id1: 10, score1: 0, id2: 6, score2: 0 },
        { id1: 8, score1: 0, id2: 7, score2: 0 }
    ],
    '13': [
        { id1: 2, score1: 0, id2: 4, score2: 0 },
        { id1: 1, score1: 0, id2: 3, score2: 0 },
        { id1: 5, score1: 0, id2: 13, score2: 0 },
        { id1: 6, score1: 0, id2: 12, score2: 0 },
        { id1: 7, score1: 0, id2: 11, score2: 0 },
        { id1: 8, score1: 0, id2: 10, score2: 0 }
    ],
    '14': [
        { id1: 2, score1: 0, id2: 6, score2: 0 },
        { id1: 4, score1: 0, id2: 1, score2: 0 },
        { id1: 3, score1: 0, id2: 5, score2: 0 },
        { id1: 13, score1: 0, id2: 7, score2: 0 },
        { id1: 12, score1: 0, id2: 8, score2: 0 },
        { id1: 11, score1: 0, id2: 10, score2: 0 }
    ],
    '15': [
        { id1: 2, score1: 0, id2: 8, score2: 0 },
        { id1: 1, score1: 0, id2: 5, score2: 0 },
        { id1: 6, score1: 0, id2: 4, score2: 0 },
        { id1: 7, score1: 0, id2: 3, score2: 0 },
        { id1: 10, score1: 0, id2: 13, score2: 0 },
        { id1: 11, score1: 0, id2: 12, score2: 0 }
    ]
}

var teams = {};

// matchups to date
for (let i = 1; i <= weeksCompleted; i++) {
    const matchups = weeks[i];
    for (const matchup of matchups) {
        id1 = matchup.id1;
        score1 = matchup.score1;
        id2 = matchup.id2;
        score2 = matchup.score2;

        if (!teams.hasOwnProperty(id1)) teams[id1] = new Team(id1); // can remove after scraping team names and id's
        if (!teams.hasOwnProperty(id2)) teams[id2] = new Team(id2);

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

for (const key in teams) {
    const team = teams[key];
    team.currentPoints = math.sum(team.scores);
    team.mean = math.mean(team.scores);
    team.stdDev = math.std(team.scores);
}

// matchups to be played

const trials = 1000000;

for (let x = 0; x < trials; x++) {
    for (const key in teams) {
        const team = teams[key];
        team.wins = team.currentWins;
        team.points = team.currentPoints;
    }
    
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

    const sorted = Object.values(teams).sort((a, b) => { return b.wins - a.wins || b.points - a.points });

    for (let i = 0; i < sorted.length; i++) {
        const team = sorted[i];
        team.rankSummary[i] += 1;
    }
}

for (const key in teams) {
    const team = teams[key];
    var expectedRank = 0;
    for (let i = 0; i < team.rankSummary.length; i++) {
        expectedRank += (i + 1) * (team.rankSummary[i] / trials);
    }
    team.expectedRank = expectedRank.toFixed(2);
}

const results = Object.values(teams).sort((a, b) => { return b.expectedRank - a.expectedRank });

console.log(results);