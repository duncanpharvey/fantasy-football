import asyncio
from dotenv import load_dotenv
import helper
import json
import math
from nfl import Nfl
import os
import statistics


load_dotenv()
COOKIE = os.getenv("COOKIE")
LEAGUE_ID = os.getenv("LEAGUE_ID")


async def main():
    nfl_api = Nfl(LEAGUE_ID, COOKIE)

    teams = await nfl_api.get_teams()

    matchups_by_week = await asyncio.gather(
        *[nfl_api.get_weekly_matchups(week) for week in range(1, 16)]
    )

    matchups_completed = [
        matchup
        for weekly_matchups in matchups_by_week
        for matchup in weekly_matchups
        if matchup["is_completed"]
    ]

    matchups_to_simulate = [
        matchup
        for weekly_matchups in matchups_by_week
        for matchup in weekly_matchups
        if not matchup["is_completed"]
    ]

    for matchup in matchups_completed:
        team_a = teams.get(matchup["id_team_a"])
        team_b = teams.get(matchup["id_team_b"])

        score_team_a = matchup["score_team_a"]
        score_team_b = matchup["score_team_b"]

        team_a.setdefault("scores", []).append(score_team_a)
        team_b.setdefault("scores", []).append(score_team_b)

        if score_team_a > score_team_b:
            team_a["wins"] = team_a.get("wins", 0) + 1
        elif score_team_a < score_team_b:
            team_b["wins"] = team_b.get("wins", 0) + 1
        else:
            team_a["wins"] = team_a.get("wins", 0) + 0.5
            team_b["wins"] = team_b.get("wins", 0) + 0.5

    for team in teams.values():
        scores = team["scores"]
        log_scores = [math.log(score) for score in scores]
        team["mean"] = statistics.mean(log_scores)
        team["stddev"] = statistics.stdev(log_scores)
        team["total_points"] = sum(scores)

    team_ranks_summary = {team_id: [0] * len(teams) for team_id in teams.keys()}
    trials = 1000000
    for trial in range(trials):
        if trial % 100000 == 0:
            print(trial)
        team_ranks = helper.simulate_season(teams, matchups_to_simulate)
        for i in range(len(team_ranks)):
            team_id = team_ranks[i]
            team_ranks_summary[team_id][i] += 1

    for team_id, team_ranks in team_ranks_summary.items():
        team = teams.get(team_id)
        team["ranks"] = [
            {"rank": (i + 1), "pct": (team_ranks[i] / trials)}
            for i in range(len(team_ranks))
        ]
        team["expected_rank"] = round(
            sum([rank["rank"] * rank["pct"] for rank in team["ranks"]]), 2
        )

    with open("data.json", "w") as f:
        json.dump(
            {
                "teams": sorted(
                    list(teams.values()), key=lambda team: team["expected_rank"]
                )
            },
            f,
        )


asyncio.run(main())
