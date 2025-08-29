import Highcharts from "highcharts";
import "./style.css";
import "primeicons/primeicons.css";

import "./components/vertical-separator.js";
import "./components/login-form.js";
import { smartorg } from "./utils/smartorg.js";
import { auth } from "./utils/auth.js";

let chart;

const vertLinePos = 200;

const rootStyle = getComputedStyle(document.documentElement);
const chartBg = rootStyle.getPropertyValue("--app-background-color").trim();

// document.addEventListener("DOMContentLoaded", () => {
//   const separator = document.querySelector(
//     "vertical-separator[direction='left']"
//   );
//   const nearestColumnDiv = findClosestColumnHeaderDiv(separator);

//   if (nearestColumnDiv) {
//     console.log("Closest div with .column-header:", nearestColumnDiv);
//     nearestColumnDiv.classList.toggle("collapsed");
//   } else {
//     console.log("No matching div found.");
//   }
// });

document.addEventListener("DOMContentLoaded", async () => {
  // One-time listener (or keep it global)
  document.addEventListener("login-success", (e) => {
    console.log("login-sucess");
  });
  // const username = "Dave";
  // const password = "B!tterr00t";

  // const credentials = { username, password };
  // console.log("credentials: ", credentials);

  // try {
  //   const result = await smartorg.getToken(credentials);
  //   auth.setSession({ token: result.token, user: result.data });

  //   if (auth.isAuthenticated()) {
  //     const user = auth.getUser(); // ← your saved `data` object
  //     console.log("Hello,", user.username);
  //   }

  //   console.log(result);
  // } catch (error) {
  //   // Handle network or other errors
  //   console.log(`Error: ${error.message}`);
  //   if (JSON.parse(error.message).message === "AUTHENTICATION_FAILED") {
  //     errorText.innerText = "Username or password does not match our record!";
  //     console.log("authentication failed");
  //   }
  //   console.log(error);
  //   console.log(error.message);
  // }

  const allSeparators = document.querySelectorAll("vertical-separator");

  allSeparators.forEach((separator) => {
    separator.addEventListener("separator-toggle", (event) => {
      const toggled = event.detail.toggled;
      const nearestColumnDiv = findClosestColumnHeaderDiv(separator);

      if (nearestColumnDiv) {
        console.log("Toggling .collapsed on:", nearestColumnDiv.id);

        console.log(
          "Before:",
          nearestColumnDiv.classList.contains("collapsed")
        );
        // nearestColumnDiv.classList.toggle("collapsed", toggled);
        document
          .getElementById(nearestColumnDiv.id)
          .classList.toggle("collapsed");
        console.log("After:", nearestColumnDiv.classList.contains("collapsed"));
      } else {
        console.warn("No panel found near separator.");
      }
    });
  });
});

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
      text: "Innovation Screen",
    },
    xAxis: {
      title: {
        text: "NPV Operating Profit ($M)",
        style: {
          fontWeight: "bold",
        },
      },
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
      title: {
        text: "Overall Probability of Success",
        style: {
          fontWeight: "bold",
        },
      },
      min: 0,
      max: 1,
      tickInterval: 0.1,
      min: !isNaN(yMin) ? yMin : undefined,
      max: !isNaN(yMax) ? yMax : 1,
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
      enabled: false,
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
          allowOverlap: false,
          // crop: false,
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

fetch("data.json")
  .then((res) => {
    if (!res.ok) throw new Error("Failed to load data.json");
    return res.json();
  })
  .then((data) => {
    renderChart(data);

    // document.getElementById("zoomToggle").addEventListener("change", (e) => {
    //   const zoomEnabled = e.target.checked;
    //   renderChart(data, zoomEnabled);
    // });
    // document
    //   .getElementById("xMinInput")
    //   .addEventListener("input", () => renderChart(data));
    // document
    //   .getElementById("xMaxInput")
    //   .addEventListener("input", () => renderChart(data));

    // document
    //   .getElementById("yMinInput")
    //   .addEventListener("input", () => renderChart(data));
    // document
    //   .getElementById("yMaxInput")
    //   .addEventListener("input", () => renderChart(data));
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

// function findClosestColumnHeaderDiv(separatorElement) {
//   if (!separatorElement) return null;

//   // Step 1: Get all siblings of the separator’s parent
//   const parent = separatorElement.parentElement;
//   if (!parent) return null;

//   const siblings = Array.from(parent.children);
//   const separatorIndex = siblings.indexOf(separatorElement);

//   // Step 2: Check neighbors in both directions
//   const directions = [-1, 1]; // left and right
//   for (const dir of directions) {
//     let i = separatorIndex + dir;
//     while (i >= 0 && i < siblings.length) {
//       const el = siblings[i];
//       if (el.tagName === "DIV" && el.querySelector(".column-header")) {
//         return el;
//       }
//       i += dir;
//     }
//   }

//   return null; // not found
// }

// function findClosestColumnHeaderDiv(separatorElement) {
//   if (!separatorElement) return null;

//   const parent = separatorElement.parentElement;
//   if (!parent) return null;

//   const siblings = Array.from(parent.children);
//   const separatorIndex = siblings.indexOf(separatorElement);

//   const directions = [-1, 1]; // search left and right
//   for (const dir of directions) {
//     let i = separatorIndex + dir;
//     while (i >= 0 && i < siblings.length) {
//       const el = siblings[i];
//       if (el.querySelector && el.querySelector(".column-header")) {
//         return el;
//       }
//       i += dir;
//     }
//   }

//   return null;
// }

// function findClosestColumnHeaderDiv(separatorElement) {
//   if (!separatorElement) return null;

//   let panelBefore = separatorElement.previousElementSibling;
//   let panelAfter = separatorElement.nextElementSibling;

//   console.log(panelBefore);
//   console.log(panelAfter);
//   // while (panel && !panel.querySelector(".column-header")) {
//   //   panel = panel.nextElementSibling;
//   // }
// }

// function findClosestColumnHeaderDiv(separatorElement) {
//   if (!separatorElement) return;

//   const directions = ["previousElementSibling", "nextElementSibling"];

//   for (const dir of directions) {
//     const panel = separatorElement[dir];
//     if (panel && panel.querySelector && panel.querySelector(".column-header")) {
//       panel.classList.toggle("collapsed");
//       return panel; // return the toggled panel (optional)
//     }
//   }

//   // If neither side matches
//   console.warn("No adjacent panel with .column-header found.");
// }

function findClosestColumnHeaderDiv(separatorElement) {
  if (!separatorElement) return null;

  const prev = separatorElement.previousElementSibling;
  const next = separatorElement.nextElementSibling;

  if (prev && prev.querySelector && prev.querySelector(".column-header")) {
    return prev;
  }

  if (next && next.querySelector && next.querySelector(".column-header")) {
    return next;
  }

  return null;
}
