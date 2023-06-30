# [tabbed-card](https://github.com/kinghat/tabbed-card)

Card Version: _0.3.1_

Use this file as a minified JS or the `styleMap` directive will throw an error.

---

## Changelog

- Added `id` attribute that will be set as the Tab card `label` attribute (used for card-mod styling)
- Added `entity, suffix, show_unknown` to Tab card configuration. <br>
  If an entity is specified, the label of the tab will be that entity's state. <br>
  if _show_unknown_ is not set, the Tab will not be displayed if the entity has **unavailable** or **unknown** state
- Fixed ha-icon and label alignment
