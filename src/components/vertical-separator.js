export class VerticalSeparator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isToggled = false; // initial state
  }

  // Lifecycle methods
  connectedCallback() {
    const direction = this.getAttribute("direction") || "left";
    this.isToggled = direction === "right"; // right = expanded, left = collapsed

    this.shadowRoot.innerHTML = this.render();

    const button = this.shadowRoot.querySelector(".toggle-button");
    const icon = button?.querySelector("i");

    if (icon) {
      icon.className = this.isToggled
        ? "pi pi-chevron-right"
        : "pi pi-chevron-left";
    }

    if (button) {
      button.addEventListener("click", () => {
        this.isToggled = !this.isToggled;

        // Flip the icon
        if (icon) {
          icon.className = this.isToggled
            ? "pi pi-chevron-right"
            : "pi pi-chevron-left";
        }

        // Dispatch event
        this.dispatchEvent(
          new CustomEvent("separator-toggle", {
            bubbles: true,
            composed: true,
            detail: {
              toggled: this.isToggled,
            },
          })
        );
      });
    }
  }

  render() {
    return /*html*/ `
          <style>
          @import url("https://unpkg.com/primeicons/primeicons.css");
          .separator {
              width: 4px;
              height: 100vh;
              background-color: var(--separator-background-color);
              position: relative;
          }
  
          .toggle-button {
              position: absolute;
              top: 22px;
              height: 22px;
              width: 22px;
              cursor: pointer;
              background-color: #fff;
              color: white;
              border-radius: 50%;
              border-color: rgb(108, 117, 125);
              border-width: 0px;
              box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 9px 0px;
              padding: 10px;
              right: -9px;
              top: 41px;
              transition: 0.3s;
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: center;
          }

          .toggle-button i {
            font-size: 0.8rem;
            font-weight: 400;
            color: rgb(108, 117, 125)
            }
          .toggle-button:hover {
              background-color: #444;
              color: #fff;
          }
          .toggle-button:hover i {
              color: #fff;}
  
              
          </style>
          <div class="separator">
              <button class="toggle-button"><i class="pi pi-chevron-left"></i></button>

          </div>
          `;
  }
}

// Register the custom element
customElements.define("vertical-separator", VerticalSeparator);
