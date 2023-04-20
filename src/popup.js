
const tabs = await chrome.tabs.query({
  url: [
    '<all_urls>'
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
document.querySelector('.total_tabs').append("You have a total of " + elements.size + " tabs open.");

const button = document.querySelector('#group_all_tabs');
button.addEventListener('click', async () => {
  const tabIds = tabs.map(({ id }) => id);
  const group = await chrome.tabs.group({ tabIds });
  await chrome.tabGroups.update(group, { title: 'YT' });
});

const show_all = document.querySelector("#show_all_tabs");
show_all.addEventListener('click', async () => {
  document.querySelector('ul').innerHTML = '';
  document.querySelector('ul').append(...elements);
});

const clear_button = document.querySelector("#clear");
clear_button.addEventListener('click', async () => {
  document.querySelector('ul').innerHTML="";
});

const input_search = document.querySelector('input[type="search"]');
input_search.addEventListener('search', async () => {
  let tl = document.createElement('li');
  tl.innerHTML = 'Results for: ' + input_search.value;

  document.querySelector('ul').innerHTML = '';
  document.querySelector('ul').appendChild(tl);

  const tabs_search = await chrome.tabs.query({
    url: [
      input_search.value
    ]
  });

  const search_collator = new Intl.Collator();
  tabs_search.sort((a, b) => search_collator.compare(a.title, b.title));

  const elements = new Set();

  for (const tab of tabs_search) {
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
  document.querySelector('.tab_counter').innerHTML = "Found " + elements.size + " tabs matching.";

  const btn_group_results = document.querySelector('#group_results');
  btn_group_results.addEventListener('click', async () => {
    const tabIds = tabs_search.map(({ id }) => id);
    const new_group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(new_group, { title: tabs_search.value });
  });
});

