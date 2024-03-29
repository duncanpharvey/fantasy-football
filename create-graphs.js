fetch('../data.json').then(response => response.json())
    .then(data => {
        data.teams.forEach(team => createGraph(team));
    });

function createGraph(team) {
    const name = team.name;
    const ranks = team.ranks;

    // graph dimensions
    const width = 300;
    const height = 180;
    const hMargin = 60;
    const vMargin = 36;

    const svg = d3.select("#graph-container")
        .append("div")
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width + hMargin} ${height + vMargin}`)
        .classed("svg-content-responsive", true)

    // graph title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(200, 18)")
        .attr("font-size", "16px")
        .text(name);

    // graph axes
    const xScale = d3.scaleBand().range([0, width]).padding(0.4);
    const yScale = d3.scaleLinear().range([height, 0]);

    const g = svg.append("g")
        .attr("transform", "translate(" + 0.65 * hMargin + "," + 0.3 * vMargin + ")");

    xScale.domain(ranks.map(d => { return d.rank; }));
    yScale.domain([0, 1]);

    g.append("g")
        .attr("transform", `translate(0 ${height + 0.5})`)
        .call(d3.axisBottom(xScale));

    g.append("g")
        .attr("transform", `translate(0 0.5)`)
        .call(d3.axisLeft(yScale)
            .tickFormat(d => { return `${100 * d}%`; })
            .ticks(5));

    // bars representing data values
    g.selectAll(".bar")
        .data(ranks)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => { return xScale(d.rank); })
        .attr("y", d => { return yScale(d.pct); })
        .attr("width", xScale.bandwidth())
        .attr("height", d => { return height - yScale(d.pct); })
        .attr("fill", d => { return colorPicker(d.rank); });

    function colorPicker(rank) {
        if (rank <= 4) { return "#32A852" }
        else if (rank >= 9 && rank <= 11) {return "#F08000"}
        else if (rank == 12) { return "#C4141A" }
        else { return "#323CA8"; }
    }
}
