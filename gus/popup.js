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

function getElementById(id) {
  var value = document.getElementById(id).innerText
  console.log("getElementById: [" + id + "=" + value + "]")
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

function renderCopyStatus(text) {
  renderTextElement("copy-status", text);
  document.getElementById("box").style.border = '1px dotted blue'
  document.getElementById("box").style.backgroundColor = '#eeeeee'
}

function normalizeGusURLs(url_in) {
  if (url_in.includes("salesforce.com/apex/")) {
    // work item id
    id = url_in.split("?")[1].split("=")[1].split("&")[0]
    // xxx.my.salesforce.com
    host = url_in.split("/")[2]
    if (id && host) {
      return `https://${host}/${id}`
    }
  } else if (url_in.includes("lightning.force.com")) {
    // https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B00000051hhVIAQ/view?...
    // ditch query params
    left = url_in.split("?")[0]
    return left
  }
  return url_in
}

function renderURLArea() {
  url_final = normalizeGusURLs(urlx);
  var raw = link_text + "\n" + url_final;
  node = document.getElementById("copy-me-raw");
  node.innerText = raw;
  var mdURL = "[" + link_text + "](" + url_final + ")";
  node = document.getElementById("copy-me-markdown");
  node.innerText = mdURL;
  var awesome_url = "<a href=" + url_final + ">" + link_text + "</a>";
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
  var title
  var description
  console.log('DOMContentLoaded')
  getCurrentTabUrl(function(url) {
    urlx = url
    renderTextElement('url', 'URL: ' + urlx);
    getTitle(function(title) {
      renderTextElement('title', 'Title: ' + title);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const clean_title = title.replace(/ \| Salesforce/, "")
        link_text = clean_title
        renderURLArea()
      });
    })
  });
  console.log("popup.js - button listeners!")

  document.getElementById("copy-button-markdown").addEventListener('click', copyMarkdown);
  document.getElementById('copy-button-raw').addEventListener('click', copyRaw);

});



console.log("popup.js!")
