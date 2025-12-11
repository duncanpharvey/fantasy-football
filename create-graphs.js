fetch('./data.json').then(response => response.json())
    .then(data => {
        data.teams.forEach(team => createGraph(team));
    });

function createGraph(team) {
    const name = team.name;
    const ranks = team.ranks;
    const wins = team.wins || 0;
    const losses = team.scores.length - wins;
    const totalPoints = team.total_points.toFixed(2);

    // graph dimensions
    const width = 300;
    const height = 180;
    const hMargin = 60;
    const vMargin = 36;

    // Tooltip selection
    const tooltip = d3.select(".tooltip");

    const container = d3.select("#graph-container")
        .append("div")
        .classed("svg-container", true);
    
    // Add team name as HTML title
    container.append("div")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("color", "#1a202c")
        .style("margin-bottom", "16px")
        .style("text-align", "center")
        .text(name);
    
    const svg = container.append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width + hMargin} ${height + vMargin}`)
        .classed("svg-content-responsive", true);

    // graph axes
    const xScale = d3.scaleBand().range([0, width]).padding(0.4);
    const yScale = d3.scaleLinear().range([height, 0]);

    const g = svg.append("g")
        .attr("transform", "translate(" + 0.65 * hMargin + "," + 0.3 * vMargin + ")");

    xScale.domain(ranks.map(d => { return d.rank; }));
    yScale.domain([0, 1]);

    g.append("g")
        .attr("transform", `translate(0 ${height + 0.5})`)
        .call(d3.axisBottom(xScale))
        .style("font-size", "12px")
        .style("color", "#64748b");

    g.append("g")
        .attr("transform", `translate(0 0.5)`)
        .call(d3.axisLeft(yScale)
            .tickFormat(d => { return `${100 * d}%`; })
            .ticks(5))
        .style("font-size", "12px")
        .style("color", "#64748b");

    // Track active bar for touch events
    let activeBar = null;

    // bars representing data values
    const bars = g.selectAll(".bar")
        .data(ranks)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => { return xScale(d.rank); })
        .attr("y", d => { return yScale(d.pct); })
        .attr("width", xScale.bandwidth())
        .attr("height", d => { return height - yScale(d.pct); })
        .attr("fill", d => { return colorPicker(d.rank); })
        .attr("rx", 4)
        .attr("ry", 4)
        .style("cursor", "pointer")
        .style("transition", "opacity 0.2s ease")
        // Desktop hover events
        .on("mouseover", function(event, d) {
            // Don't trigger on touch devices
            if (event.sourceEvent && event.sourceEvent.type.startsWith('touch')) return;
            
            d3.select(this).style("opacity", 0.7);
            
            const percentage = (d.pct * 100).toFixed(2);
            
            tooltip.html(`
                <div class="tooltip-row">${percentage}%</div>
            `)
            .classed("visible", true)
            .style("left", (event.clientX + 10) + "px")
            .style("top", (event.clientY - 10) + "px")
            .style("transform", "none");
        })
        .on("mousemove", function(event) {
            if (event.sourceEvent && event.sourceEvent.type.startsWith('touch')) return;
            
            tooltip
                .style("left", (event.clientX + 10) + "px")
                .style("top", (event.clientY - 10) + "px");
        })
        .on("mouseout", function(event) {
            if (event.sourceEvent && event.sourceEvent.type.startsWith('touch')) return;
            
            d3.select(this).style("opacity", 1);
            tooltip.classed("visible", false);
        })
        // Touch events for mobile
        .on("touchstart", function(event, d) {
            event.preventDefault(); // Prevent mouse events from firing
            
            // If tapping the same bar, hide tooltip
            if (activeBar === this) {
                d3.select(this).style("opacity", 1);
                tooltip.classed("visible", false);
                activeBar = null;
                return;
            }
            
            // Reset previous active bar
            if (activeBar) {
                d3.select(activeBar).style("opacity", 1);
            }
            
            // Set new active bar
            activeBar = this;
            d3.select(this).style("opacity", 0.7);
            
            const percentage = (d.pct * 100).toFixed(2);
            
            // Get bar position for tooltip placement
            const barElement = this;
            const barRect = barElement.getBoundingClientRect();
            const tooltipX = barRect.left + (barRect.width / 2);
            const tooltipY = barRect.top - 10;
            
            tooltip.html(`
                <div class="tooltip-row">${percentage}%</div>
            `)
            .classed("visible", true)
            .style("left", tooltipX + "px")
            .style("top", tooltipY + "px")
            .style("transform", "translate(-50%, -100%)");
        });
    
    // Close tooltip when tapping outside on mobile
    if ('ontouchstart' in window) {
        d3.select('body').on('touchstart.tooltip', function(event) {
            // Check if tap is outside any bar
            const target = event.target;
            const isBar = target.classList.contains('bar');
            
            if (!isBar && activeBar) {
                d3.select(activeBar).style("opacity", 1);
                tooltip.classed("visible", false);
                activeBar = null;
            }
        });
    }

    function colorPicker(rank) {
        if (rank <= 4) { return "#10b981" }  // Green for playoff spots
        else if (rank >= 9 && rank <= 11) { return "#f59e0b" }  // Orange for danger zone
        else if (rank == 12) { return "#ef4444" }  // Red for last place
        else { return "#3b82f6"; }  // Blue for middle
    }
}
