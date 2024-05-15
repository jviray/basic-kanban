// Must use normal function because of `this`.
// Must also bind to element before calling.
function handleEvent(eventName) {
  return function (fn) {
    this.addEventListener(eventName, (event) => {
      fn(event);
    });
  };
}

const onClick = handleEvent('click');
const onSubmit = handleEvent('submit');
const onFocusIn = handleEvent('focusin');
const onFocusOut = handleEvent('focusout');
const onKeyUp = handleEvent('keyup');

// Assumes using tailwind
const hide = (el) => {
  // Alternative: Use hidden attribute (display: block)
  el.className += ' hidden';
};

const unHide = (el) => {
  // Convert DOM list (https://stackoverflow.com/questions/3199588/fastest-way-to-convert-javascript-nodelist-to-array)
  const classList = [...el.classList];
  // Turn array back to string and assign to className
  el.className = classList
    .filter((className) => className !== 'hidden')
    .join(' ');
};

const getClassList = (el) => {
  return [...el.classList];
};

const showEditTitleInput = (el) => {
  const listTitle = el;

  // Important: Need to store for later possible use in setTitle()
  recentCurrentTitle = listTitle.textContent.trim();

  const listTitleInput =
    listTitle.parentElement.querySelector('input[type="text"]');

  hide(listTitle);
  unHide(listTitleInput);

  listTitleInput.focus();
  listTitleInput.setAttribute('value', listTitle.textContent.trim());
  listTitleInput.select();
};

const setTitle = (el) => {
  const listTitleInput = el;
  const listTitle = listTitleInput.parentElement.querySelector('h2');

  hide(listTitleInput);
  unHide(listTitle);

  const inputValue = listTitleInput.value;

  // If user enters empty value, use fallback recentCurrentTitle for both elements
  listTitle.textContent = inputValue || recentCurrentTitle;
  listTitleInput.value = inputValue || recentCurrentTitle;
};

// =====================================================================

// State
let recentCurrentTitle;

const addListBtn = document.querySelector('#add-list-btn');
onClick.bind(addListBtn)((e) => {
  hide(addListBtn);
  unHide(addListForm);
  addListForm.querySelector('input[type="text"]').focus();
});

const cancelAddListBtn = document.querySelector('#cancel-add-list-btn');
onClick.bind(cancelAddListBtn)((e) => {
  hide(addListForm);
  unHide(addListBtn);
});

const addListForm = document.forms['add-list-form'];
onSubmit.bind(addListForm)((e) => {
  e.preventDefault();
  const value = addListForm.querySelector('input[type="text"]').value;
  if (!value) return;

  // create and add list
  // - li
  // - header
  // - ul
  // - div (footer)

  const li = document.createElement('li');
  const listHeader = document.createElement('header');
  const ul = document.createElement('ul');
  const div = document.createElement('div');

  li.className =
    'bg-[rgb(241,242,244)] w-[272px] rounded-xl p-2 space-y-2 self-start';

  const listH2 = document.createElement('h2');
  listH2.setAttribute('tabindex', '0');
  listH2.className =
    'px-3 py-2 font-semibold rounded-md cursor-pointer list-title';
  listH2.textContent = value;

  const titleInput = document.createElement('input');
  titleInput.setAttribute('type', 'text');
  titleInput.className =
    'hidden w-full px-3 py-2 font-semibold rounded-md edit-list-title-input';

  listHeader.appendChild(listH2);
  listHeader.appendChild(titleInput);

  li.appendChild(listHeader);

  activeLists.appendChild(li);
});

const activeLists = document.querySelector('#active-lists');
onFocusIn.bind(activeLists)((e) => {
  // Handle focus on list titles
  if (getClassList(e.target).includes('list-title')) {
    showEditTitleInput(e.target);
  }
});

onClick.bind(activeLists)((e) => {
  // Handle clicks on list titles
  if (getClassList(e.target).includes('list-title')) {
    showEditTitleInput(e.target);
  }
});

onFocusOut.bind(activeLists)((e) => {
  // Set title when input loses focus
  if (getClassList(e.target).includes('edit-list-title-input')) {
    setTitle(e.target);
  }
});

onKeyUp.bind(activeLists)((e) => {
  // Handle `enter` event on edit list title input
  // https://stackoverflow.com/questions/71111186/how-to-press-the-enter-key-inside-an-input-field-with-pure-javascript-or-jquery
  if (
    getClassList(e.target).includes('edit-list-title-input') &&
    e.keyCode === 13
  ) {
    setTitle(e.target);
  }
});
