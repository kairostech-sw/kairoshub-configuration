
class IntegrationCard extends HTMLElement {

  constructor() {
    super();
    this.lifetime = Date.now();
  }

  set hass(hass) {
    if (!this.content || this._shouldUpdate(this.lifetime)) {
      this.innerHTML =
        `<style>${this.styles}</style>
        <ha-card>
          <div id="card-content" style="padding: 16px;">
          </div>
        </ha-card>`;
        this.content = this.querySelector("#card-content")

        if (this.config.title) {
          let node = document.createElement("h3")
          node.setAttribute("class", "header")
          let header = document.createTextNode(this.config.title)
          node.append(header)
          this.content.appendChild(node)
        }
      this.config.entities.forEach((e) => {
          this.renderEntity(e, hass);
        })
    }
  };

  setConfig(config) {
    this.config = config;
  }

  renderEntity(e, hass) {
    let { name, icon, color, state } = this.getEntityConfig(e, hass);

    let icon_html = `<ha-icon icon="${icon}" style="width: 32px; padding:5px; color: ${color};"></ha-icon>`;
    let name_div = `<div class="int-info">
      ${icon_html}
      <div id="${name}" class="state">${name}
      </div>
      </div>`;
    let state_div = `<div id="${name}-state" class="state" style="color:${color};">${state}</div>`;

    let node = document.createElement("div")
    node.setAttribute("class", "int-info")
    node.innerHTML = name_div+state_div;
    this.content.appendChild(node)
  }

  _shouldUpdate(t) {
    let n = Date.now();
    if( t + 300000<=n) {
      this.lifetime = n;
      return true;
    };
    return false;
  }

  getEntityConfig(e, hass) {
    return {
      name: hass.states[e.entity].attributes.friendly_name,
      icon: e.icon ?? "",
      color: e.color ?? "var(--paper-item-icon-color)",
      state: this.formatDate(hass.states[e.entity].state.toUpperCase()),
    }
  }

  formatDate(str) {
    let date = Date.parse(str);
    if (isNaN(date)) return str;
    return new Date(date).toLocaleDateString();
  }

  get styles() { return $style;}
}

var $style = `
#card-content {
  width: 100%;
}

.int-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}

.header {
  margin: 2px 2px;
  text-align: start;
}
`

customElements.define('integration-info-card', IntegrationCard);