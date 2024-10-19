//const width = 640;
//const height = 400;
//const marginTop = 20;
//const marginRight = 20;
//const marginBottom = 30;
//const marginLeft = 40;


function Config(width=640) {
    this.width = width;
    this.height = 0.8 * width;
    this.marginTop = 20;
    this.marginRight = 20;
    //this.marginBottom = 30;
    this.marginBottom = this.height / 2;
    this.marginLeft = 40;
    this.x = d3.scaleLinear()
        .range([this.marginLeft, this.width - this.marginRight]);
    this.y = d3.scaleLinear()
        .range([this.height - this.marginBottom, this.marginTop]);
    this.chartId = "chart-real";
    this.component = "real";
}


function plotData(data, cfg, updateScale=false) {

    if (updateScale) {
        cfg.x.domain(d3.extent(data, d => d.ppm).reverse());
        cfg.y.domain(d3.extent(data, d => d.real));
    }

    d3.select(`#${cfg.chartId}`).select("svg").remove();
    const svg = d3.select(`#${cfg.chartId}`).append("svg")
        .attr("width", cfg.width)
        .attr("height", cfg.height);

    // Add the x-axis.
    svg.append("g")
        .attr("transform", `translate(0,${cfg.height - cfg.marginBottom})`)
        .call(d3.axisBottom(cfg.x));

    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "end")
        .attr("x", cfg.width - cfg.marginRight)
        .attr("y", cfg.height - cfg.marginBottom)
        .attr("dy", "13px")
        .text("ppm");

    const line = d3.line()
        .x(d => cfg.x(d.ppm))
        .y(d => cfg.y(d[cfg.component]));

    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2.5)
      .attr("d", line(data));
}

function adjustPhase(data, phase) {
    const phaseScale = d3.scaleLinear([0, 100], [0, Math.PI]);
    const phaseRad = phaseScale(phase);
    document.querySelector("#phaseValue").innerHTML = `${phaseRad.toFixed(2)} rad`;
    const phasedData = data.map(i => rotate(i, phaseRad));
    //plotData(phasedData, cfg, false);
    return phasedData
}

function rotate(item, phase) {
    const cn = math.complex(item.real, item.imag);
    const phaseI = math.multiply(math.complex(0, 1), phase);
    const angle = math.exp(phaseI);
    const out = math.multiply(cn, angle);
    return {"ppm": item.ppm, "real": out.re, "imag": out.im};
}

async function onReady() {

    const data = await d3.json("spectrum.json");
    const cfgReal = new Config();
    const cfgImag = new Config();
    cfgImag.component = "imag";
    cfgImag.chartId = "chart-imag";
    plotData(data, cfgReal, true);
    plotData(data, cfgImag, true);
    const slider = document.querySelector("#phase0");
    slider.addEventListener("input", function(evt) {
        const phasedData = adjustPhase(data, evt.target.value)
        plotData(phasedData, cfgReal, false);
        plotData(phasedData, cfgImag, false);
    });

}

document.addEventListener("DOMContentLoaded", () =>
    onReady()
);
