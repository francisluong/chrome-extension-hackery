// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function getTitle(callback) {
  chrome.tabs.getSelected(null, function(tab) {
    var title = tab.title
    callback(title)
  });
}


function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function renderTextElement(eleID, eleText) {
  document.getElementById(eleID).textContent = eleText;
}

function getDescription() {
  var description
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {to_content: "description"}, function(response) {
      console.log("response received by popup.js");
      console.log(response);
      console.log(response);
      renderTextElement("description", response.to_popup)
      description = response.to_popup
    });
  });
}

function getElementById(id) {
  var value = document.getElementById(id).innerText
  console.log("[" + id + "=" + value + "]")
}

function toClipboard(node) {
  console.log("toClipboard")
  console.log(node)
  var r = document.createRange();
  r.selectNode(node);
  var s = window.getSelection();
  s.removeAllRanges();
  s.addRange(r);
  // Copy - requires clipboardWrite permission
  document.execCommand('copy');
}

function bestTitleText(description, title) {
  console.log("bestTitleText: description: " + description)
  var expressions = [
    /.*(W-\d+).*/,
    /(Case:\s*\d+).*/
  ]
  for (var i = 0; i < expressions.length; i++) {
    var expr = expressions[i]
    var id = getMatchingTitleText(expr, title);
    if (id != null) {
      return id + ": " + description;
    } else {
      console.log("bestTitleText" + expr + "NOT MATCHED VS. " + title)
    }
  }
  return title
}

function getMatchingTitleText(expression, title) {
  var match = expression.exec(title);
  console.log("getMatchingTitleText" + expression + " VS. " + title)
  if (match == null) {
    return null;
  } else {
    return match[1];
  }
}

function renderCopyStatus(text) {
  renderTextElement("copy-status", text);
  document.getElementById("box").style.border = '1px dotted blue'
  document.getElementById("box").style.backgroundColor = '#eeeeee'
}

function renderURLArea() {
  var raw = link_text + "\n" + urlx;
  node = document.getElementById("copy-me-raw");
  node.innerText = raw;
  var mdURL = "[" + link_text + "](" + urlx + ")";
  node = document.getElementById("copy-me-markdown");
  node.innerText = mdURL;
  var awesome_url = "<a href=" + urlx + ">" + link_text + "</a>";
  node = document.getElementById("copy-me-html");
  node.innerHTML = awesome_url;
  toClipboard(node.children[0])
  renderCopyStatus("status: copied groovy URL text!");
}

function copyMarkdown() {
  console.log("copyMarkdown")
  node = document.getElementById("copy-me-markdown");
  toClipboard(node)
  renderCopyStatus("status: copied markdown URL text!");
}

function copyRaw() {
  console.log("copyRaw")
  node = document.getElementById("copy-me-raw");
  toClipboard(node)
  renderCopyStatus("status: copied raw URL text!");
}

document.addEventListener('DOMContentLoaded', function(tab) {

  getDescription()

  var title
  var description
  getCurrentTabUrl(function(url) {
    urlx = url
    renderTextElement('url', 'URL: ' + urlx);
    getTitle(function(title) {
      renderTextElement('title', 'Title: ' + title);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {to_content: "description"}, function(response) {
          console.log("response received by popup.js");
          console.log(response);
          link_text = title
          if (response != null) {
            renderTextElement("description", response.to_popup);
            description = response.to_popup;
            link_text = bestTitleText(description, title);
          }
          renderURLArea()
        });
      });
    })
  });
  console.log("popup.js - button listeners!")

  document.getElementById("copy-button-markdown").addEventListener('click', copyMarkdown);
  document.getElementById('copy-button-raw').addEventListener('click', copyRaw);

});



console.log("popup.js!")
