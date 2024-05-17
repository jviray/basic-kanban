// Must use normal function because of `this`.
// Must also bind to element before calling.
function handleEvent(eventName) {
  return function (fn) {
    this.addEventListener(eventName, function (event) {
      fn(event);
    });
  };
}

const addClasses = (classes) => (el) => {
  if (Array.isArray(classes)) {
    el.classList.add(...classes);
  }

  el.classList.add(classes);
};

const removeClasses = (classes) => (el) => {
  if (Array.isArray(classes)) {
    el.classList.remove(...classes);
  }

  el.classList.remove(classes);
};

const onClick = handleEvent('click');
const onMouseDown = handleEvent('mousedown');
const onMouseUp = handleEvent('mouseup');
const onSubmit = handleEvent('submit');
const onFocusIn = handleEvent('focusin');
const onFocusOut = handleEvent('focusout');
const onKeyUp = handleEvent('keyup');
const onDragStart = handleEvent('dragstart');
const onDragOver = handleEvent('dragover');
const onDragEnd = handleEvent('dragend');

// Assumes using tailwind
const hide = addClasses('hidden');
const unHide = removeClasses('hidden');

const getClassList = (el) => {
  return [...el.classList];
};

// =====================================================================

const addNewList = (parentEl, title) => {
  const listDropArea = document.createElement('li');
  listDropArea.className =
    'w-[272px] h-full border border-black list-drop-area rounded-xl';

  const list = document.createElement('div');
  list.setAttribute('draggable', 'true');
  list.className =
    // relative + z-index removes parent bg when dragging element
    'draggable-list w-full self-start relative z-[1] bg-[rgb(241,242,244)] rounded-xl p-2 space-y-2';

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

  const cardList = document.createElement('ul');
  cardList.className = 'space-y-2';

  const listFooter = document.createElement('div');
  listFooter.className = 'py-1';

  const addCardBtn = document.createElement('button');
  addCardBtn.className =
    'w-full px-3 py-2 rounded-xl font-[500] flex items-center space-x-2 text-[#44546f] hover:bg-[#091e420f]';
  addCardBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-plus" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="#44546f" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg><span> Add a card </span>';
  listFooter.appendChild(addCardBtn);

  list.appendChild(listHeader);
  list.appendChild(cardList);
  list.appendChild(listFooter);

  listDropArea.appendChild(list);

  parentEl.appendChild(listDropArea);
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
const lists = document.querySelectorAll('.draggable-list');
for (const list of lists) {
  onDragStart.bind(list)((e) => {
    list.setAttribute('id', 'dragging-element');
    addClasses('opacity-[.4]')(list);
  });

  onDragEnd.bind(list)((e) => {
    list.removeAttribute('id');
    removeClasses('opacity-[.4]')(list);
  });
}

onDragOver.bind(activeLists)((e) => {
  e.preventDefault();
  const nextList = insertBeforeList(activeLists, e.clientX);
  const draggingList = document.querySelector('#dragging-element');

  // Moving Right
  // if (!nextList) {
  //   activeLists.appendChild(draggingList.parentElement);
  // } else {
  //   activeLists.insertBefore(
  //     draggingList.parentElement,
  //     nextList.parentElement
  //   );
  // }

  // Moving Left
  if (!nextList) {
    activeLists.prepend(draggingList.parentElement);
  } else {
    activeLists.insertBefore(
      draggingList.parentElement,
      nextList.parentElement.nextSibling
    );
  }
});

const insertBeforeList = (sortingParent, mouseX) => {
  // Get all lists except the one dragging
  const lists = sortingParent.querySelectorAll(
    '.draggable-list:not(#dragging-element)'
  );

  // Moving Right
  // let closestList = null;
  // let closestOffset = Number.NEGATIVE_INFINITY;

  // lists.forEach((list) => {
  //   // Get x-axis position of left side of list
  //   const { left } = list.getBoundingClientRect();
  //   const offset = mouseX - left;

  //   if (offset < 0 && offset > closestOffset) {
  //     // This is closest list
  //     closestList = list;
  //     closestOffset = offset;
  //   }
  // });

  // Moving Left
  let closestList = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  lists.forEach((list) => {
    // Get x-axis position of right side of list
    const { right } = list.getBoundingClientRect();
    const offset = right - mouseX;

    if (offset < 0 && offset > closestOffset) {
      // This is closest list
      closestList = list;
      closestOffset = offset;
    }
  });

  return closestList;
};
