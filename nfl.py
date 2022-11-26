import httpx
from bs4 import BeautifulSoup


class Nfl:
    def __init__(self, league_id, cookie):
        self.client = httpx.AsyncClient()
        self.cookie = cookie
        self.league_id = league_id

    async def get_teams(self):
        print("Getting teams")
        params = {"standingsTab": "standings", "standingsType": "overall"}
        response = await self.client.get(
            url=f"https://fantasy.nfl.com/league/{self.league_id}",
            params=params,
            headers={
                "Ajax-Request": "leagueHomeStandings",
                "Cookie": self.cookie
                + " s_pv=nfl%20fantasy%3Aleague%3Ahome%3Astandings%3Aoverall;",
            },
        )

        response_body = response.json()
        content = response_body.get("content")

        soup = BeautifulSoup(content, features="html.parser")
        teams = {
            next(
                class_name.replace("teamId-", "")
                for class_name in element.get("class")
                if class_name.startswith("teamId")
            ): {
                "id": next(
                    class_name.replace("teamId-", "")
                    for class_name in element.get("class")
                    if class_name.startswith("teamId")
                ),
                "name": element.string,
            }
            for element in soup.select("tbody > tr .teamName")
        }
        return teams

    async def get_weekly_matchups(self, week):
        print(f"Getting matchups for week {week}")
        params = {"scoreStripType": "fantasy", "week": week}
        response = await self.client.get(
            url=f"https://fantasy.nfl.com/league/{self.league_id}",
            params=params,
            headers={
                "Ajax-Request": "leagueHomeScoreStrip",
                "Cookie": self.cookie
                + " s_pv=nfl%20fantasy%3Aleague%3Ahome%3Alanding;",
            },
        )

        response_body = response.json()
        content = response_body.get("content")
        soup = BeautifulSoup(content, features="html.parser")
        weekly_matchups = [
            {
                "id_team_a": next(
                    class_name.replace("teamId-", "")
                    for class_name in next(
                        iter(element.select("div.first .teamTotal"))
                    ).get("class")
                    if class_name.startswith("teamId")
                ),
                "id_team_b": next(
                    class_name.replace("teamId-", "")
                    for class_name in next(
                        iter(element.select("div.last .teamTotal"))
                    ).get("class")
                    if class_name.startswith("teamId")
                ),
                "is_completed": "final" in element.get("class", []),
                "score_team_a": float(
                    next(iter(element.select("div.first .teamTotal"))).string
                ),
                "score_team_b": float(
                    next(iter(element.select("div.last .teamTotal"))).string
                ),
            }
            for element in soup.select(".teamNav li")
        ]
        return weekly_matchups
