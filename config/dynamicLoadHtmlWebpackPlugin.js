// If your plugin is direct dependent to the html webpack plugin:
const HtmlWebpackPlugin = require("html-webpack-plugin");

class DynamicLoadHtmlWebpackPlugin {
  constructor(options = {}) {
    const { callbackName = "callback", cdnVariableName } = options;
    this.callbackName = callbackName;
    this.cdnVariableName = cdnVariableName;
  }
  rewriteData(node, data, fnName, publicPath) {
    if (node === "link") {
      const fileNames = data.map(item => item.attributes.href.split("/").pop());
      const styleHtml = fileNames
        .map(item => `${fnName}('${node}','${item}');`)
        .join("");
      return [{ tagName: "script", voidTag: false, innerHTML: styleHtml }];
    } else {
      const inlineScript = [];
      const srcScript = [];
      data.forEach(item => {
        if (item.innerHTML) {
          if (typeof publicPath === "string" && this.cdnVariableName) {
            const html = item.innerHTML;
            const newHtml = html.replace(
              `="${publicPath}"`,
              `=${this.cdnVariableName}`
            );
            item.innerHTML = newHtml;
          }
          inlineScript.push(item);
        } else {
          srcScript.push(item.attributes.src.split("/").pop());
        }
      });
      const scriptHtml = srcScript
        .map(item => `${fnName}('${node}','${item}');`)
        .join("");
      return [
        ...inlineScript,
        { tagName: "script", closeTag: true, innerHTML: scriptHtml }
      ];
    }
  }
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "DynamicLoadHtmlWebpackPlugin",
      compilation => {
        // Static Plugin interface |compilation |HOOK NAME | register listener
        HtmlWebpackPlugin.getHooks(
          compilation
        ).beforeAssetTagGeneration.tapAsync(
          "DynamicLoadHtmlWebpackPlugin", // <-- Set a meaningful name here for stacktraces
          (data, cb) => {
            this.publicPath = data.assets.publicPath;
            cb(null, data);
          }
        );
        HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync(
          "DynamicLoadHtmlWebpackPlugin", // <-- Set a meaningful name here for stacktraces
          (data, cb) => {
            console.log(data);
            const newStyleData = this.rewriteData(
              "link",
              data.headTags,
              this.callbackName
            );
            data.headTags = newStyleData;
            const newScriptData = this.rewriteData(
              "script",
              data.bodyTags,
              this.callbackName,
              this.publicPath
            );
            data.bodyTags = newScriptData;
            cb(null, data);
          }
        );
      }
    );
  }
}

module.exports = DynamicLoadHtmlWebpackPlugin;
