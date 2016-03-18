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

document.addEventListener('DOMContentLoaded', function(tab) {

  getDescription()

  var urlx
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
          console.log(response);
          renderTextElement("description", response.to_popup);
          description = response.to_popup;
          var w_expr = /.*(W-\d+).*/;
          var match = w_expr.exec(title);
          var w_id = match[1];
          var awesome_url = "<a href=" + url + ">" + w_id + ": " + description + "</a>";
          node = document.getElementById("copy-me");
          node.innerHTML = awesome_url;
          toClipboard(node)
          renderTextElement("copy-status", "status: copied URL text for " + w_id);
        });
      });
    })
  });

});


console.log("popup.js!")
