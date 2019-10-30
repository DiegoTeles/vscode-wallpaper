import * as path from "path";
import * as vscode from "vscode";

const data = path.dirname(require.main.filename);

const cssName =
  parseFloat(vscode.version) >= 1.38
    ? "workbench.desktop.main.css"
    : "workbench.main.css";
const cssPathModel = path.join(data, "vs", "workbench", cssName);

const indexDir = path.join(
  data,
  "vs",
  "workbench",
  "electron-browser",
  "bootstrap",
);

export default {
  data,

  cssPathModel,

  indexDir,
};
