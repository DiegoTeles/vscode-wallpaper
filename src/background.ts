import * as path from "path";
import * as fs from "fs";

import * as vscode from "vscode";

import vsHelp from "./vsHelp";
import vscodePath from "./vscodePath";
import version from "./version";
import getCss from "./getCss";

/**
 * TYPE
 *
 * @enum {number}
 */
enum FileType {
  /**
   * Unmodified css file / css nao alterado
   */
  empty,
  /**
   *  Older version of css file / Versao antiga do css
   */
  isOld,
  /**
   * Older version of css file / nova versao do css
   */
  isNew,
}

/**
 * Plugin logic class / Classe lógica de plug-in
 *
 * @export
 * @class Background
 */
class Background {
  //#region private fields

  /**
   * Current user configuration / Configuração atual do usuário
   *
   * @private
   * @type {*}
   * @memberof Background
   */
  private config: any = vscode.workspace.getConfiguration("background");

  //#endregion

  //#region private methods

  /**
   * Obtain css document content
   *
   * @private
   * @returns {string}
   * @memberof Background
   */
  private getCssContent(): string {
    return fs.readFileSync(vscodePath.cssPathModel, "utf-8");
  }

  /**
   * Setting css document content
   *
   * @private
   * @param {string} content
   * @memberof Background
   */
  private saveCssContent(content: string): void {
    fs.writeFileSync(vscodePath.cssPathModel, content, "utf-8");
  }

  /**
   * initialization
   *
   * @private
   * @memberof Background
   */
  private initialize(): void {
    let firstload = this.checkFirstload(); // Whether to load the plugin for the first time

    let fileType = this.getFileType(); // css Current status of the file

    // If it is the first time to load the plugin, or the old version
    if (firstload || fileType == FileType.isOld || fileType == FileType.empty) {
      this.install(true);
    }
  }

  /**
   * Check if it is loaded for the first time and prompt the user when loading for the first time.
   *
   * @private
   * @returns {boolean} Whether it is loaded for the first time
   * @memberof Background
   */
  private checkFirstload(): boolean {
    const configPath = path.join(__dirname, "../assets/config.json");
    let info: { firstload: boolean } = JSON.parse(
      fs.readFileSync(configPath, "utf-8"),
    );

    if (info.firstload) {
      // prompt
      vsHelp.showInfo(
        "Welcome to use background! U can config it in settings.json.",
      );
      // The identity plugin has been launched
      info.firstload = false;
      fs.writeFileSync(configPath, JSON.stringify(info, null, "    "), "utf-8");

      return true;
    }

    return false;
  }

  /**
   * Get the status of the css file
   *
   * @private
   * @returns {FileType}
   * @memberof Background
   */
  private getFileType(): FileType {
    let cssContent = this.getCssContent();

    let ifUnInstall: boolean = !~cssContent.indexOf(`background.ver`);

    if (ifUnInstall) {
      return FileType.empty;
    }

    let ifVerOld: boolean = !~cssContent.indexOf(
      `/*background.ver.${version}*/`,
    );

    if (ifVerOld) {
      fs.writeFileSync(path.join(__dirname, "../xxx.css"), cssContent, "utf-8");
      return FileType.isOld;
    }

    return FileType.isNew;
  }

  /**
   * Install plugin css
   *
   * @private
   * @param {boolean} [refresh] need to be updated
   * @returns {void}
   * @memberof Background
   */
  private install(refresh?: boolean): void {
    let lastConfig = this.config; // Previous configuration
    let config = vscode.workspace.getConfiguration("background"); // Current user configuration

    // 1.If the current plugin configuration has not changed when the configuration file is changed, return
    if (!refresh && JSON.stringify(lastConfig) == JSON.stringify(config)) {
      // console.log('Profile has not changed.')
      return;
    }

    // There are two kinds of operations: 1. Initial loading 2. Configuration file changes

    // 2.Both configurations are, the plugin is not started.
    if (!lastConfig.enabled && !config.enabled) {
      // console.log('Both configurations are, the plugin is not started.');
      return;
    }

    // 3.Save current configuration
    this.config = config; // Update configuration

    // 4.If you close the plugin
    if (!config.enabled) {
      this.uninstall();
      vsHelp.showInfoRestart(
        "Background has been uninstalled! Please restart.",
      );
      return;
    }

    // 5.style
    let arr = []; // Default picture

    if (!config.useDefault) {
      // Custom picture
      arr = config.customImages;
    }

    // Custom style content
    let content = getCss(
      arr,
      config.style,
      config.styles,
      config.useFront,
    ).replace(/\s*$/, ""); // Remove the trailing blank

    // Add to the original style (try to delete the old style)
    let cssContent = this.getCssContent();
    cssContent = this.clearCssContent(cssContent);
    cssContent += content;

    this.saveCssContent(cssContent);
    vsHelp.showInfoRestart("Background has been changed! Please restart.");
  }

  /**
   * Uninstall
   *
   * @private
   * @memberof Background
   */
  private uninstall(): boolean {
    try {
      let content = this.getCssContent();
      content = this.clearCssContent(content);
      this.saveCssContent(content);
      return true;
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }

  /**
   * Clean up add-ons in css
   *
   * @private
   * @param {string} content
   * @returns {string}
   * @memberof Background
   */
  private clearCssContent(content: string): string {
    content = content.replace(
      /\/\*css-background-start\*\/[\s\S]*?\/\*css-background-end\*\//g,
      "",
    );
    content = content.replace(/\s*$/, "");
    return content;
  }

  //#endregion

  //#region public methods

  /**
   * Initialize and start listening for configuration file changes
   *
   * @returns {vscode.Disposable}
   * @memberof Background
   */
  public watch(): vscode.Disposable {
    this.initialize();
    return vscode.workspace.onDidChangeConfiguration(() => this.install());
  }

  //#endregion
}

export default new Background();
