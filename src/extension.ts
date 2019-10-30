"use strict";
import * as vscode from "vscode";
import background from "./background";
import vsHelp from "./vsHelp";

export function activate(data: vscode.ExtensionContext) {
  let temp = vscode.commands.registerCommand(
    "extension.background.info",
    function() {
      vsHelp.showInfo(
        "You can config your background in settings.json. o/ | pt-br: Você pode configurar seu background no settings.js. o/ ",
      );
    },
  );

  data.subscriptions.push(temp);

  data.subscriptions.push(background.watch());
}

export function deactivate() {
  // vscode.window.showInformationMessage('deactivated!');
}
