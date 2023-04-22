
const tabs = await chrome.tabs.query({
  url: [
    '<all_urls>'
  ]
});

const audible = tabs.filter(tab => { return tab.audible; });

document.querySelector('.number-tabs-open').append(tabs.length);
document.querySelector('.number-audible').append(audible.length);


//const collator = new Intl.Collator();
//tabs.sort((a, b) => collator.compare(a.title, b.title));

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


  element.querySelector('.btn-close-tab').addEventListener('click', async () => {
    await chrome.tabs.remove(tab.id);
    //element.querySelector('.btn-close-tab').innerHTML = "tab removed";
    //element.querySelector('.btn-close-tab').setAttribute('disabled', '');
    element.remove();
  });
  
  elements.add(element);
}
document.querySelector('ul').append(...elements);

const button = document.querySelector('#group_all_tabs');
button.addEventListener('click', async () => {
  const tabIds = tabs.map(({ id }) => id);
  const group = await chrome.tabs.group({ tabIds });
  await chrome.tabGroups.update(group, { title: 'All tabs' });
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

const search_query = document.querySelector('input[type="search"]');
search_query.addEventListener('search', async () => {
  let tl = document.createElement('li');
  tl.innerHTML = 'Results for: ' + search_query.value;

  document.querySelector('ul').innerHTML = '';
  document.querySelector('ul').appendChild(tl);

  const tabs_search = await chrome.tabs.query({
    url: [
      "<all_urls>"
    ]
  });

  var results = [];

  Object.values(tabs_search).forEach((val) => {
      // searches for url
      if(val.url.includes(search_query.value.toLowerCase())) { 
          if(!results.includes(val.id)) { results.push(val) }
      }
  
      // searches for title
      if(val.title.includes(search_query.value.toLowerCase())) {         
          if(!results.includes(val.id)) { results.push(val) }
      }
  });  

  const elements = new Set();

  for (const tab of results) {
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

    element.querySelector('.btn-close-tab').addEventListener('click', async () => {
      await chrome.tabs.remove(tab.id);
      //element.querySelector('.btn-close-tab').innerHTML = "tab removed";
      //element.querySelector('.btn-close-tab').setAttribute('disabled', '');
      element.remove();
    });
    
    elements.add(element);
  }

  document.querySelector('ul').append(...elements);
  document.querySelector('.tab_counter').innerHTML = "Found " + elements.size + " tabs matching.";

  const btn_group_results = document.querySelector('#group_results');
  
  btn_group_results.addEventListener('click', async () => {
    const tabIds = results.map(({ id }) => id);
    const new_group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(new_group, { title: tabs_search.value });
  });
});

