import { CONSTANTS, DOM, Mode, state } from './constants.js';

// ----------- IO
export function fetchEvents(callback) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_fetchEvents');

  const request = new XMLHttpRequest();
  request.open('GET', CONSTANTS.backendURL);
  request.send();

  // eslint-disable-next-line func-names
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // state.set({ events: JSON.parse(request.responseText) })
      // state.dumpToConsole()

      if (typeof callback === 'function') {
        callback(JSON.parse(request.responseText));
      }
    }
  };
}

export function pushNewEvent(callback, selectedEvent) {
  if (CONSTANTS.enableLogging) {
    console.log('FUNCTION_pushNewEvent:', selectedEvent);
  }

  const request = new XMLHttpRequest();
  request.open('POST', CONSTANTS.backendURL);
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send(JSON.stringify(selectedEvent));

  // eslint-disable-next-line func-names
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 201) {
      if (typeof callback === 'function') {
        callback();
      }
    }
  };
}

export function pushUpdatedEvent(callback, selectedEvent) {
  if (CONSTANTS.enableLogging) {
    console.log('FUNCTION_pushNewEvent:', selectedEvent);
  }

  const request = new XMLHttpRequest();
  request.open('PUT', `${CONSTANTS.backendURL}/${selectedEvent.id}`, true);
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send(JSON.stringify(selectedEvent));

  // eslint-disable-next-line func-names
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      if (typeof callback === 'function') {
        callback();
      }
    }
  };
}

export function deleteEvent(callback, selectedEvent) {
  if (CONSTANTS.enableLogging) {
    console.log('FUNCTION_deleteEvent:', selectedEvent);
  }

  const request = new XMLHttpRequest();
  request.open('DELETE', `${CONSTANTS.backendURL}/${selectedEvent.id}`, true);
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send();

  // eslint-disable-next-line func-names
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 204) {
      if (typeof callback === 'function') {
        callback(selectedEvent);
      }
    }
  };
}

// ----------- CLICK HANDLERS
export function addButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_addButtonClickHandler');

  state.activeEvent.set(CONSTANTS.newRowID);
}

export function editButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_editButtonClickHandler');

  const events = state.selectedEvents.get();
  const activeEvent = events.pop();

  toggleRowSelection(activeEvent);

  state.activeEvent.set(activeEvent);
  state.selectedEvents.set(events);
}

export function saveButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_saveButtonClickHandler');

  const activeEventID = state.activeEvent.get();
  // Abort if no event is active
  if (!activeEventID) {
    return;
  }

  const editedEvent = createEventOutOfRow(activeEventID);

  const isValidEvent = validateEvent(editedEvent);

  const saveEventCallback = () => {
    const events = state.allEvents.get();
    const index = events.findIndex(e => e.id === editedEvent.id);

    if (index === -1) {
      state.allEvents.set([...events, editedEvent]);
    } else {
      events[index] = editedEvent;
      state.allEvents.set(events);
    }

    state.activeEvent.set(null);
  };

  if (isValidEvent) {
    // Check edited event is new by its ID
    if (editedEvent.id === CONSTANTS.newRowID) {
      pushNewEvent(saveEventCallback, editedEvent);
    } else {
      pushUpdatedEvent(saveEventCallback, editedEvent);
    }
  } else {
    // TODO: SPRINT 3 --> React to bad validation
    alert('INVALID');
  }
}

export function cancelButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_cancelButtonClickHandler');

  switch (state.mode.get()) {
    case Mode.SELECTING:
      // Reset selection visually and in state
      state.selectedEvents.get().forEach(rowId => {
        document.getElementById(rowId).style.background = '';
      });
      state.selectedEvents.set([]);
      break;
    case Mode.EDITING:
      // TODO: Styled prompt
      if (!confirm('Ungespeicherte Änderung werden verworfen. Fortfahren?')) {
        break;
      }

      if (state.activeEvent.get() === CONSTANTS.newRowID) {
        // Delete new table row, if exists
        if (DOM.tBody.rows[0].id === 'NEW') {
          DOM.tBody.deleteRow(0);
        } else {
          break;
        }
      } else {
        lockTableRow(state.activeEvent.get());
        state.selectedEvents.set(state.selectedEvents.previousState);
      }

      state.activeEvent.set(null);
      break;
    default:
      break;
  }
}

export function deleteButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_deleteEvents');

  if (!confirm('Alle ausgewählten Events werden gelöscht. Fortfahren?')) {
    return;
  }

  let deleteableEvents = collectSelectedEvents();
  const deletedEvents = [];

  for (let i = 0; i < deleteableEvents.length; i++) {
    deleteEvent(event => {
      document.getElementById(event.id).classList.add('fade-out');

      deleteableEvents = deleteableEvents.filter(e => e.id !== event.id);
      deletedEvents.push(event);

      if (deleteableEvents.length === 0) {
        setTimeout(() => {
          const updatedEvents = state.allEvents
            .get()
            .filter(e => !deletedEvents.includes(e));
          state.allEvents.set(updatedEvents);
          state.selectedEvents.set([]);
        }, 750);
      }
    }, deleteableEvents[i]);
  }
}

export function printButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_printTable');

  const printableEvents = collectSelectedEvents();
  const table = document.createElement('table');

  const tHeader = document.createElement('thead');
  for (const column of CONSTANTS.orderedEventDefinitions) {
    const headerCell = document.createElement('th');
    headerCell.textContent = column.presentationLabel;
    tHeader.appendChild(headerCell);
  }
  table.appendChild(tHeader);

  const tBody = document.createElement('tbody');
  printableEvents.forEach(event => {
    const tRow = tBody.insertRow(0);
    // eslint-disable-next-line no-restricted-syntax
    for (const column of CONSTANTS.orderedEventDefinitions) {
      const tCell = tRow.insertCell(-1);
      tCell.textContent = event[column.dataLabel];
    }
  });
  table.appendChild(tBody);

  // new empty window
  const printWin = window.open('');
  // fill tabledata in new window
  printWin.document.write(table.outerHTML);
  // function to open printdialog
  printWin.print();
  // close the "new page" after printing
  printWin.close();
}

export function onSelectRowHandler(mouseEvent) {
  // Prevent selecting rows when editing
  if (state.mode.get() === Mode.EDITING) {
    return;
  }

  const row = mouseEvent.composedPath().find(node => node.tagName === 'TR');

  // Prevent selecting borders
  // const rowID = mouseEvent.path[2].id;
  const rowID = row.id;
  if (rowID === 'tableBody' || rowID === 'tableEvents') {
    return;
  }

  toggleRowSelection(rowID);
}

export function onKeyDownHandler(event) {
  if (event.target === DOM.searchField) {
    return;
  }

  const isInputField =
    event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT';
  let activeRow;
  let nextElementID;

  switch (event.key) {
    case 'n':
      if (typeof DOM.addButton.onclick === 'function') {
        DOM.addButton.click();
        event.preventDefault();
      }
      break;
    case 'e':
      if (typeof DOM.editButton.onclick === 'function') {
        DOM.editButton.click();
        event.preventDefault();
      }
      break;
    case 's':
      if (typeof DOM.saveButton.onclick === 'function' && !isInputField) {
        DOM.saveButton.click();
        // event.preventDefault();
      }
      break;
    case 'c':
    case 'Escape':
      if (typeof DOM.cancelButton.onclick === 'function' && !isInputField) {
        DOM.cancelButton.click();
        event.preventDefault();
      }
      break;
    case 'Delete':
    case 'd':
      if (typeof DOM.deleteButton.onclick === 'function' && !isInputField) {
        DOM.deleteButton.click();
        event.preventDefault();
      }
      break;
    case 'p':
      if (typeof DOM.printButton.onclick === 'function') {
        DOM.printButton.click();
        event.preventDefault();
      }
      break;
    case 'Enter':
      if (state.mode.get() === Mode.EDITING) {
        DOM.saveButton.click();
      } else if (event.target.tagName === 'TR') {
        toggleRowSelection(event.target.id);
        // event.preventDefault();
      }
      break;
    case 'ArrowDown':
      activeRow = document.activeElement;
      if (activeRow.tagName !== 'TR') {
        break;
      }

      nextElementID = getNthNextEventID(activeRow.id, -1);
      if (nextElementID) {
        document.getElementById(nextElementID).focus();
        // event.preventDefault();
      }
      break;
    case 'ArrowUp':
      activeRow = document.activeElement;
      if (activeRow.tagName !== 'TR') {
        break;
      }

      nextElementID = getNthNextEventID(activeRow.id, 1);
      if (nextElementID) {
        document.getElementById(nextElementID).focus();
        // event.preventDefault();
      }
      break;
    default:
      break;
  }
}

// ----------- UTILS

export function getNthNextEventID(eventID, n) {
  const events = state.displayedEvents.get();
  const nextIndex = events.findIndex(event => event.id === eventID) + n;

  if (nextIndex >= 0 && nextIndex < events.length) {
    return events[nextIndex].id;
  }
  return null;
}

export function renderTable(events) {
  if (CONSTANTS.enableLogging) {
    console.log('FUNCTION_renderTable');
  }

  while (DOM.tBody.firstChild) {
    DOM.tBody.firstChild.remove();
  }

  events.forEach(event => {
    const tRow = document.createElement('tr');

    tRow.setAttribute('id', event.id);
    tRow.setAttribute('tabIndex', '0');

    // Write event data to table
    // eslint-disable-next-line no-restricted-syntax
    for (const column of CONSTANTS.orderedEventDefinitions) {
      const cell = tRow.insertCell(-1);

      const inputField = column.inputField.cloneNode(false);
      
      inputField.setAttribute('disabled', '');
      inputField.value = event[column.dataLabel];

      cell.classList.add(column.dataLabel);
      cell.setAttribute('id', `${event.id}_${column.dataLabel}`);
      cell.setAttribute('data-title', column.presentationLabel);
      cell.appendChild(inputField);
    }
    DOM.tBody.prepend(tRow);
  });
}

export function filterEvents(events, filterText) {
  if (CONSTANTS.enableLogging) {
    console.log('FUNCTION_filterEvents:', filterText);
  }

  const matches = [];

  // do not filter if less than 3 characters were entered
  if (filterText.length < 3) {
    return { events, matches };
  }

  // filter events
  const displayedEvents = events.filter(event => {
    let isMatch = false;
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(event)) {
      if (value.toLowerCase().includes(filterText.toLowerCase())) {
        matches.push(`${event.id}_${key}`);
        isMatch = true;
      }
    }

    return isMatch;
  });

  return { events: displayedEvents, matches };
}

export function highlightFilterMatches(matches) {
  if (CONSTANTS.enableLogging) {
    console.log('FUNCTION_highlightFilterMatches:', matches);
  }

  matches.forEach(match => {
    document.getElementById(match).classList.add('highlight');
  });
}

export function toggleRowSelection(selectedRowID) {
  const tRow = document.getElementById(selectedRowID);

  let events = state.selectedEvents.get();

  // If row is already selected, unselect it
  if (events.includes(selectedRowID)) {
    tRow.style.background = '';
    events = events.filter(id => id !== selectedRowID);
  } else {
    tRow.style.background = 'antiquewhite';
    events.push(selectedRowID);
    events.sort();
  }

  state.selectedEvents.set(events);
}

export function createEventOutOfRow(rowID) {
  if (CONSTANTS.enableLogging) {
    console.log('FUNCTION_createEventOutOfRow:', rowID);
  }

  const { cells } = document.getElementById(rowID);

  return {
    id: rowID,
    title: cells[0].firstChild.value,
    description: cells[1].firstChild.value,
    date: cells[2].firstChild.value,
    time: cells[3].firstChild.value,
    place: cells[4].firstChild.value,
    contact: cells[5].firstChild.value,
    institute: cells[6].firstChild.value,
    entry: cells[7].firstChild.value,
  };
}

export function unlockTableRow(rowId) {
  const tRow = document.getElementById(rowId);

  for (const cell of tRow.cells) {
    cell.firstChild.removeAttribute('disabled');
  }
}

export function lockTableRow(rowId) {
  const tRow = document.getElementById(rowId);

  for (const cell of tRow.cells) {
    cell.firstChild.setAttribute('disabled', '');
  }
}

export function createEmptyRow() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_createEmptyRow');

  const tRow = DOM.tBody.insertRow(0);
  tRow.setAttribute('id', CONSTANTS.newRowID);
  tRow.setAttribute('tabIndex', '0');

  let cell;
  // eslint-disable-next-line no-restricted-syntax
  for (const column of CONSTANTS.orderedEventDefinitions) {
    cell = tRow.insertCell(-1);
    const inputField = column.inputField.cloneNode(true);

    inputField.value = '';

    cell.classList.add(column.dataLabel);
    cell.setAttribute('id', `${event.id}_${column.dataLabel}`);
    cell.setAttribute('data-title', column.presentationLabel);
    cell.appendChild(inputField);
  }

  return tRow;
}

export function setFocusOnRow(rowID) {
  // Set focus on row -> first cell -> text area
  if (rowID) {
    document.getElementById(rowID).firstChild.firstChild.focus();
  }
}

export function validateEvent(event) {
  // TODO: FRONTEND VALIDATION LOGIC

  return Object.values(event).every(prop => prop !== '' && prop !== null);
}

export function collectSelectedEvents() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_collectSelectedEvents');

  const selectedEvents = state.selectedEvents.get();
  const displayedEvents = state.displayedEvents.get();
  const mode = state.mode.get();

  if (mode === Mode.CLEAN) {
    return displayedEvents;
  }
  return displayedEvents.filter(event => selectedEvents.includes(event.id));
}

// Action bar setters
export const ButtonConfig = {
  addButton: {
    [Mode.CLEAN]: {
      classes: ['big'],
      onclick: addButtonClickHandler,
    },
    [Mode.SELECTING]: {
      classes: ['big'],
      onclick: addButtonClickHandler,
    },
    [Mode.EDITING]: {
      classes: ['big', 'disabled'],
      onclick: null,
    },
  },
  editButton: {
    [Mode.CLEAN]: {
      classes: ['disabled'],
      onclick: null,
    },
    [Mode.SELECTING]: {
      classes: ['big'],
      onclick: editButtonClickHandler,
    },
    [Mode.EDITING]: {
      classes: ['disabled'],
      onclick: null,
    },
  },
  saveButton: {
    [Mode.CLEAN]: {
      classes: ['disabled'],
      onclick: null,
    },
    [Mode.SELECTING]: {
      classes: ['disabled'],
      onclick: null,
    },
    [Mode.EDITING]: {
      classes: ['big'],
      onclick: saveButtonClickHandler,
    },
  },
  cancelButton: {
    [Mode.CLEAN]: {
      classes: ['disabled'],
      onclick: null,
    },
    [Mode.SELECTING]: {
      classes: [],
      onclick: cancelButtonClickHandler,
    },
    [Mode.EDITING]: {
      classes: [],
      onclick: cancelButtonClickHandler,
    },
  },
  deleteButton: {
    [Mode.CLEAN]: {
      classes: ['disabled'],
      onclick: null,
    },
    [Mode.SELECTING]: {
      classes: [],
      onclick: deleteButtonClickHandler,
    },
    [Mode.EDITING]: {
      classes: ['disabled'],
      onclick: null,
    },
  },
  printButton: {
    [Mode.CLEAN]: {
      classes: [],
      onclick: printButtonClickHandler,
    },
    [Mode.SELECTING]: {
      classes: [],
      onclick: printButtonClickHandler,
    },
    [Mode.EDITING]: {
      classes: ['disabled'],
      onclick: null,
    },
  },
};

export function setActionBarToMode(mode) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_setActionBarToMode');

  const setButtonToConfig = (button, config) => {
    button.classList.remove('big');
    button.classList.remove('disabled');
    button.classList.add(...config.classes);
    button.onclick = config.onclick;
  };

  setButtonToConfig(DOM.addButton, ButtonConfig.addButton[mode]);
  setButtonToConfig(DOM.editButton, ButtonConfig.editButton[mode]);
  setButtonToConfig(DOM.saveButton, ButtonConfig.saveButton[mode]);
  setButtonToConfig(DOM.cancelButton, ButtonConfig.cancelButton[mode]);
  setButtonToConfig(DOM.deleteButton, ButtonConfig.deleteButton[mode]);
  setButtonToConfig(DOM.printButton, ButtonConfig.printButton[mode]);
}
