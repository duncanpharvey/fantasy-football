// Detect if device has touch capability
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Track active bar globally for touch interactions
let globalActiveBar = null;
const globalTooltip = { hide: null };

fetch('./data.json').then(response => response.json())
    .then(data => {
        data.teams.forEach(team => createGraph(team));

        // Hide tooltip on scroll (mobile)
        if (isTouchDevice) {
            let scrollTimeout;
            window.addEventListener('scroll', function() {
                if (globalTooltip.hide) {
                    globalTooltip.hide();
                }
                // Also hide during scroll with debounce
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (globalTooltip.hide) {
                        globalTooltip.hide();
                    }
                }, 150);
            }, { passive: true });
        }
    });

function createGraph(team) {
    const name = team.name;
    const ranks = team.ranks;
    const wins = team.wins || 0;
    const losses = team.scores.length - wins;
    const totalPoints = team.total_points.toFixed(2);

    // Calculate playoff probability (sum of ranks 1-4)
    const playoffProbability = ranks
        .filter(r => r.rank <= 4)
        .reduce((sum, r) => sum + r.pct, 0);
    // Show full precision if it rounds to 0.0 but is actually nonzero
    let playoffPct;
    if (playoffProbability === 0) {
        playoffPct = "0.0";
    } else if ((playoffProbability * 100).toFixed(1) === "0.0") {
        // Show full precision, removing trailing zeros
        playoffPct = (playoffProbability * 100).toFixed(6).replace(/\.?0+$/, '');
    } else {
        playoffPct = (playoffProbability * 100).toFixed(1);
    }

    // Calculate consolation bracket probability (sum of ranks 5-8)
    const consolationProbability = ranks
        .filter(r => r.rank >= 5 && r.rank <= 8)
        .reduce((sum, r) => sum + r.pct, 0);
    const consolationPct = (consolationProbability * 100).toFixed(1);

    // Calculate last place probability (rank 12)
    const lastPlaceProbability = ranks
        .filter(r => r.rank === 12)
        .reduce((sum, r) => sum + r.pct, 0);
    const lastPlacePct = (lastPlaceProbability * 100).toFixed(1);

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

    // Add team header with name and playoff probability
    const header = container.append("div")
        .style("margin-bottom", "16px")
        .style("text-align", "center");

    header.append("div")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("color", "#1a202c")
        .style("margin-bottom", "6px")
        .text(name);

    const badgeContainer = header.append("div")
        .style("display", "flex")
        .style("gap", "8px")
        .style("justify-content", "center")
        .style("flex-wrap", "wrap");

    badgeContainer.append("div")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .style("color", playoffProbability >= 0.5 ? "#10b981" : playoffProbability > 0 ? "#f59e0b" : "#ef4444")
        .style("padding", "4px 12px")
        .style("background", playoffProbability >= 0.5 ? "rgba(16, 185, 129, 0.1)" : playoffProbability > 0 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)")
        .style("border-radius", "12px")
        .style("display", "inline-block")
        .text(`Playoffs: ${playoffPct}%`);

    // Show consolation bracket if probability is meaningful (>5%)
    if (consolationProbability > 0.05) {
        badgeContainer.append("div")
            .style("font-size", "13px")
            .style("font-weight", "600")
            .style("color", "#3b82f6")
            .style("padding", "4px 12px")
            .style("background", "rgba(59, 130, 246, 0.1)")
            .style("border-radius", "12px")
            .style("display", "inline-block")
            .text(`Consolation: ${consolationPct}%`);
    }

    // Show last place if probability is meaningful (>5%)
    if (lastPlaceProbability > 0.05) {
        badgeContainer.append("div")
            .style("font-size", "13px")
            .style("font-weight", "600")
            .style("color", "#ef4444")
            .style("padding", "4px 12px")
            .style("background", "rgba(239, 68, 68, 0.1)")
            .style("border-radius", "12px")
            .style("display", "inline-block")
            .text(`Last Place: ${lastPlacePct}%`);
    }

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
        .attr("transform", `translate(0 ${height})`)
        .call(d3.axisBottom(xScale))
        .style("font-size", "12px")
        .style("color", "#64748b");

    g.append("g")
        .call(d3.axisLeft(yScale)
            .tickFormat(d => { return `${100 * d}%`; })
            .tickValues([0, 0.2, 0.4, 0.6, 0.8, 1.0]))
        .style("font-size", "12px")
        .style("color", "#64748b");

    // Add horizontal gridlines (skip 0 since the axis provides that line)
    // Draw these BEFORE bars so bars appear on top
    const gridGroup = g.append("g")
        .attr("class", "grid");
    
    gridGroup.selectAll("line.gridline")
        .data([0.2, 0.4, 0.6, 0.8, 1.0])
        .enter()
        .append("line")
        .attr("class", "gridline")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .style("stroke", "#cbd5e1")
        .style("stroke-width", "1px")
        .style("stroke-dasharray", "3,3");

    // Function to hide tooltip and reset active bar
    const hideTooltip = function() {
        if (globalActiveBar) {
            d3.select(globalActiveBar).style("opacity", 1);
            globalActiveBar = null;
        }
        tooltip.classed("visible", false);
    };

    // Store hide function globally for scroll handler
    globalTooltip.hide = hideTooltip;

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
        .style("transition", "opacity 0.2s ease");

    if (isTouchDevice) {
        // Touch events for mobile
        bars.on("touchstart", function (event, d) {
            event.preventDefault();
            
            // If tapping a different bar, hide previous tooltip
            if (globalActiveBar && globalActiveBar !== this) {
                d3.select(globalActiveBar).style("opacity", 1);
            }
            
            // If tapping the same bar, hide and return
            if (globalActiveBar === this) {
                hideTooltip();
                return;
            }
            
            // Set new active bar
            globalActiveBar = this;
            d3.select(this).style("opacity", 0.7);
            
            const percentage = (d.pct * 100).toFixed(1);
            
            // Get bar position for tooltip placement
            const barRect = this.getBoundingClientRect();
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
    } else {
        // Desktop hover events
        bars
            .on("mouseover", function (event, d) {
                d3.select(this).style("opacity", 0.7);

                const percentage = (d.pct * 100).toFixed(1);

                tooltip.html(`
                    <div class="tooltip-row">${percentage}%</div>
                `)
                    .classed("visible", true)
                    .style("left", (event.clientX + 10) + "px")
                    .style("top", (event.clientY - 10) + "px")
                    .style("transform", "none");
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", (event.clientX + 10) + "px")
                    .style("top", (event.clientY - 10) + "px");
            })
            .on("mouseout", function (event) {
                d3.select(this).style("opacity", 1);
                tooltip.classed("visible", false);
            });
    }

    function colorPicker(rank) {
        if (rank <= 4) { return "#10b981" }  // Green for playoff spots
        else if (rank >= 9 && rank <= 11) { return "#f59e0b" }  // Orange for danger zone
        else if (rank == 12) { return "#ef4444" }  // Red for last place
        else { return "#3b82f6"; }  // Blue for middle
    }
}
