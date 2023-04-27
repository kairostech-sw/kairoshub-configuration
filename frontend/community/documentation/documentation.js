import {marked} from "./marked.js";

console.info("%c DOCUMENTATION-CARD \n%c Version 1.9.3      ", "color: orange; font-weight: bold; background: black", "color: darkblue; font-weight: bold; background: white")

marked.setOptions({ headerIds: true, })
const renderer = {
  heading(text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `
    <h${level}>
    <a id="${escapedText}" class="anchor" href="#${escapedText}">
    <span class="header-link"></span>
    </a>
    ${text}
    </h${level}>`;
  }
};
marked.use({ renderer });

class DocumentationCard extends HTMLElement {

  set hass(hass) {
    if (this.content) return
    if (!this.content) {
      this.innerHTML = 
        `<ha-card>
          <div class="card-content" id="doc"></div>
        </ha-card>`;
      this.content = this.querySelector("div");
    }
    const filePath = "/local/"+this.config.filePath;
    let version = this.config.version;
    version = hass.states[version].state;
    const section = this.config.section ? "#" + this.config.section : "";
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
    return await fetch(path).then(r => r.text()).then(t =>cb(t, section));
  }

  setHtml = (text, section) => {
    this.content.innerHTML = marked.parse(text);
    const element = this.content.querySelector(section);
    element.scrollIntoView();
  }
}

customElements.define('documentation-card', DocumentationCard);