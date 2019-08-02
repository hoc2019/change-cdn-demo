var parseQueryString = url => {
  var reg_url = /\?([\w\W]+)$/;
  var reg_para = /([^&=]+)=([\w\W]*?)(&|$)/g; // g is very important
  var arr_url = reg_url.exec(url);
  var ret = {};
  if (arr_url && arr_url[1]) {
    var str_para = arr_url[1];
    let result = null;
    while ((result = reg_para.exec(str_para)) != null) {
      ret[result[1]] = result[2];
    }
  }
  return ret;
};

var query = parseQueryString(window.location.href);
var cdn = query.cdn;
var cdnList = {
  Default: "http://localhost:3001/",
  Cdn: "http://localhost:3002/"
};
if (cdnList[cdn]) {
  window.publicPath = cdnList[cdn];
} else {
  cdn = "";
  window.publicPath = cdnList.Default;
}

function asyncAppendNode(tagName, fileName) {
  function createUrl(type) {
    return window.publicPath + "static/" + type + cdn + "/" + fileName;
  }
  var node = document.createElement(tagName);
  if (tagName === "link") {
    node.type = "text/css";
    node.rel = "stylesheet";
    node.href = createUrl("css");
    document.head.appendChild(node);
  } else {
    node.src = createUrl("js");
    document.body.appendChild(node);
  }
}
