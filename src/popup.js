// Get references to DOM elements
const searchInput = document.getElementById('search');
const tabList = document.getElementById('tab-list');
const tabCount = document.getElementById('tab-count');
const duplicateCount = document.getElementById('duplicate-count');
const mediaCount = document.getElementById('media-count');

// Query the list of open tabs and render them in the list
chrome.tabs.query({}, tabs => {
  // Update the tab count
  tabCount.textContent = tabs.length;

  // Map each tab to a list item element and append to the list
  tabs.forEach(tab => {
    const listItem = document.createElement('div');
    listItem.className = 'tab-item';
    listItem.innerHTML = `
      <img src="${tab.favIconUrl || 'icon.png'}">
      <div class="title">${tab.title}</div>
      <button class="close-button">&times;</button>
    `;
    tabList.appendChild(listItem);

    // Add event listener to close button
    listItem.querySelector('.close-button').addEventListener('click', () => {
      chrome.tabs.remove(tab.id);
      listItem.remove();
    });
  });

  // Calculate duplicate and media tab counts
  const urls = new Set();
  let mediaCountValue = 0;
  tabs.forEach(tab => {
    if (urls.has(tab.url)) {
      duplicateCount.textContent = Number(duplicateCount.textContent) + 1;
    } else {
      urls.add(tab.url);
    }
    if (tab.audible) {
      mediaCountValue += 1;
    }
  });
  mediaCount.textContent = mediaCountValue;

  // Set up search functionality
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const items = Array.from(tabList.children);
    items.forEach(item => {
      const title = item.querySelector('.title').textContent.toLowerCase();
      const url = item.querySelector('img').getAttribute('src').toLowerCase();
      if (query.includes('*')) { // Check if query has a wildcard character
        const regex = new RegExp(query.replace(/\*/g, '.*'), 'i'); // Replace all wildcards with regex .* pattern
        if (title.match(regex) || url.match(regex)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      } else {
        if (title.includes(query) || url.includes(query)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      }
    });
  });
});
