// app-shell.js
function buildAppShell(result) {
  const user = result.data; // { username, uid, is_admin, ... }

  const root = document.getElementById("app");
  root.replaceChildren(); // clear

  const loadingSpinner = document.createElement("loading-spinner");
  root.appendChild(loadingSpinner);

  const sidebar = document.createElement("side-bar");
  sidebar.dataset.user = JSON.stringify(user);
  root.appendChild(sidebar);

  const main = document.createElement("main");
  main.classList.add("main-content");

  const leftMenuIcons = [
    {
      id: "treefilter",
      image: "../../assets/icons/funnel.svg",
      tooltip: "Tree Filter",
    },
    {
      id: "search",
      image: "../../assets/icons/magnifier.svg",
      tooltip: "Search",
    },
    {
      id: "options",
      image: "../../assets/icons/cog-wheel.svg",
      tooltip: "More Options",
    },
    {
      id: "reportoptions",
      image: "../../assets/icons/filter.svg",
      tooltip: "Report Options",
    },
  ];
  const rightMenuIcons = [
    {
      id: "specify",
      image: "../../assets/icons/filter.svg",
      tooltip: "Specify",
    },
  ];

  const leftMenu = document.createElement("column-menu");
  leftMenu.dataset.headerText = "NAVIGATION";
  leftMenu.dataset.menuIcons = JSON.stringify(leftMenuIcons);
  main.appendChild(leftMenu);

  const leftSep = document.createElement("vertical-separator");
  leftSep.dataset.position = "left";
  main.appendChild(leftSep);

  const workspace = document.createElement("workspace-area");
  main.appendChild(workspace);

  const rightSep = document.createElement("vertical-separator");
  rightSep.dataset.position = "right";
  main.appendChild(rightSep);

  const rightMenu = document.createElement("column-menu");
  rightMenu.dataset.headerText = "ACTION";
  rightMenu.dataset.menuIcons = JSON.stringify(rightMenuIcons);
  main.appendChild(rightMenu);

  root.appendChild(main);
}

// One-time listener (or keep it global)
document.addEventListener("login-success", (e) => {
  buildAppShell(e.detail);
});
