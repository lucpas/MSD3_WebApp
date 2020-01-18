/* eslint-disable prefer-destructuring */
import {
  CONSTANTS, DOM, Mode, state,
} from './constants.js';

// ----------- IO
export function fetchEvents(callback) {
  const request = new XMLHttpRequest();
  request.open('GET', `${CONSTANTS.backendURL}/events`);
  request.send();

  // eslint-disable-next-line func-names
  request.onreadystatechange = function () {
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
  const request = new XMLHttpRequest();
  request.open('POST', `${CONSTANTS.backendURL}/events`);
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send(JSON.stringify(selectedEvent));

  // eslint-disable-next-line func-names
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 201) {
      if (typeof callback === 'function') {
        callback();
      }
    }
  };
}

export function pushEventForValidation(event, async, successCB, errorCB) {
  const request = new XMLHttpRequest();
  request.open('POST', `${CONSTANTS.backendURL}/events?validate=true`, async);
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  const json = JSON.stringify(event);
  request.send(json);

  if (async) {
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          if (typeof successCB === 'function') {
            successCB();
          }
        } else if (this.status === 400) {
          if (typeof errorCB === 'function') {
            const errors = JSON.parse(request.responseText).errors;
            errorCB(errors);
          }
        }
      }
    };
  } else if (request.status === 400) {
    return JSON.parse(request.responseText).errors;
  }
}

export function pushUpdatedEvent(callback, selectedEvent) {
  const request = new XMLHttpRequest();
  request.open(
    'PUT',
    `${CONSTANTS.backendURL}/events/${selectedEvent.id}`,
    true,
  );
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send(JSON.stringify(selectedEvent));

  // eslint-disable-next-line func-names
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      if (typeof callback === 'function') {
        callback();
      }
    }
  };
}

export function deleteEvent(callback, selectedEvent) {
  const request = new XMLHttpRequest();
  request.open(
    'DELETE',
    `${CONSTANTS.backendURL}/events/${selectedEvent.id}`,
    true,
  );
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send();

  // eslint-disable-next-line func-names
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 204) {
      if (typeof callback === 'function') {
        callback(selectedEvent);
      }
    }
  };
}

export function importEvents() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'text/csv');
  input.addEventListener('change', handleFiles, false);
  let file;

  function handleFiles() {
    // const boundary = '----'

    file = this.files[0];
    const formData = new FormData();
    // formData.append('boundary', boundary);
    formData.append('readme.me', file, 'readme.me');
    // formData.append('boundary', boundary);
    const request = new XMLHttpRequest();
    request.open('POST', `${CONSTANTS.backendURL}/upload/csv`, true);
    // request.setRequestHeader('Content-type', 'multipart/form-data');
    // eslint-disable-next-line func-names
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          console.log('Successfully sent CSV');
        } else {
          console.log('failed to sent csv');
        }
      }
    };
    request.send(file);
  }
  input.click();

  return false; // avoiding navigation
}

export function exportCSVEvents() {
  const request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const downloadUrl = URL.createObjectURL(request.response);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = downloadUrl;
      a.download = '';
      a.click();
    }
  };
  request.open('GET', `${CONSTANTS.backendURL}/download/csv`, true);
  request.responseType = 'blob';
  request.send();
}

export function exportPDFEvents() {
  const request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const downloadUrl = URL.createObjectURL(request.response);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = downloadUrl;
      a.download = '';
      a.click();
    }
  };
  request.open('GET', `${CONSTANTS.backendURL}/download/pdf`, true);
  request.responseType = 'blob';
  request.send();
}

// ----------- CLICK HANDLERS
export function addButtonClickHandler() {
  state.activeEvent.set(CONSTANTS.newRowID);
}

export function editButtonClickHandler() {
  const events = state.selectedEvents.get();
  const activeEvent = events.pop();

  toggleRowSelection(activeEvent);

  state.activeEvent.set(activeEvent);
  state.selectedEvents.set(events);
}

export function saveButtonClickHandler() {
  const activeEventID = state.activeEvent.get();
  // Abort if no event is active
  if (!activeEventID) {
    return;
  }

  const saveEventCallback = () => {
    const events = state.allEvents.get();
    const index = events.findIndex((e) => e.id === editedEvent.id);

    if (index === -1) {
      state.allEvents.set([...events, editedEvent]);
    } else {
      events[index] = editedEvent;
      state.allEvents.set(events);
    }

    state.activeEvent.set(null);
  };

  const editedEvent = createEventOutOfRow(activeEventID);
  const validationErrors = pushEventForValidation(editedEvent, false);

  if (!validationErrors) {
    // Check edited event is new by its ID
    if (editedEvent.id === CONSTANTS.newRowID) {
      pushNewEvent(saveEventCallback, editedEvent);
    } else {
      pushUpdatedEvent(saveEventCallback, editedEvent);
    }
  } else {
    // Create formatted error message
    let errorMessage = 'Ein oder oder mehrere Felder enhalten ungültige Eingaben:\n';

    Object.values(validationErrors).forEach(
      (error) => (errorMessage += `\n${error}`),
    );

    state.message.set({
      heading: 'Fehlerhafte Eingabe',
      text: errorMessage,
      backdropClickHandler: () => state.message.set(null),
      okButtonClickHandler: () => state.message.set(null),
      cancelButtonClickHandler: null,
    });
  }
}

export function cancelButtonClickHandler() {
  switch (state.mode.get()) {
    case Mode.SELECTING:
      // Reset selection visually and in state
      state.selectedEvents.get().forEach((rowId) => {
        document.getElementById(rowId).style.background = '';
      });
      state.selectedEvents.set([]);
      break;
    case Mode.EDITING:
      const successCallback = () => {
        if (state.activeEvent.get() === CONSTANTS.newRowID) {
          // Delete new table row, if exists
          if (DOM.tBody.rows[0].id === 'NEW') {
            DOM.tBody.deleteRow(0);
          } else {
            return;
          }
        } else {
          lockTableRow(state.activeEvent.get());
          state.selectedEvents.set(state.selectedEvents.previousState);
        }

        state.activeEvent.set(null);
      };

      state.message.set({
        heading: 'Event bearbeiten',
        text: 'Ungespeicherte Änderung werden verworfen. Fortfahren?',
        okButtonClickHandler: () => {
          successCallback();
          state.message.set(null);
        },
        cancelButtonClickHandler: () => state.message.set(null),
        backdropClickHandler: () => null,
      });
      break;
    default:
      break;
  }
}

export function deleteButtonClickHandler() {
  const successCallback = () => {
    let deleteableEvents = collectSelectedEvents();
    const deletedEvents = [];

    for (let i = 0; i < deleteableEvents.length; i++) {
      deleteEvent((event) => {
        document.getElementById(event.id).classList.add('fade-out');

        deleteableEvents = deleteableEvents.filter((e) => e.id !== event.id);
        deletedEvents.push(event);

        if (deleteableEvents.length === 0) {
          setTimeout(() => {
            const updatedEvents = state.allEvents
              .get()
              .filter((e) => !deletedEvents.includes(e));
            state.allEvents.set(updatedEvents);
            state.selectedEvents.set([]);
          }, 750);
        }
      }, deleteableEvents[i]);
    }
  };

  state.message.set({
    heading: 'Event(s) löschen',
    text: 'Alle ausgewählten Events werden gelöscht. Fortfahren?',
    okButtonClickHandler: () => {
      successCallback();
      state.message.set(null);
    },
    cancelButtonClickHandler: () => state.message.set(null),
    backdropClickHandler: null,
  });
}

export function printButtonClickHandler() {
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
  printableEvents.forEach((event) => {
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

  const row = mouseEvent.composedPath().find((node) => node.tagName === 'TR');

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

  const isInputField = event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT';
  let activeRow;
  let nextElementID;

  switch (event.key) {
    case 'n':
      if (typeof DOM.addButton.onclick === 'function') {
        DOM.addButton.onclick();
        event.preventDefault();
      }
      break;
    case 'e':
      if (typeof DOM.editButton.onclick === 'function') {
        DOM.editButton.onclick();
        event.preventDefault();
      }
      break;
    case 's':
      if (typeof DOM.saveButton.onclick === 'function' && !isInputField) {
        DOM.saveButton.onclick();
        // event.preventDefault();
      }
      break;
    case 'c':
    case 'Escape':
      if (typeof DOM.cancelButton.onclick === 'function' && !isInputField) {
        DOM.cancelButton.onclick();
        event.preventDefault();
      } else if (state.mode.get() === Mode.POPUP) {
        if (typeof DOM.popupCancelButton.onclick === 'function') {
          DOM.popupCancelButton.onclick();
        }
      }
      break;
    case 'Delete':
    case 'd':
      if (typeof DOM.deleteButton.onclick === 'function' && !isInputField) {
        DOM.deleteButton.onclick();
        event.preventDefault();
      }
      break;
    case 'p':
      if (typeof DOM.printButton.onclick === 'function') {
        DOM.printButton.onclick();
        event.preventDefault();
      }
      break;
    case 'Enter':
      if (state.mode.get() === Mode.EDITING) {
        if (typeof DOM.saveButton.onclick === 'function') {
          DOM.saveButton.onclick();
        }
      } else if (state.mode.get() === Mode.POPUP) {
        if (typeof DOM.popupOkButton.onclick === 'function') {
          DOM.popupOkButton.onclick();
        }
      } else if (event.target.tagName === 'TR') {
        toggleRowSelection(event.target.id);
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
  const nextIndex = events.findIndex((event) => event.id === eventID) + n;

  if (nextIndex >= 0 && nextIndex < events.length) {
    return events[nextIndex].id;
  }
  return null;
}

export function renderTable(events) {
  while (DOM.tBody.firstChild) {
    DOM.tBody.firstChild.remove();
  }

  events.forEach((event) => {
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
  const matches = [];

  // do not filter if less than 3 characters were entered
  if (filterText.length < 3) {
    return { events, matches };
  }

  // filter events
  const displayedEvents = events.filter((event) => {
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
  matches.forEach((match) => {
    document.getElementById(match).classList.add('highlight');
  });
}

export function toggleRowSelection(selectedRowID) {
  const tRow = document.getElementById(selectedRowID);

  let events = state.selectedEvents.get();

  // If row is already selected, unselect it
  if (events.includes(selectedRowID)) {
    tRow.style.background = '';
    events = events.filter((id) => id !== selectedRowID);
  } else {
    tRow.style.background = 'antiquewhite';
    events.push(selectedRowID);
    events.sort();
  }

  state.selectedEvents.set(events);
}

export function createEventOutOfRow(rowID) {
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
    cell.setAttribute('id', `${CONSTANTS.newRowID}_${column.dataLabel}`);
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

export function addValidationHandlersTo(eventID) {
  const inputFields = collectInputFieldsOfEvent(eventID);

  inputFields.forEach(
    (field) => (field.onblur = function () {
      const editedEvent = createEventOutOfRow(state.activeEvent.get());
      const dataLabel = this.parentElement.classList[0];

      pushEventForValidation(
        editedEvent,
        true,
        () => {
          this.classList.add('valid');
          this.classList.remove('invalid');
        },
        (errors) => {
          if (errors[dataLabel]) {
            this.classList.remove('valid');
            this.classList.add('invalid');
          } else {
            this.classList.add('valid');
            this.classList.remove('invalid');
          }
        },
      );
    }),
  );
}

export function removeValidationHandlersFrom(eventID) {
  const inputFields = collectInputFieldsOfEvent(eventID);

  inputFields.forEach((field) => (field.onblur = null));
}

function collectInputFieldsOfEvent(eventID) {
  const inputFields = [];

  for (const field of CONSTANTS.orderedEventDefinitions) {
    const cell = document.getElementById(`${eventID}_${field.dataLabel}`);
    inputFields.push(cell.firstChild);
  }

  return inputFields;
}

export function collectSelectedEvents() {
  const selectedEvents = state.selectedEvents.get();
  const displayedEvents = state.displayedEvents.get();
  const mode = state.mode.get();

  if (mode === Mode.CLEAN) {
    return displayedEvents;
  }
  return displayedEvents.filter((event) => selectedEvents.includes(event.id));
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
    [Mode.POPUP]: {
      classes: ['disabled'],
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
    [Mode.POPUP]: {
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
    [Mode.POPUP]: {
      classes: ['disabled'],
      onclick: null,
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
    [Mode.POPUP]: {
      classes: ['disabled'],
      onclick: null,
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
    [Mode.POPUP]: {
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
    [Mode.POPUP]: {
      classes: ['disabled'],
      onclick: null,
    },
  },
  importCSVButton: {
    [Mode.CLEAN]: {
      classes: [],
      onclick: importEvents,
    },
    [Mode.SELECTING]: {
      classes: [],
      onclick: importEvents,
    },
    [Mode.EDITING]: {
      classes: ['disabled'],
      onclick: null,
    },
    [Mode.POPUP]: {
      classes: ['disabled'],
      onclick: null,
    },
  },
  exportCSVButton: {
    [Mode.CLEAN]: {
      classes: [],
      onclick: exportCSVEvents,
    },
    [Mode.SELECTING]: {
      classes: [],
      onclick: exportCSVEvents,
    },
    [Mode.EDITING]: {
      classes: ['disabled'],
      onclick: null,
    },
    [Mode.POPUP]: {
      classes: ['disabled'],
      onclick: null,
    },
  },
  exportPDFButton: {
    [Mode.CLEAN]: {
      classes: [],
      onclick: exportPDFEvents,
    },
    [Mode.SELECTING]: {
      classes: [],
      onclick: exportPDFEvents,
    },
    [Mode.EDITING]: {
      classes: ['disabled'],
      onclick: null,
    },
    [Mode.POPUP]: {
      classes: ['disabled'],
      onclick: null,
    },
  },
};

export function setActionBarToMode(mode) {
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
  setButtonToConfig(DOM.importCSVButton, ButtonConfig.importCSVButton[mode]);
  setButtonToConfig(DOM.exportCSVButton, ButtonConfig.exportCSVButton[mode]);
  setButtonToConfig(DOM.exportPDFButton, ButtonConfig.exportPDFButton[mode]);
}
