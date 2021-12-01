### Application to simulate the outcome of the fantasy football regular season

1. Scrape matchups and scores to date from fantasy.nfl.com
2. Summarize wins and points to date for each team
3. Calculate mean and standard deviation of the natural log of each team's scores
    - Weekly score distribution has right skew so data is fitted to a [log-normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution)
4. Simulate the remaining games of the season by generating random scores based on the log-normal distributions for each team
5. Summarize the outcome of each trial
6. Generate visualization of expected results for each team
