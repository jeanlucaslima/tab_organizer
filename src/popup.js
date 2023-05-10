// Get references to DOM elements
const searchInput = document.getElementById('search');
const tabList = document.getElementById('tab-list');
const tabCount = document.getElementById('tab-count');
// Dashboard counters
const duplicateCount = document.getElementById('duplicate-count');
const mediaCount = document.getElementById('media-count');

// Search related buttons
const btnGroup = document.getElementById('group-search-results-button');
const btnClose = document.getElementById('close-search-results-button');

// Tabs
const tabs = await chrome.tabs.query({});

const mediaTabs = {};

const updateMediaCounter = (tabs) => {
  // Calculate duplicate and media tab counts
  const urls = new Set();
  let mediaCountValue = 0;
  duplicateCount.textContent = "0";

  tabs.forEach(tab => {
    if (urls.has(tab.url)) {
      duplicateCount.textContent = Number(duplicateCount.textContent) + 1;
    } else {
      urls.add(tab.url);
    }
    if (tab.audible) {
      // TODO: copy tab to mediaTabs obj Array
      mediaCountValue += 1;
    }
  });
  mediaCount.textContent = mediaCountValue;
}

const setup = (tabs) => {
  // Update the tab count in the dashboard
  tabCount.textContent = tabs.length;

  updateMediaCounter(tabs);
  renderTabList(tabs);
}


// Map each tab to a list item element and append to the list
const renderTabList = (tabs) => {
  // clear first
  tabList.innerHTML = '';
  // Map each tab to a list item element and append to the list
  tabs.forEach(tab => {
    const listItem = document.createElement('div');
    listItem.className = 'tab-item';
    listItem.innerHTML = `
      <img src="${tab.favIconUrl || 'img/icon_16.png'}">
      <div class="tab-info">
        <div class="title">${tab.title}</div>
        <div class="url">${tab.url}</div>
      </div>
      <button class="close-button">&times;</button>
    `;
    tabList.appendChild(listItem);
    
    // Add event listener to close button
    listItem.querySelector('.close-button').addEventListener('click', async () => {
      await chrome.tabs.remove(tab.id);
      listItem.remove();
    });

    // Add event listener to navigate to tab onclick
    listItem.addEventListener('click', async () => {
      // it's not enough to only focus the tab, you gotta focus the window too
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

const groupSearchResultsButton = document.querySelector('#group-search-results-button');
groupSearchResultsButton.addEventListener('click', () => {
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
const closeSearchResultsButton = document.querySelector('#close-search-results-button');
closeSearchResultsButton.addEventListener('click', () => {
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
