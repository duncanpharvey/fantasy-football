fetch(`${window.location.href}data`).then(response => response.json())
    .then(data => {
        data.sort((a, b) => { return a.expected_rank - b.expected_rank }).forEach(team => createGraph(team));
    });

function createGraph(team) {
    const name = team.name;
    const ranks = team.ranks;

    // graph dimensions
    const width = 300;
    const height = 180;
    const hMargin = 60;
    const vMargin = 36

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
        .attr("transform", "translate(" + 0.6 * hMargin + "," + 0.5 * vMargin + ")");

    xScale.domain(ranks.map(d => { return d.rank; }));
    yScale.domain([0, 1]);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    g.append("g")
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
        if (rank <= 4) { return "#32a852" }
        else if (rank == 12) { return "#c4141a" }
        else { return "#323ca8"; }
    }
}
