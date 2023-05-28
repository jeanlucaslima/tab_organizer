// Get references to DOM elements
const searchInput = document.getElementById('search');
const tabList = document.getElementById('tab-list');

// Dashboard counters
const tabCount = document.getElementById('tab-count');
const duplicateCount = document.getElementById('duplicate-count');
const mediaCount = document.getElementById('media-count');

// Search related buttons
const btnGroup = document.getElementById('group-search-results-button');
const btnClose = document.getElementById('close-search-results-button');

// Tabs
const tabs = await chrome.tabs.query({});
const mediaTabs = new Set();
const dupeTabList = new Set();

const updateDashboard = async () => {
  let currentTabs = await chrome.tabs.query({});

  updateTabCounter(currentTabs);
  updateDuplicates(currentTabs);
  updateMediaCounter(currentTabs);
}

const updateTabCounter = (tabs) => {

  tabCount.textContent = tabs.length;
};

const updateDuplicates = (tabs) => {
  var urlMap = {};       // Object to keep track of URLs and their occurrence counts
  var tabsToClose = [];  // Array to store the IDs of duplicate tabs that need to be closed

  tabs.forEach(function(tab) {
    if (urlMap[tab.url]) {          // If the URL already exists in urlMap
      tabsToClose.push(tab.id);     // Add the tab ID to tabsToClose
      dupeTabList.add(tab);
    } else {
      urlMap[tab.url] = true;       // Mark the URL as seen by adding it to urlMap
    }
  });

  // Update dashboard
  duplicateCount.textContent = `${dupeTabList.size}`;

  // When clicking on duplicates, list all if there are any
  const btnDupes = document.querySelector('.dupes');
  btnDupes.addEventListener('click', () => {
    if(dupeTabList.size > 0) {
      searchInput.value = '';
      btnGroup.textContent = `Group (${dupeTabList.size}) tabs`;
      btnClose.textContent = `Close (${dupeTabList.size}) tabs`;

      renderTabList(dupeTabList);
    }
  });

  // Double click closes all duplicates
  btnDupes.addEventListener("dblclick", async () => {
    // Close the duplicate tabs
    await chrome.tabs.remove(tabsToClose);

    // query all tabs again and re-setup
    // const resetTabs = await chrome.tabs.query({});
    // setup(resetTabs);
  });
};

const updateMediaCounter = (tabs) => {
  // Calculate media tab counts
  let mediaCountValue = 0;
  mediaCount.textContent = "0";

  tabs.forEach(tab => {
    if (tab.audible) {
      mediaTabs.add(tab);
      mediaCountValue += 1;
    }
  });

  mediaCount.textContent = mediaCountValue;

  // When clicking on media, list all if there are any
  const btnMedia = document.querySelector('.media');
  btnMedia.addEventListener('click', () => {
    if (mediaTabs.size > 0) {
      // update search results area
      searchInput.value = '';
      btnGroup.textContent = `Group (${mediaTabs.size}) tabs`;
      btnClose.textContent = `Close (${mediaTabs.size}) tabs`;

      renderTabList(mediaTabs);
    }
  });
}

const setup = (tabs) => {
  // Update the tab count in the dashboard

  const btnCount = document.querySelector('.count');
  btnCount.addEventListener('click', async () => {
    if(tabs.length > 0) {
      const allTabs = await chrome.tabs.query({});

      btnGroup.textContent = `Group all tabs`;
      btnClose.textContent = `Close all tabs`;

      renderTabList(allTabs);
    }
  });

  updateDashboard();
  renderTabList(tabs);
}

// Map each tab to a list item element and append to the list
const renderTabList = (tabs) => {
  //TODO: add transition time
  //TODO: render empty state

  tabList.innerHTML = ''; // Clear the current list
  // Map each tab to a list item element and append to the list
  tabs.forEach(tab => {
    const listItem = document.createElement('div');
    listItem.className = 'tab-item';
    listItem.innerHTML = `
      <div class="focus-group">
        <img src="${tab.favIconUrl || 'img/icon_16.png'}">
        <div class="tab-info">
          <div class="tab-title">${tab.title}</div>
          <div class="tab-url">${tab.url}</div>
        </div>
      </div>
      <button class="close-button">&times;</button>
    `;
    tabList.appendChild(listItem);

    // Add event listener to close button
    listItem.querySelector('.close-button').addEventListener('click', async () => {
      await chrome.tabs.remove(tab.id);
      listItem.remove();
      updateDashboard();
      // searchInput.focus(); // Nice, but doesn't work
    });

    // Add event listener to navigate to tab onclick
    listItem.querySelector('.focus-group').addEventListener('click', async () => {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });
  });
}

// Set up search functionality
searchInput.addEventListener('input', async () => {
  const query = searchInput.value.toLowerCase();
  const searchResults = new Set();

  // update tabs list
  const queryTabs = await chrome.tabs.query({});

  queryTabs.forEach(tab => {
    const title = tab.title.toLowerCase();
    const url = tab.url.toLowerCase();

    // If query has a wildcard character
    if (query.includes('*')) {
      // Replace all wildcards with regex .* pattern
      const regex = new RegExp(query.replace(/\*/g, '.*'), 'i');
      if (title.match(regex) || url.match(regex)) {
        searchResults.add(tab);
      }
    } else {
      if (title.includes(query) || url.includes(query)) {
        searchResults.add(tab);
      }
    }
  });

  // update search result btns
  btnGroup.textContent = `Group (${searchResults.size}) tabs`;
  btnClose.textContent = `Close (${searchResults.size}) tabs`;

  renderTabList(searchResults);
});

// Group search results button
btnGroup.addEventListener('click', () => {
  const items = Array.from(tabList.children);
  const selectedItems = items.filter(item => item.style.display === 'flex');
  if (selectedItems.length > 0) {
    const groupTitle = prompt('Enter a title for the new group:');
    if (groupTitle) {
      const newGroup = {
        title: groupTitle,
        tabs: selectedItems.map(item => item.dataset.tabId),
      };
      //addGroup(newGroup);
      //renderTabList();
    }
  } else {
    alert('No search results to group.');
  }
});

// Close search results button
btnClose.addEventListener('click', () => {
  const items = Array.from(tabList.children);
  const selectedItems = items.filter(item => item.style.display === 'flex');
  if (selectedItems.length > 0) {
    selectedItems.forEach(item => {
      chrome.tabs.remove(parseInt(item.dataset.tabId));
    });
    //renderTabList();
  } else {
    alert('No search results to close.');
  }
});

// initialize
setup(tabs);
