import * as vscode from "vscode";

const vsHelp = {
  /**
   * Display message box
   *
   * @param {string} content Prompt content
   * @returns {Thenable<string>}
   */
  showInfo(content: string): Thenable<string> {
    return vscode.window.showInformationMessage(content);
  },

  /**
   * Prompt message and restart
   *
   * @param {any} content Prompt content
   * @returns {Thenable<void>}
   */
  showInfoRestart(content): Thenable<void> {
    return vscode.window
      .showInformationMessage(content, {
        title: "Restart VSCode | Reiniciar VSCode",
      })
      .then(function(item) {
        if (!item) return;
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      });
  },
};

export default vsHelp;
