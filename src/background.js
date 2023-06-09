let tabList = [];
let mediaPlayingTabs = [];

async function updateTabList() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({}, function (tabs) {
      tabList = tabs;

      // Send a message to the popup indicating that the tab list has been updated
      chrome.runtime.sendMessage({ action: 'tabListUpdated' });

      resolve();
    });
  });
}

// async function updateMediaPlayingTabs() {
//   return new Promise((resolve, reject) => {
//     chrome.tabs.query({ audible: true }, function (audibleTabs) {
//       mediaPlayingTabs = audibleTabs;
//       console.log(mediaPlayingTabs);
//
//       // Send a message to the popup indicating that the tab list has been updated
//       chrome.runtime.sendMessage({ action: 'mediaListUpdated' });
//
//       resolve();
//     });
//   });
// }

async function handleTabCreation(tab) {
  await updateTabList();
  //await updateMediaPlayingTabs();
  // Additional processing with the updated tab list and media playing tabs
}

async function handleTabRemoval(tabId) {
  await updateTabList();
  //await updateMediaPlayingTabs();
  // Additional processing with the updated tab list and media playing tabs
}

// Initial update of the tab list and media playing tabs
updateTabList();
// updateMediaPlayingTabs();

// Event listener for tab creation
chrome.tabs.onCreated.addListener(handleTabCreation);

// Event listener for tab removal
chrome.tabs.onRemoved.addListener(handleTabRemoval);
