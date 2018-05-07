
console.log("Franco Content!")
if (window == top) {
  console.log("Franco Content2!")
  // chrome.extension.sendRequest(document)
}


function getDescr() {
  var gus_description
  console.log($(".slds-page-header__title").attr('title'))
  gus_description = $(".slds-page-header__title").attr('title')
  if (gus_description) {
    return new String(gus_description)
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    console.log("request received by content.js:" + JSON.stringify(request))
    const gus_description = getDescr()
    console.log("final gus description" + gus_description)
    if (request.to_content == "description")
      sendResponse({to_popup: gus_description});
  }
);
