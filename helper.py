import math
from numpy import random


def simulate_season(teams, matchups):
    trial_teams = {
        team["id"]: {
            "id": team["id"],
            "wins": team["wins"],
            "total_points": team["total_points"],
            "mean": team["mean"],
            "stddev": team["stddev"],
        }
        for team in teams.values()
    }
    for matchup in matchups:
        team_a = trial_teams.get(matchup["id_team_a"])
        team_b = trial_teams.get(matchup["id_team_b"])

        score_team_a = math.exp(random.normal(team_a["mean"], team_a["stddev"]))
        score_team_b = math.exp(random.normal(team_b["mean"], team_b["stddev"]))

        team_a["total_points"] += score_team_a
        team_b["total_points"] += score_team_b

        if score_team_a > score_team_b:
            team_a["wins"] = team_a.get("wins", 0) + 1
        elif score_team_a < score_team_b:
            team_b["wins"] = team_b.get("wins", 0) + 1
        else:
            team_a["wins"] = team_a.get("wins", 0) + 0.5
            team_b["wins"] = team_b.get("wins", 0) + 0.5

    return [
        team["id"]
        for team in sorted(
            [team for team in trial_teams.values()],
            key=lambda team: (team["wins"], team["total_points"]),
            reverse=True,
        )
    ]
