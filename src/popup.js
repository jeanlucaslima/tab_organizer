
const tabs = await chrome.tabs.query({
    url: [
      'https://*.youtube.com/*'
    ]
  });
  
  const collator = new Intl.Collator();
  tabs.sort((a, b) => collator.compare(a.title, b.title));
  
  const template = document.getElementById('li_template');
  const elements = new Set();
  
  for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);
  
    const title = tab.title.split('-')[0].trim();
    const pathname = new URL(tab.url);
  
    element.querySelector('.title').textContent = title;
    element.querySelector('.pathname').textContent = pathname;
    element.querySelector('a').addEventListener('click', async () => {
      // need to focus window as well as the active tab
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });
  
    elements.add(element);
  }

  document.querySelector('ul').append(...elements);
  document.querySelector('p').append("You have " + elements.size + " tabs open.");
  
  const button = document.querySelector('#group_all_tabs');
  button.addEventListener('click', async () => {
    const tabIds = tabs.map(({ id }) => id);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: 'YT' });
  });

function clean_list() {
    

}