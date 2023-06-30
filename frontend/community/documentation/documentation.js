import { marked } from "./marked.js";

console.info(
  "%c DOCUMENTATION-CARD \n%c Version 0.1.0      ",
  "color: orange; font-weight: bold; background: black",
  "color: darkblue; font-weight: bold; background: white"
);

marked.setOptions({ headerIds: true });
const renderer = {
  heading(text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, "-");
    return `
    <h${level}>
    <a id="${escapedText}" class="anchor" href="#${escapedText}">
    <span class="header-link"></span>
    </a>
    ${text}
    </h${level}>`;
  },
};
marked.use({ renderer });

class DocumentationCard extends HTMLElement {
  set hass(hass) {
    if (this.content) return;
    if (!this.content) {
      this.innerHTML = `<style>${this.styles}</style>
      <ha-card>
        <div id="header">
          <div>
            <ha-icon icon="mdi:book-outline" style="width: 24px; padding:5px; color: white;"></ha-icon>
            <label style="font-weight: bold; color: white; ">Documentazione</label>
          </div>
          <button id="button" onclick="window.history.back();">Indietro</button>
        </div>
          <div class="card-content">
            <div id="doc"></div>
          </div>
      </ha-card>`;
      this.content = this.querySelector("#doc");
    }
    const filePath = "/local/" + this.config.filePath;
    let version = this.config.version;
    version = hass.states[version].state;
    let [, section] = window.location.href.split("#");
    if (!section) section = "";
    console.debug("File Path: ", filePath);
    console.debug("Version: ", version);
    console.debug("Section: ", section);

    this.readFile(filePath, this.setHtml, section);
  }

  setConfig(config) {
    if (!config.filePath) {
      throw new Error("File Path is not defined");
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }

  async readFile(path, cb, section) {
    return await fetch(path)
      .then((r) => r.text())
      .then((t) => cb(t, section));
  }

  setHtml = (text, section) => {
    this.content.innerHTML = marked.parse(text);
    if (section) {
      const element = this.content.querySelector("#" + section);
      element.scrollIntoView();
    }
  };

  get styles() {
    return $style;
  }
}

var $style = `
#doc {
  display: flex;
  overflow: hidden auto;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: flex-start;
  max-width: 100%;
}
#header {
  background: #333333;
  padding: 1%;
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 8%;
}
#button {
  background: none;
  border: none;
  font-weight: bold;
  font-size: medium;
}
`;

customElements.define("documentation-card", DocumentationCard);
