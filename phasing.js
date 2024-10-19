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


function degToRad(deg) { return deg * math.pi / 180 };
function radToDeg(rad) { return rad * 180 / math.pi };

function phaseData(data, phases) {
    const phase0Scale = d3.scaleLinear([0, 100], [0, Math.PI]);
    const phase1Scale = d3.scaleLinear([0, 100], [0, Math.PI]);
    const phasesRad = {"ph0": phase0Scale(phases.ph0), "ph1": phase1Scale(phases.ph1)};
    console.log(phasesRad);
    document.querySelector("#phase0Value").innerHTML = `${phasesRad.ph0.toFixed(2)} rad`;
    document.querySelector("#phase1Value").innerHTML = `${phasesRad.ph1.toFixed(2)} rad/ppm`;
    const phasedData0 = data.map(d => rotate(d, phasesRad.ph0));
    const ph1Angles = data.map(d => phasesRad.ph1 * d.ppm);
    const out = phasedData0.map((d, i) => rotate(d, ph1Angles[i]));
    //plotData(phasedData, cfg, false);
    return out;
}

function rotate(item, phase) {
    const cn = math.complex(item.real, item.imag);
    const phaseI = math.multiply(math.complex(0, 1), phase);
    const angle = math.exp(phaseI);
    const out = math.multiply(cn, angle);
    return {"ppm": item.ppm, "real": out.re, "imag": out.im};
}


function getPhaseInputs() {
    const p0 = document.querySelector("#phase0");
    const p1 = document.querySelector("#phase1");
    return {"ph0": p0.value, "ph1": p1.value};
}


function update(data, cfgReal, cfgImag) {
    const phases = getPhaseInputs();
    const phasedData = phaseData(data, phases);
    plotData(phasedData, cfgReal, false);
    plotData(phasedData, cfgImag, false);
}

async function onReady() {

    const data = await d3.json("spectrum.json");
    const cfgReal = new Config();
    const cfgImag = new Config();
    cfgImag.component = "imag";
    cfgImag.chartId = "chart-imag";
    plotData(data, cfgReal, true);
    plotData(data, cfgImag, true);
    document.querySelectorAll(".slider").forEach(slider => {
        slider.addEventListener("input", function(evt) {
            update(data, cfgReal, cfgImag);
        });
    });
}

document.addEventListener("DOMContentLoaded", () =>
    onReady()
);
