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

const addListBtn = document.querySelector('#add-list-btn');
onClick.bind(addListBtn)((e) => {
  hide(addListBtn);
  unHide(addListForm);
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
  console.log(value);
});

const activeLists = document.querySelector('#active-lists');
