import { smartorg } from "../utils/smartorg.js";
import { appState, actions } from "../state/appState.js";
import brandUrl from "../assets/images/smartorg-logo.png?url";
import wrenchUrl from "../assets/images/wrench.svg?url";
import portfolioUrl from "../assets/images/portfolio.svg?url";

export class SideBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._unsub = null;
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  // Lifecycle methods
  async connectedCallback() {
    this.shadowRoot.innerHTML = this.render();
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    document.addEventListener("click", this.handleOutsideClick);

    // Keep user info in sync with state
    const setUser = (user) => {
      // const name = user?.username || user?.email || "";
      // const initial = (name || "?").slice(0, 1).toUpperCase();
      // this.$(".circle").textContent = initial;
      // this.$(".text-user").textContent = name;

      const displayName =
        (user?.name && user.name.trim()) ||
        [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
        user?.username ||
        user?.email ||
        "";
      const initial = (displayName || "?").slice(0, 1).toUpperCase();

      console.log("displayName", displayName);
      console.log("initial: ", initial);
      this.$(".circle").textContent = initial;
      this.$(".text-user").textContent = displayName;
    };

    setUser(appState.get().user);
    this._unsub = appState.subscribe(
      (s) => s.user,
      (next) => setUser(next)
    );

    // Get all anchor tags on the page
    const anchorTags = this.shadowRoot.querySelectorAll("a");

    // Add a click event listener to each anchor tag
    anchorTags.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        // Prevent the default behavior of the anchor tag (i.e., navigating to the link)
        event.preventDefault();
        // event.stopPropagation();

        // Get the href attribute of the clicked anchor tag
        const href = anchor.getAttribute("href");
        console.log("href: ", href);

        const parent = anchor.parentElement;
        const closestSiblingWithId = parent.querySelector("[id]");

        if (closestSiblingWithId) {
          const showCurrentState =
            closestSiblingWithId.classList.contains("show");
          console.log(
            "closest: ",
            closestSiblingWithId,
            closestSiblingWithId.classList.contains("show")
          );

          this.shadowRoot
            .querySelectorAll(".show")
            .forEach((el) => el.classList.remove("show"));

          if (href === "#messages") {
            const dialog = this.shadowRoot.querySelector("dialog");
            const closeButton = this.shadowRoot.getElementById("closeDialog");

            closeButton.addEventListener("click", () => dialog.close());

            dialog.showModal();
            return;
          }

          if (showCurrentState) closestSiblingWithId.classList.remove("show");
          else closestSiblingWithId.classList.add("show");
        }

        console.log("Anchor tag clicked:", href);
      });
    });

    // Add click listener on the whole document
    document.addEventListener("click", this.handleOutsideClick);
  }

  disconnectedCallback() {
    this._unsub?.();
    document.removeEventListener("click", this.handleOutsideClick);
  }

  // render() {
  //   return /*html*/ `
  //      <style>
  //       nav{
  //           height: 100%;
  //           width: 65px;
  //           background-color: var(--app-sidebar-color);
  //           color: white;
  //           display: flex;
  //           flex-direction: column;
  //           align-items: center;
  //           padding: 10px;
  //       }

  //       nav img {
  //           max-width: 97%;
  //           margin: 0;
  //           padding:0;
  //           margin-bottom: 13px;
  //       }
  //       img {
  //           overflow-clip-margin: content-box;
  //           overflow: clip;
  //       }
  //      </style>
  //      <body>
  //       <nav>
  //           <div class="brandIcon">
  //               <img src="../assets/images/smartorg-logo.png" alt="" class="brand" title="Go Full Screen" >
  //               <img class="logo" src="${brandUrl}" alt="SmartOrg" />
  //           </div>
  //       </nav>

  //      </body>

  //   `;
  // }
  handleOutsideClick(event) {
    // Check if the click was outside the web component's shadow DOM
    if (!this.contains(event.target)) {
      const visibleDropDown = this.shadowRoot.querySelector(".show");

      if (visibleDropDown) visibleDropDown.classList.remove("show"); // Hide dropdown if clicked outside
    }
  }

  render() {
    // const base = this.base;
    const base = import.meta.env.BASE_URL;
    return /* html */ `
      <style>
        :host { display: block; }
        .nav-bar { box-sizing: border-box; height: 100%; max-width: 78px; width: 78px; background-color: var(--app-sidebar-color, #1f2937); color: #fff; display: flex; flex-direction: column; align-items: center; padding: 10px 0px 10px 0px; position: relative; }
        .nav-bar img { max-width: 97%; margin-top: 13px; padding-bottom: 16px; width: 30px;}
        
        .brand { cursor: nwse-resize; }
        .sideIcon { position: relative; margin-bottom: 38px;}
        
        .nav-bar a { color: #fff; background: transparent; width: 40px; height: 40px; border-radius: 10px; display: flex; justify-content: center; align-items: center; }
        .nav-bar a:hover { background-color: #000; filter: invert(100%); }
        .nav-bar a svg { width: 35px; fill: #fff; }
        .circle { width: 35px; height: 35px; background: #fff; color: #000; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-size: 18px; }
        .text { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .text-user { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 600; }
        .counter { width: 18px; height: 18px; background: var(--counter-background-color, #ef4444); color: #fff; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; position:absolute; bottom: 75%; left:50%; transform: translateX(10%); }

        /* Dropdown / submenu */
        .dropdown, .submenu { display: none; position: absolute; left: 60px; z-index: 1000; background: var(--dropdown-background-color, #fff); color: var(--app-color, #111); border: 1px solid rgba(0,0,0,.15); border-radius: 10px; box-shadow: 0 8px 16px rgba(0,0,0,.2); }
        .dropdown { top: -50px; min-width: 180px; overflow: hidden; }
        .submenu { top: -10px; width: 320px; padding: 8px 10px; }
        .show { display: block !important; }
        .dropdown-header { font: 700 13px var(--global-font-family, system-ui); padding: 6px 12px; }
        #dropdownList { margin: 0; padding: 0 10px 8px 20px; max-height: 70vh; overflow: auto; white-space: nowrap; }
        #dropdownList li { list-style: none; cursor: pointer; font: 600 11px var(--global-font-family, system-ui); padding: 4px 0; }
        #dropdownList li:hover { background: #eee; border-radius: 5px; }
        .submenu li { list-style: none; display: flex; align-items: center; gap: 8px; padding: 8px 12px; font: 600 13px var(--global-font-family, system-ui); cursor: pointer; }
        .submenu li:hover { background: #eee; border-radius: 5px; }
        dialog { padding:0; margin:0; border-radius:4px; border:1px solid rgba(0,0,0,.2); width: 500px; position: fixed; top:5%; left:50%; transform: translateX(-50%); }
        dialog .header { font: 600 20px var(--global-font-family, system-ui); padding: 16px; display:flex; justify-content: space-between; border-bottom: 1px solid #e9ecef; }
      
         .submenu-list {
          display: none;
          background-color: var(--dropdown-background-color);
          color: var(--app-color);
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          width: 350px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.15);
          padding: 8px 10px;
          position: absolute;
          
          left: 60px;
          top: -10px;
          z-index: 1000;
        }

        .submenu-list li {
          display: flex;
          flex-direction: row;
          align-items: center;
          cursor: pointer;
          list-style: none;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          font-family: var(--global-font-family);
        }

        .submenu-list li:hover {
          background-color: #eee;
          border-radius: 5px;
        }

        .submenu-list li img {
          margin-top: 0;
          padding-bottom: 0;
        }

        .submenu-list li span {
          margin-left: 8px;
        }

        dialog {
          padding: 0;
          margin: 0;
          border-radius: 4px;
          border: solid 1px rgba(0,0,0,0.2);
          z-index: 2000;
          width: 500px;
          position: fixed;
          top:5%;
          left: 50%;
          transform: translatex(-50%);
          overflow: hidden;
          
        }

        dialog .header {
          color: rgb(33,37,41);
          font-size: 20px;
          font-weight: 600;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom-style: solid;
          border-bottom-width: 1px;
          border-bottom-color: rgb(233,236, 239);
        }

        dialog::backdrop{
          background-color: (0, 0, 0, 0.4)
        }

        .dialog-content {
          padding: 16px;
          display: block;
          width: 100%;

        }

        .dialog-content h4 {
          font-size: 18px;
          font-weight: 700;
          margin: 10px 0px;
        }
        

        .tooltip[data-tip]:not([data-tip=""]) {
          position: relative;
          --tooltip-color: #fff;
          --tooltip-bg: rgba(0,0,0,0.9);
        }

        .tooltip[data-tip]:not([data-tip=""]).light {
          --tooltip-color: rgba(0,0,0,0.9);
          --tooltip-bg: #eee;
        }

        .tooltip[data-tip]:not([data-tip=""]).no-pointer::after {
          display: none;
        }

        .tooltip[data-tip]:not([data-tip=""])::before {
          content: attr(data-tip);
          position: absolute;
          background-color: var(--tooltip-bg);
          color: var(--tooltip-color);
          padding: 15px 10px;
          border-radius: 3px;
          max-width: 300px;
          width: 250%;
          left: 50%;
          transform: translate(-50%, 0);
          bottom: calc(100% + 12px);
        }

        .tooltip[data-tip]:not([data-tip=""])::after {
          content: '';
          border-width: 6px;
          border-style: solid;
          border-color: transparent;
          border-top-color: var(--tooltip-bg);
          width: 0;
          height: 0;
          display: inline-block;
          position: absolute;
          left: 50%;
          bottom: 100%;
          transform: translate(-50%, 0);
        }

        .tooltip[data-tip]:not([data-tip=""])::before,
        .tooltip[data-tip]:not([data-tip=""])::after {
          opacity: 0;
          visibility: hidden;
          transition: 
            visibility 0.3s ease-in-out,
            opacity 0.3s ease-in-out;
          transition-delay: 0.3s;
          z-index: 1000;
        }

        .tooltip[data-tip]:not([data-tip=""]):hover::before,
        .tooltip[data-tip]:not([data-tip=""]):hover::after {
          opacity: 1;
          visibility: visible;
          transition-delay: 0.6s;
        }

        /* TOP LEFT */
        .tooltip[data-tip]:not([data-tip=""]).top-left::before,
        .tooltip[data-tip]:not([data-tip=""]).top-left::after {
          transform: translate(0);
        }

        .tooltip[data-tip]:not([data-tip=""]).top-left::before {
          left: 0;
        }

        .tooltip[data-tip]:not([data-tip=""]).top-left::after {
          left: 5px;
        }

        /* TOP RIGHT */
        .tooltip[data-tip]:not([data-tip=""]).top-right::before,
        .tooltip[data-tip]:not([data-tip=""]).top-right::after {
          transform: translate(-100%, 0);
        }

        .tooltip[data-tip]:not([data-tip=""]).top-right::before {
          left: 100%;
        }

        .tooltip[data-tip]:not([data-tip=""]).top-right::after {
          left: calc(100% - 5px);
        }

        /* BOTTOM */
        .tooltip[data-tip]:not([data-tip=""]).bottom-left::before,
        .tooltip[data-tip]:not([data-tip=""]).bottom-right::before,
        .tooltip[data-tip]:not([data-tip=""]).bottom::before,
        .tooltip[data-tip]:not([data-tip=""]).bottom-left::after,
        .tooltip[data-tip]:not([data-tip=""]).bottom-right::after,
        .tooltip[data-tip]:not([data-tip=""]).bottom::after {
          bottom: 0;
        }

        .tooltip[data-tip]:not([data-tip=""]).bottom::before {
          left: 50%;
          transform: translate(-50%, calc(100% + 10px));
        }

        .tooltip[data-tip]:not([data-tip=""]).bottom-left::after,
        .tooltip[data-tip]:not([data-tip=""]).bottom-right::after,
        .tooltip[data-tip]:not([data-tip=""]).bottom::after {
          left: 50%;
          transform: translate(-50%, 10px);
          border-color: transparent;
          border-bottom-color: var(--tooltip-bg);
        }

        /* BOTTOM LEFT */
        .tooltip[data-tip]:not([data-tip=""]).bottom-left::before {
          left: 0;
          transform: translate(0, calc(100% + 10px));
        }

        .tooltip[data-tip]:not([data-tip=""]).bottom-left::after {
          left: 5px;
          transform: translate(0, 10px);
        }

        /* BOTTOM RIGHT */
        .tooltip[data-tip]:not([data-tip=""]).bottom-right::before {
          left: 100%;
          transform: translate(-100%, calc(100% + 10px));
        }

        .tooltip[data-tip]:not([data-tip=""]).bottom-right::after {
          left: 100%;
          transform: translate(calc(-100% - 5px), 10px);
        }

        /* LEFT */
        .tooltip[data-tip]:not([data-tip=""]).left::before,
        .tooltip[data-tip]:not([data-tip=""]).left::after,
        .tooltip[data-tip]:not([data-tip=""]).left-top::before,
        .tooltip[data-tip]:not([data-tip=""]).left-top::after,
        .tooltip[data-tip]:not([data-tip=""]).left-bottom::before,
        .tooltip[data-tip]:not([data-tip=""]).left-bottom::after {
            left: 0;
        }

        .tooltip[data-tip]:not([data-tip=""]).left::before,
        .tooltip[data-tip]:not([data-tip=""]).left::after {
          bottom: 50%;
        }

        .tooltip[data-tip]:not([data-tip=""]).left::before {
          transform: translate(calc(-100% - 10px), 50%);
        }

        .tooltip[data-tip]:not([data-tip=""]).left-top::after,
        .tooltip[data-tip]:not([data-tip=""]).left-bottom::after,
        .tooltip[data-tip]:not([data-tip=""]).left::after {
          transform: translate(-10px, 50%);
          border-color: transparent;
          border-left-color: var(--tooltip-bg);
        }

        /* LEFT TOP */
        .tooltip[data-tip]:not([data-tip=""]).left-top::before,
        .tooltip[data-tip]:not([data-tip=""]).left-top::after {
          bottom: 100%;
        }

        .tooltip[data-tip]:not([data-tip=""]).left-top::before {
          transform: translate(calc(-100% - 10px), 100%)
        }

        .tooltip[data-tip]:not([data-tip=""]).left-top::after {
          transform: translate(-10px, calc(100% + 5px));
        }

        /* LEFT BOTTOM */
        .tooltip[data-tip]:not([data-tip=""]).left-bottom::before,
        .tooltip[data-tip]:not([data-tip=""]).left-bottom::after {
          bottom: 0;
        }

        .tooltip[data-tip]:not([data-tip=""]).left-bottom::before {
          transform: translate(calc(-100% - 10px));
        }

        .tooltip[data-tip]:not([data-tip=""]).left-bottom::after {
          transform: translate(-10px, -5px);
        }

        /* RIGHT */
        .tooltip[data-tip]:not([data-tip=""]).right-bottom::before,
        .tooltip[data-tip]:not([data-tip=""]).right-top::before,
        .tooltip[data-tip]:not([data-tip=""]).right::before {
          left: calc(100% + 10px);
        }

        .tooltip[data-tip]:not([data-tip=""]).right::before {
          bottom: 50%;
          transform: translate(0, 50%);
        }

        .tooltip[data-tip]:not([data-tip=""]).right-top::after,
        .tooltip[data-tip]:not([data-tip=""]).right-bottom::after,
        .tooltip[data-tip]:not([data-tip=""]).right::after {
          left: calc(100% - 2px);
          bottom: 50%;
          transform: translate(0, 50%);
          border-color: transparent;
          border-right-color: var(--tooltip-bg);
        }

        /* RIGHT TOP */
        .tooltip[data-tip]:not([data-tip=""]).right-top::before,
        .tooltip[data-tip]:not([data-tip=""]).right-top::after {
          bottom: 100%;
        }

        .tooltip[data-tip]:not([data-tip=""]).right-top::before {
          transform: translate(0, 100%);
        }

        .tooltip[data-tip]:not([data-tip=""]).right-top::after {
          transform: translate(0, 15px);
        } 

        /* RIGHT BOTTOM */
        .tooltip[data-tip]:not([data-tip=""]).right-bottom::before,
        .tooltip[data-tip]:not([data-tip=""]).right-bottom::after {
          transform: translate(0);
        }

        .tooltip[data-tip]:not([data-tip=""]).right-bottom::before {
          bottom: 0;
        }

        .tooltip[data-tip]:not([data-tip=""]).right-bottom::after {
          bottom: 5px;
}



      </style>
      <div class="nav-bar">
        <div class="brandIcon">

          <img class="brand" src="${base}images/smartorg-logo.png" alt="SmartOrg" style="width: 42px; height: 42px;"/>
          </div>

        <div class="sideIcon">
          <a data-action="toggle" data-target="#portfolioMenu" href="#portfolios"><img src="${base}images/portfolio.svg" alt="" style="width: 45px; height: 45px;" /></a>
          <div id="portfolioMenu" class="dropdown">
            <div class="dropdown-header">Select Portfolio:</div>
            <ul id="dropdownList"></ul>
          </div>
          <div class="text">PORTFOLIO</div>
        </div>

        <div class="sideIcon">
          <a class="tooltip right" data-tip="Tools"
            data-action="toggle" data-target="#toolsMenu" href="#tools">
            <img src="${base}images/wrench.svg" alt=""/>
          </a>
          <div id="toolsMenu" class="submenu">
            <ul>
              <li data-cmd="wizard"><img src="${base}icons/fa-wand-magic.svg" alt=""/><span>Wizard</span></li>
              <li data-cmd="engine-log"><img src="${base}icons/fa-rectangle-list.svg" alt=""/><span>Calculation Engine Log</span></li>
              <li data-cmd="security"><img src="${base}icons/fa-triangle-exclamation.svg" alt=""/><span>Security Warning</span></li>
              <li data-cmd="export"><img src="${base}icons/fa-upload.svg" alt=""/><span>Export Current Portfolio</span></li>
              <li data-cmd="import"><img src="${base}icons/fa-download.svg" alt=""/><span>Import Portfolio</span></li>
            </ul>
          </div>
          <div class="text">TOOLS</div>
        </div>

        <div class="sideIcon">
          <a data-action="toggle" data-target="#adminMenu" href="#admin"><img src="${base}images/gear_users.svg" alt=""/></a>
          <div id="adminMenu" class="submenu">
            <ul>
              <li data-cmd="address-book"><img src="${base}icons/fa-address-book.svg" alt=""/><span>Address Book</span></li>
              <li data-cmd="group-manager"><img src="${base}icons/fa-users.svg" alt=""/><span>Group Manager</span></li>
              <li data-cmd="create-portfolio"><img src="${base}icons/fa-square-plus.svg" alt=""/><span>Create Portfolio</span></li>
              <li data-cmd="db-manager"><img src="${base}icons/fa-database.svg" alt=""/><span>Database Manager</span></li>
              <li data-cmd="user-log"><img src="${base}icons/fa-rectangle-list.svg" alt=""/><span>User Log</span></li>
              <li data-cmd="broadcast"><img src="${base}icons/fa-bullhorn.svg" alt=""/><span>Broadcast Messages</span></li>
            </ul>
          </div>
          <div class="text">ADMIN</div>
        </div>

        <div class="sideIcon">
          <a data-action="toggle" data-target="#messagesDialog" class="cnt" href="#messages"><img src="${base}images/bell.svg" alt=""/><div class="counter"></div></a>
          <div class="text">MESSAGES</div>
          <dialog id="messagesDialog">
            <div class="header"><span>Notifications</span><button id="closeDialog">Close</button></div>
            <div class="dialog-content"><p>Coming soon…</p></div>
          </dialog>
        </div>

        <div class="sideIcon">
          <a data-action="toggle" data-target="#helpMenu" href="#help"><img src="${base}images/help.svg" alt=""/></a>
          <div id="helpMenu" class="submenu">
            <ul>
              <li><img src="${base}icons/fa-circle-question.svg" alt=""/><span>Tutorial</span></li>
              <li><img src="${base}icons/fa-heart.svg" alt=""/><span>Support Center</span></li>
              <li><img src="${base}icons/fa-ticket.svg" alt=""/><span>Submit Ticket</span></li>
              <li><img src="${base}icons/fa-list-ul.svg" alt=""/><span>My Tickets</span></li>
              <li><img src="${base}icons/fa-clock-rotate-left.svg" alt=""/><span>Version Log</span></li>
            </ul>
          </div>
          <div class="text">HELP</div>
        </div>

        <div class="sideIcon">
          <a data-action="toggle" data-target="#userMenu" href="#user"><div class="circle">?</div></a>
          <div class="text-user"></div>
          <div id="userMenu" class="submenu-list">
            <ul>
              <li data-cmd="profile"><img src="${base}icons/fa-user.svg" alt=""/><span>Profile</span></li>
              <li data-cmd="logout"><img src="${base}icons/fa-right-from-bracket.svg" alt=""/><span>Log Out</span></li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}

// Register the custom element
customElements.define("side-bar", SideBar);
