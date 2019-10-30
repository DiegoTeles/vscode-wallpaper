import defBase64 from "./defBase64";
import version from "./version";

/**
 * Get style text by configuration
 *
 * @param {object} options User configuration
 * @param {boolean} useFront Whether the foreground map
 * @returns {string}
 */
function getStyleByOptions(options: object, useFront: boolean): string {
  let styleArr: string[] = [];
  for (let k in options) {
    // Exclude when using the background image pointer-events
    if (!useFront && ~["pointer-events", "z-index"].indexOf(k)) {
      continue;
    }

    if (options.hasOwnProperty(k)) {
      styleArr.push(`${k}:${options[k]}`);
    }
  }
  return styleArr.join(";") + ";";
}

/**
 * Generate css style
 *
 * @export
 * @param {Array<string>} arr Image array
 * @param {any} [style={}] Custom style
 * @param {Array<any>} [styles=[]] Custom style for each background image
 * @param {boolean} [useFront=true] Whether to use the foreground map
 * @returns
 */
export default function(
  arr: Array<string>,
  style: any = {},
  styles: Array<any> = [],
  useFront: boolean = true,
) {
  let [img0, img1, img2] =
    arr && arr.length
      ? [arr[0] || "none", arr[1] || "none", arr[2] || "none"]
      : defBase64;

  let defStyle = getStyleByOptions(style, useFront); // Default style
  let [styel0, style1, style2] = [
    // 3 child styles
    defStyle + getStyleByOptions(styles[0], useFront),
    defStyle + getStyleByOptions(styles[1], useFront),
    defStyle + getStyleByOptions(styles[2], useFront),
  ];

  // Used in foreground image ::after
  let frontContent = useFront ? "::after" : "::before";

  let content = `

/*css-background-start*/
/*background.ver.${version}*/

[id="workbench.parts.editor"] .split-view-view:nth-child(1) .editor-container .overflow-guard>.monaco-scrollable-element${frontContent}{background-image: url('${img0}');${styel0}}

[id="workbench.parts.editor"] .split-view-view:nth-child(2) .editor-container .overflow-guard>.monaco-scrollable-element${frontContent}{background-image: url('${img1}');${style1}}

[id="workbench.parts.editor"] .split-view-view:nth-child(3) .editor-container .overflow-guard>.monaco-scrollable-element${frontContent}{background-image: url('${img2}');${style2}}

[id="workbench.parts.editor"] .split-view-view .editor-container .overflow-guard>.monaco-scrollable-element>.monaco-editor-background{background: none;}

/*css-background-end*/
`;

  return content;
}
