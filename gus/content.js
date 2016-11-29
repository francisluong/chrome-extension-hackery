
console.log("Franco Content!")
if (window == top) {
  console.log("Franco Content2!")
  // chrome.extension.sendRequest(document)
}


var ids = [
    "subjectInput_inputComponent_outputStandalone_ileinner",
    "cas14_ileinner"
]
for (var i = 0; i < ids.length; i++) {
    var id = ids[i]
    var gus_description_nodes = $( `[id*='${id}']` )
    if (gus_description_nodes) {
      var gus_description = gus_description_nodes[0].innerText;
      console.log("internal gus description" + gus_description)
      break
    }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    console.log("request received by content.js:" + request)
    console.log("final gus description" + gus_description)
    if (request.to_content == "description")
      sendResponse({to_popup: gus_description});
  }
);
