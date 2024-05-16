// Must use normal function because of `this`.
// Must also bind to element before calling.
function handleEvent(eventName) {
  return function (fn) {
    this.addEventListener(eventName, (event) => {
      fn(event);
    });
  };
}

const addClass = (classToAdd) => (el) => {
  el.classList.add(classToAdd);
};

const removeClass = (classToRemove) => (el) => {
  el.classList.remove(classToRemove);
};

const onClick = handleEvent('click');
const onMouseDown = handleEvent('mousedown');
const onMouseUp = handleEvent('mouseup');
const onSubmit = handleEvent('submit');
const onFocusIn = handleEvent('focusin');
const onFocusOut = handleEvent('focusout');
const onKeyUp = handleEvent('keyup');
const onDrag = handleEvent('dragstart');
const onDragEnd = handleEvent('dragend');

// Assumes using tailwind
const hide = addClass('hidden');
const unHide = removeClass('hidden');

const getClassList = (el) => {
  return [...el.classList];
};

// =====================================================================

const addNewList = (parentEl, title) => {
  const li = document.createElement('li');
  li.className = 'relative list-drop-zone';

  const shadowDiv = document.createElement('div');
  shadowDiv.hidden = true;
  shadowDiv.className =
    'absolute w-full h-full list-shadow rounded-xl bg-gradient-to-b from-[#908c8c] to-[#0079bf] to-35% z-[2]';

  const draggableDiv = document.createElement('div');
  draggableDiv.setAttribute('draggable', 'true');
  draggableDiv.className =
    // relative + z-index removes parent bg when dragging element
    'list w-[272px] self-start relative z-[1]';

  const innerDiv = document.createElement('div');
  innerDiv.className =
    'w-full absolute bg-[rgb(241,242,244)] rounded-xl p-2 space-y-2';

  const listH2 = document.createElement('h2');
  listH2.setAttribute('tabindex', '0');
  listH2.className =
    'px-3 pt-1 pb-2 font-semibold rounded-md cursor-pointer list-title';
  listH2.textContent = title;

  const titleInput = document.createElement('input');
  titleInput.setAttribute('type', 'text');
  titleInput.className =
    'hidden w-full px-3 py-2 font-semibold rounded-md edit-list-title-input';

  const listHeader = document.createElement('header');
  listHeader.appendChild(listH2);
  listHeader.appendChild(titleInput);

  const ul = document.createElement('ul');
  ul.className = 'space-y-2';

  const div = document.createElement('div');
  div.className = 'py-1';

  const addCardBtn = document.createElement('button');
  addCardBtn.className =
    'w-full px-3 py-2 rounded-xl font-[500] flex items-center space-x-2 text-[#44546f] hover:bg-[#091e420f]';
  addCardBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-plus" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="#44546f" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg><span> Add a card </span>';
  div.appendChild(addCardBtn);

  innerDiv.appendChild(listHeader);
  innerDiv.appendChild(ul);
  innerDiv.appendChild(div);

  draggableDiv.appendChild(innerDiv);

  li.appendChild(shadowDiv);
  li.appendChild(draggableDiv);

  parentEl.appendChild(li);
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
  const input = addListForm.querySelector('input[type="text"]');
  const value = input.value;
  if (!value) return;

  addNewList(activeLists, value);

  input.value = '';
});

const activeLists = document.querySelector('#active-lists');

onMouseUp.bind(activeLists)((e) => {
  // Handle clicks on list titles (i.e. only focus on input if user is clicking, not when holding to drag)
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
  // Handle `tab` event on title
  // This is required, to trigger input when title focued on with tab;
  // couldn't use normal focusin because that conflicted w/ dragging feature
  if (getClassList(e.target).includes('list-title') && e.keyCode === 9) {
    showEditTitleInput(e.target);
  }

  // Handle `enter` event on edit list title input
  // https://stackoverflow.com/questions/71111186/how-to-press-the-enter-key-inside-an-input-field-with-pure-javascript-or-jquery
  if (
    getClassList(e.target).includes('edit-list-title-input') &&
    e.keyCode === 13
  ) {
    setTitle(e.target);
  }
});

// Handle drag
onDrag.bind(activeLists)((e) => {
  if (getClassList(e.target).includes('list')) {
    const list = e.target;
    const dropZone = list.parentElement;
    const listShadow = dropZone.querySelector('.list-shadow');

    setTimeout(() => {
      listShadow.hidden = false;
    }, 0);
  }
});

// Handle drag end
onDragEnd.bind(activeLists)((e) => {
  if (getClassList(e.target).includes('list')) {
    const list = e.target;
    const dropZone = list.parentElement;
    const listShadow = dropZone.querySelector('.list-shadow');

    listShadow.hidden = true;
  }
});
