
console.log("Franco Content!")
if (window == top) {
  console.log("Franco Content2!")
  // chrome.extension.sendRequest(document)
}


function getDescr() {
  var gus_description
  if (document.URL.includes("lightning.force.com/one")) {
    console.log("LIGHTNING!")
    const h = $( "h1" )
    gus_description = h[0].innerText
  } else {
    console.log("CLASSIC!")
    var ids = [
      "subjectInput_inputComponent_outputStandalone_ileinner",
      "cas14_ileinner",
    ]
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i]
      var gus_description_nodes = $( `[id*='${id}']` )
      if (gus_description_nodes) {
        gus_description = gus_description_nodes[0].innerText
        break
      }
    }
  }
  console.log("Gus Description: " + gus_description)
  return gus_description
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    console.log("request received by content.js:" + request)
    const gus_description = getDescr()
    console.log("final gus description" + gus_description)
    if (request.to_content == "description")
      sendResponse({to_popup: gus_description});
  }
);
