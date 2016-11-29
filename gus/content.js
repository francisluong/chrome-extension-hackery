
console.log("Franco Content!")
if (window == top) {
  console.log("Franco Content2!")
  // chrome.extension.sendRequest(document)
}

var ids = [
    "bugDetailPage_bugWorkForm_subjectInput_inputComponent_outputStandalone_ileinner",
    "userStoryDetailPage_userStoryWorkForm_subjectInput_inputComponent_outputStandalone_ileinner",
    "investigationDetailPage_investigationWorkForm_subjectInput_inputComponent_outputStandalone_ileinner",
    "cas14_ileinner"
]
for (var i = 0; i < ids.length; i++) {
    var id = ids[i]
    var gus_description_node = document.getElementById(id)
    if (gus_description_node) {
      var gus_description = document.getElementById(id).innerText;
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
