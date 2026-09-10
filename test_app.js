const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('/Users/mac/Downloads/VPP/index.html', 'utf8');
const js = fs.readFileSync('/Users/mac/Downloads/VPP/app.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const window = dom.window;
const document = window.document;

// mock basic browser APIs
window.URL.createObjectURL = () => "blob:test";
window.URL.revokeObjectURL = () => {};

try {
  const scriptEl = document.createElement('script');
  scriptEl.textContent = js;
  document.body.appendChild(scriptEl);
  console.log("App.js loaded successfully without throwing errors at startup.");
} catch (e) {
  console.error("Error loading app.js:", e);
}
