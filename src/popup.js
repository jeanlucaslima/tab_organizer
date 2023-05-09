// Get references to DOM elements
const searchInput = document.getElementById('search');
const tabList = document.getElementById('tab-list');
const tabCount = document.getElementById('tab-count');
// Dashboard counters
const duplicateCount = document.getElementById('duplicate-count');
const mediaCount = document.getElementById('media-count');
const groupCount = document.getElementById('group-count');

const tabs = await chrome.tabs.query({});
const mediaTabs = {};

// Map each tab to a list item element and append to the list
const renderTabList = (tabs) => {
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

// Query the list of open tabs and render them in the list
chrome.tabs.query({}, all_tabs => {
  // Update the tab count in the dashboard
  tabCount.textContent = tabs.length;

  // Map each tab to a list item element and append to the list
  renderTabList(all_tabs);

  // Calculate duplicate and media tab counts
  const urls = new Set();
  let mediaCountValue = 0;
  duplicateCount.textContent = "0";

  all_tabs.forEach(tab => {
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
});

// Set up search functionality
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const items = Array.from(tabs);
  
  items.forEach(item => {
    const title = item.title.toLowerCase();
    const url = item.url.toLowerCase();

    if (query.includes('*')) { // Check if query has a wildcard character
      const regex = new RegExp(query.replace(/\*/g, '.*'), 'i'); // Replace all wildcards with regex .* pattern
      if (title.match(regex) || url.match(regex)) {
        console.log(`match ${title}`);
      } else {
        console.log('no regex match');
      }
    } else {
      if (title.includes(query) || url.includes(query)) {
        console.log(`match ${title}`);
      } else {
        console.log('no match');
      }
    }
  });
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
      addGroup(newGroup);
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
