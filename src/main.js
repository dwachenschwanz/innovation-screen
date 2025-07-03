import Highcharts from "highcharts";
import "./style.css";

let chart;

const vertLinePos = 200;

const rootStyle = getComputedStyle(document.documentElement);
const chartBg = rootStyle.getPropertyValue("--app-background-color").trim();

function renderChart(data, enableZoom = true) {
  const xMin = parseFloat(document.getElementById("xMinInput")?.value);
  const xMax = parseFloat(document.getElementById("xMaxInput")?.value);
  const yMin = parseFloat(document.getElementById("yMinInput")?.value);
  const yMax = parseFloat(document.getElementById("yMaxInput")?.value);

  const scatterData = data.map((entry) => ({
    name: entry["Projects"],
    x: entry["O - NPV Operating Profit"],
    y: entry["O - Overall Probability of Success"],
  }));

  chart = Highcharts.chart("container", {
    chart: {
      type: "scatter",
      backgroundColor: chartBg,
      // height: 300,
      zoomType: enableZoom ? "xy" : "",
      panning: {
        enabled: true,
        type: "xy",
      },
      panKey: "shift", // Hold shift while dragging to pan
    },

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 600,
          },
          chartOptions: {
            legend: { enabled: false },
            dataLabels: { style: { fontSize: "8px" } },
          },
        },
      ],
    },

    title: {
      text: "Overall Probability of Success vs NPV Operating Profit",
    },
    xAxis: {
      title: { text: "NPV Operating Profit ($M)" },
      min: !isNaN(xMin) ? xMin : undefined,
      max: !isNaN(xMax) ? xMax : undefined,

      plotLines: [
        {
          color: "#333", // color of the Y-axis line
          width: 1, // line width
          value: 0, // position on the X-axis (x=0)
          zIndex: 5, // draw on top
          dashStyle: "Solid", // or "Dash", "Dot", etc.
        },
        {
          color: "rgb(104,204,205)", // color of the Y-axis line
          width: 3, // line width
          value: vertLinePos, // position on the X-axis (x=0)
          zIndex: 5, // draw on top
          dashStyle: "Solid", // or "Dash", "Dot", etc.
        },
      ],
    },
    yAxis: {
      title: { text: "Overall Probability of Success" },
      min: 0,
      max: 1,
      tickInterval: 0.1,
      min: !isNaN(yMin) ? yMin : undefined,
      max: !isNaN(yMax) ? yMax : undefined,
      plotLines: [
        {
          color: "rgb(104,204,205)", // line color
          width: 3, // line thickness
          value: 0.5, // y-value to draw the line at
          zIndex: 5,
        },
      ],
    },

    tooltip: {
      useHTML: true,
      headerFormat: "<b>{point.name}</b><br/>",
      pointFormat: `
        <b>NPV:</b> {point.x}M<br/>
        <b>Probability of Success:</b> {point.y}
      `,
    },
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          symbol: "circle",
        },
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          style: {
            fontSize: "9px",
            textOutline: "none",
          },
        },
      },
    },
    series: [
      {
        name: "Projects",
        color: "rgba(0, 123, 255, 0.6)",
        data: scatterData,
      },
    ],
  });
}

fetch("/data.json")
  .then((res) => {
    if (!res.ok) throw new Error("Failed to load data.json");
    return res.json();
  })
  .then((data) => {
    renderChart(data);

    document.getElementById("zoomToggle").addEventListener("change", (e) => {
      const zoomEnabled = e.target.checked;
      renderChart(data, zoomEnabled);
    });
    document
      .getElementById("xMinInput")
      .addEventListener("input", () => renderChart(data));
    document
      .getElementById("xMaxInput")
      .addEventListener("input", () => renderChart(data));

    document
      .getElementById("yMinInput")
      .addEventListener("input", () => renderChart(data));
    document
      .getElementById("yMaxInput")
      .addEventListener("input", () => renderChart(data));
  })
  .catch((err) => console.error("Error:", err));

// window.addEventListener("resize", () => {
//   if (chart) {
//     chart.reflow();
//   }
// });

let resizeTimeout;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    window.location.reload();
  }, 300); // delay to avoid multiple reloads
});
