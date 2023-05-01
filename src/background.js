// Context menus
chrome.contextMenus.create({
  id: "tabber",
  title: "tabber",
  contexts: ["all"]
});

chrome.contextMenus.create({
  id: "group-this-url",
  parentId: "tabber",
  title: "Group all _inserURL_ tabs",
  contexts: ["all"]
});

chrome.contextMenus.create({
  id: "dupes",
  parentId: "tabber",
  title: "Close duplicates",
  contexts: ["all"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == "tabber") {
    console.log("Context menu was clicked.\n")
  }
});