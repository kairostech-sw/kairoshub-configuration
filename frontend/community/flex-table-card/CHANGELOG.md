# [flex-table-card](https://github.com/custom-cards/flex-table-card/tree/master)

Card Version: _0.7.1_

---

## Changelog

- Added `hass` object to: `CellFormatter, DataRow`
- Added format functions: <br>
  ```js
  fw; // replaces @ with &shy;@
  version; // replaces # with <br>
  signalIcon; // changes rssi value to proper signal strength icon and color
  formatBoolean; // formats boolean to 'SI' or 'NO'
  getZone; // return the name of the zone in which the entity is located
  ```
- Changed default column value to _n/a_ instead of undefined (might break strict mode)
