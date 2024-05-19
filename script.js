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
const onSubmit = handleEvent('submit');
const onFocusOut = handleEvent('focusout');
const onKeyUp = handleEvent('keyup');
const onDragStart = handleEvent('dragstart');
const onDragOver = handleEvent('dragover');
const onDragEnd = handleEvent('dragend');

// Assumes using tailwind
const hide = addClasses('hidden');
const unHide = removeClasses('hidden');

// =====================================================================

const addNewList = (parentEl, title) => {
  const listDropArea = document.createElement('li');
  listDropArea.className = 'w-[272px] h-full list-drop-area rounded-xl';

  const list = document.createElement('div');
  list.setAttribute('draggable', 'true');
  list.className =
    // relative + z-index => removes parent bg when dragging element
    'draggable-list w-full self-start relative z-[1] bg-[rgb(241,242,244)] rounded-xl p-2 space-y-2';

  const listHeader = document.createElement('header');
  listHeader.className = 'flex items-center gap-2';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'w-full';

  const listH2 = document.createElement('h2');
  listH2.setAttribute('tabindex', '0');
  listH2.className =
    'px-3 py-2 font-semibold rounded-md cursor-pointer list-title';
  listH2.textContent = title;

  const titleInput = document.createElement('input');
  titleInput.setAttribute('type', 'text');
  titleInput.className =
    'hidden w-full px-3 py-2 font-semibold rounded-md edit-list-title-input';

  headerDiv.appendChild(listH2);
  headerDiv.appendChild(titleInput);

  const deleteListBtn = document.createElement('button');
  deleteListBtn.setAttribute('type', 'button');
  deleteListBtn.className =
    'delete-list-btn p-1.5 rounded-md hover:bg-[#091e420f]';
  deleteListBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>';

  listHeader.appendChild(headerDiv);
  listHeader.appendChild(deleteListBtn);

  const cardList = document.createElement('ul');
  cardList.className = 'space-y-2';

  const listFooter = document.createElement('div');

  const addCardForm = document.createElement('form');
  addCardForm.className = 'hidden pb-2 space-y-2 add-card-form';

  const newCardTextArea = document.createElement('textarea');
  newCardTextArea.placeholder = 'Enter a title for this card...';
  newCardTextArea.className =
    'w-full px-3 py-2 text-left border border-gray-200 rounded-md shadow-md resize-none focus:outline-none';

  const addCardFormFooter = document.createElement('div');
  addCardFormFooter.className = 'flex items-center space-x-2';

  const submitCardBtn = document.createElement('button');
  submitCardBtn.setAttribute('type', 'submit');
  submitCardBtn.className =
    'confirm-add-card-btn bg-[#0c66e4] text-white py-1.5 px-3 font-semibold rounded-md';
  submitCardBtn.textContent = 'Add card';

  const cancelCardBtn = document.createElement('button');
  cancelCardBtn.setAttribute('type', 'button');
  cancelCardBtn.className =
    'cancel-add-card-btn p-1.5 rounded-md hover:bg-[#091e420f]';
  cancelCardBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>';

  addCardFormFooter.appendChild(submitCardBtn);
  addCardFormFooter.appendChild(cancelCardBtn);

  addCardForm.appendChild(newCardTextArea);
  addCardForm.appendChild(addCardFormFooter);

  // Handle click submit new card
  onSubmit.bind(addCardForm)((e) => {
    e.preventDefault();

    submitNewCard(addCardForm);
  });

  // Handle `enter` submit new card
  onKeyUp.bind(addCardForm)((e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      submitNewCard(addCardForm);
    }
  });

  const addCardBtnContainer = document.createElement('div');
  addCardBtnContainer.className = 'py-1';

  const addCardBtn = document.createElement('button');
  addCardBtn.className =
    'add-card-btn w-full px-3 py-2 rounded-xl font-[500] flex items-center space-x-2 text-[#44546f] hover:bg-[#091e420f]';
  addCardBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-plus" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="#44546f" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg><span> Add a card </span>';

  onClick.bind(addCardBtn)((e) => {
    hide(addCardBtn.parentElement);

    const addCardForm = addCardBtn.parentElement.previousElementSibling;
    unHide(addCardForm);

    addCardForm.querySelector('textarea').focus();
  });

  addCardBtnContainer.appendChild(addCardBtn);

  listFooter.appendChild(addCardForm);
  listFooter.appendChild(addCardBtnContainer);

  list.appendChild(listHeader);
  list.appendChild(cardList);
  list.appendChild(listFooter);

  listDropArea.appendChild(list);

  parentEl.appendChild(listDropArea);

  // Ensure activeLists container has proper spacing when children inside
  if (parentEl.children.length > 0) {
    parentEl.hidden = false;
  }
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

const addNewCard = (cardList, description) => {
  const cardDropArea = document.createElement('li');
  cardDropArea.className = 'rounded-md card-drop-area';

  const card = document.createElement('div');
  card.setAttribute('draggable', 'true');
  card.className =
    'px-3 py-2 bg-white border border-gray-200 rounded-md shadow-md draggable-card relative z-[1]';
  card.textContent = description;

  cardDropArea.appendChild(card);

  cardList.appendChild(cardDropArea);
};

const submitNewCard = (form) => {
  const textArea = form.querySelector('textarea');
  const value = textArea.value;
  if (!value) return;

  const cardList = form.parentElement.previousElementSibling;
  addNewCard(cardList, value);

  textArea.focus();
  textArea.value = '';
};

const getClosestOption = (availableOptions, mousePositionX) => {
  let closestOption = {
    left: null,
    right: null,
  };

  let offsets = {
    left: Number.NEGATIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
  };

  availableOptions.forEach((option) => {
    // Get x-axis position of left side of option
    const { left: leftSide, right: rightSide } = option.getBoundingClientRect();

    // TODO Create helper function
    const leftOffset = mousePositionX - leftSide;
    if (leftOffset < 0 && leftOffset > offsets.left) {
      // Set closest left option
      closestOption.left = option;
      offsets.left = leftOffset;
    }

    const rightOffset = rightSide - mousePositionX;
    if (rightOffset < 0 && rightOffset > offsets.right) {
      // Set closest right option
      closestOption.right = option;
      offsets.right = rightOffset;
    }
  });

  return { closestOption, offsets };
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
onClick.bind(activeLists)((e) => {
  // Handle clicks on list titles (i.e. only focus on input if user is clicking title area AND not when holding to drag)
  if (e.target.classList.contains('list-title')) {
    showEditTitleInput(e.target);
  }

  // Handle delete list via button
  if (e.target.closest('button')?.classList.contains('delete-list-btn')) {
    const list = e.target.closest('li');
    activeLists.removeChild(list);

    // Hide activeLists div when no children (fixes spacing)
    if (activeLists.children.length === 0) {
      activeLists.hidden = true;
    }
  }
});

onFocusOut.bind(activeLists)((e) => {
  // Set title when input loses focus
  if (e.target.classList.contains('edit-list-title-input')) {
    setTitle(e.target);
  }
});

onKeyUp.bind(activeLists)((e) => {
  // Handle `tab` event on title
  // This is required, to trigger input when title focued on with tab;
  // couldn't use normal focusin because that conflicted w/ dragging feature
  if (e.target.classList.contains('list-title') && e.keyCode === 9) {
    showEditTitleInput(e.target);
  }

  // Handle `enter` event on edit list title input
  // https://stackoverflow.com/questions/71111186/how-to-press-the-enter-key-inside-an-input-field-with-pure-javascript-or-jquery
  if (
    e.target.classList.contains('edit-list-title-input') &&
    e.keyCode === 13
  ) {
    setTitle(e.target);
  }
});

// Handle list drag
onDragStart.bind(activeLists)((e) => {
  if (e.target.classList.contains('draggable-list')) {
    const list = e.target;
    list.setAttribute('id', 'dragging-element');
    addClasses('opacity-[.4]')(list);
  }
});

onDragEnd.bind(activeLists)((e) => {
  if (e.target.classList.contains('draggable-list')) {
    const list = e.target;
    list.removeAttribute('id');
    removeClasses('opacity-[.4]')(list);
  }
});

onDragOver.bind(activeLists)((e) => {
  e.preventDefault();
  // Get all lists except the one dragging
  const availableOptions = activeLists.querySelectorAll(
    '.draggable-list:not(#dragging-element)'
  );
  const { closestOption, offsets } = getClosestOption(
    availableOptions,
    e.clientX
  );
  const draggingList = document.querySelector('#dragging-element');

  if (closestOption.left && closestOption.right) {
    // Choose between two whichever closest
    let nextList;
    if (offsets.left > offsets.right) {
      nextList = closestOption.left;

      activeLists.insertBefore(
        draggingList.parentElement,
        closestOption.left.parentElement
      );
    } else if (offsets.left < offsets.right) {
      nextList = closestOption.right;
      activeLists.insertBefore(
        draggingList.parentElement,
        closestOption.right.parentElement.nextSibling
      );
    }
  } else if (closestOption.left) {
    // Shift left

    // Need to do equivalent of prepending to the start

    if (draggingList.parentElement === activeLists.children[1]) {
      activeLists.prepend(draggingList.parentElement);
    } else {
      activeLists.insertBefore(
        draggingList.parentElement,
        closestOption.left.parentElement
      );
    }
  } else if (closestOption.right) {
    // Shift right

    // Need to do equivalent of prepending to the start

    if (
      draggingList.parentElement ===
      activeLists.children[activeLists.children.length - 2] // Check if second to last!
    ) {
      activeLists.append(draggingList.parentElement);
    } else {
      activeLists.insertBefore(
        draggingList.parentElement,
        closestOption.right.parentElement.nextSibling
      );
    }
  }
});

// Delete later
const addCardBtns = document.querySelectorAll('.add-card-btn');
addCardBtns.forEach((addCardBtn) => {
  onClick.bind(addCardBtn)((e) => {
    hide(addCardBtn.parentElement);

    const addCardForm = addCardBtn.parentElement.previousElementSibling;
    unHide(addCardForm);

    addCardForm.querySelector('textarea').focus();
  });
});

// Delete later
// Handle click submit new card
const addCardForm = document.querySelector('.add-card-form');
onSubmit.bind(addCardForm)((e) => {
  e.preventDefault();

  submitNewCard(addCardForm);
});

// Delete later
// Handle `enter` submit new card
onKeyUp.bind(addCardForm)((e) => {
  if (e.keyCode === 13 && !e.shiftKey) {
    submitNewCard(addCardForm);
  }
});
