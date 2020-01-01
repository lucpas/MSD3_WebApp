import { CONSTANTS, DOM, Mode } from './constants.js';
import { state } from './main.js';

// ----------- IO
export function fetchEvents(callback) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_fetchEvents:', callback);

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
  if (CONSTANTS.enableLogging)
    console.log('FUNCTION_pushNewEvent:', callback, selectedEvent);

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
  if (CONSTANTS.enableLogging)
    console.log('FUNCTION_pushNewEvent:', callback, selectedEvent);

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

// ----------- CLICK HANDLERS
export function addButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_addButtonClickHandler');

  state.activeEvent.set(CONSTANTS.newRowID);
}

export function editButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_editButtonClickHandler');

  if (state.mode.get() !== Mode.SELECTING) {
    return;
  }

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

  const event = createEventOutOfRow(activeEventID);

  const isValidEvent = validateEvent(event);

  const saveEventCallback = () => {
    const untouchedEvents = state.allEvents
      .get()
      .filter(e => e.id !== event.id);
    state.allEvents.set([event, ...untouchedEvents]);

    state.mode.set(Mode.SELECTING);
  };

  if (isValidEvent) {
    // Check edited event is new by its ID
    if (event.id === CONSTANTS.newRowID) {
      pushNewEvent(saveEventCallback, event);
    } else {
      pushUpdatedEvent(saveEventCallback, event);
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

      const activeEventID = state.activeEvent.get();

      if (activeEventID === CONSTANTS.newRowID) {
        // Delete new table row, if exists
        if (DOM.tBody.rows[0].id === 'NEW') {
          DOM.tBody.deleteRow(0);
        } else {
          console.log('Wait what?');
          break;
        }
      } else {
        lockTableRow(activeEventID);
        state.selectedEvents.set(state.selectedEvents.previousState);
      }

      state.activeEvent.set(null);
      break;
    default:
      break;
  }
}

export function onSelectRowHandler(mouseEvent) {
  // Prevent selecting rows when editing
  if (state.mode.get() === Mode.EDITING) {
    return;
  }

  // Prevent selecting borders
  const rowID = mouseEvent.path[2].id;
  if (rowID === 'tableBody' || rowID === 'tableEvents') {
    return;
  }

  toggleRowSelection(rowID);
}

export function onKeyDownHandler(event) {
  const keyName = event.key;
  console.log(event.key);

  switch (keyName) {
    case 'n':
      if (typeof DOM.addButton.onclick == 'function') {
        DOM.addButton.click();
      }
      break;
    case 'e':
      if (typeof DOM.editButton.onclick == 'function') {
        DOM.editButton.click();
      }
      break;
    case 's':
      if (typeof DOM.saveButton.onclick == 'function') {
        DOM.saveButton.click();
      }
      break;
    case 'c':
      if (typeof DOM.cancelButton.onclick == 'function') {
        DOM.cancelButton.click();
      }
      break;
    case 'p':
      if (typeof DOM.printButton.onclick == 'function') {
        DOM.printButton.click();
      }
      break;
    case 'Enter':
      if (state.mode.get() !== Mode.EDITING && event.target.tagName === 'TR') {
        toggleRowSelection(event.target.id);
      }
      break;
    case 'ArrowDown':
      var activeRow = document.activeElement;
      if (activeRow.tagName !== 'TR') {
        break;
      }

      var nextElementID = getNthNextEventID(activeRow.id, -1);
      if (nextElementID) {
        document.getElementById(nextElementID).focus();
      }
      break;
    case 'ArrowUp':
      var activeRow = document.activeElement;
      if (activeRow.tagName !== 'TR') {
        break;
      }

      var nextElementID = getNthNextEventID(activeRow.id, 1);
      if (nextElementID) {
        document.getElementById(nextElementID).focus();
      }
      break;
    default:
      break;
  }
}

// ----------- UTILS

export function getNthNextEventID(eventID, n) {
  const events = state.filteredEvents.get();
  const nextIndex = events.findIndex((event) => event.id === eventID) + n;

  if (nextIndex >= 0 && nextIndex < events.length) {
    return events[nextIndex].id;
  } else {
    return null;
  }
}

export function renderTable(events, tableBody) {
  if (CONSTANTS.enableLogging)
    console.log('FUNCTION_renderTable:', events, tableBody);

  tableBody.innerHTML = '';

  events.forEach(event => {
    const tRow = tableBody.insertRow(0);
    tRow.setAttribute('id', event.id);
    tRow.setAttribute('tabIndex', '0');
    tRow.classList.add('tabbable');

    // Write event data to table
    // eslint-disable-next-line no-restricted-syntax
    for (const column of CONSTANTS.orderedEventDefinitions) {
      const cell = tRow.insertCell(-1);

      const inputField = document.createElement('textarea');
      inputField.value = event[column.dataLabel];
      inputField.setAttribute('disabled', '');

      cell.classList.add(column.dataLabel);
      cell.setAttribute('id', `${event.id}_${column.dataLabel}`);
      cell.setAttribute('data-title', column.presentationLabel);
      cell.appendChild(inputField);
    }
  });
}

export function filterEvents(events, filterText) {
  if (CONSTANTS.enableLogging)
    console.log('FUNCTION_filterEvents:', filterText, events);

  const matches = [];

  // do not filter if less than 3 characters were entered
  if (filterText.length < 3) {
    return { events, matches };
  }

  // filter events
  const filteredEvents = events.filter(event => {
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

  return { events: filteredEvents, matches };
}

export function highlightFilterMatches(matches) {
  if (CONSTANTS.enableLogging)
    console.log('FUNCTION_highlightFilterMatches:', matches);

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

export function createEventOutOfRow(rowId) {
  if (CONSTANTS.enableLogging)
    console.log('FUNCTION_createEventOutOfRow:', rowId);

  const { cells } = document.getElementById(rowId);

  return {
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
  if (CONSTANTS.enableLogging) console.log('FUNCTION_createEmptyRow:');

  const tRow = DOM.tBody.insertRow(0);
  tRow.setAttribute('id', CONSTANTS.newRowID);

  let cell;
  // eslint-disable-next-line no-restricted-syntax
  for (const column of CONSTANTS.orderedEventDefinitions) {
    cell = tRow.insertCell(-1);
    const inputField = document.createElement('textarea');
    inputField.value = '';

    cell.classList.add(column.dataLabel);
    cell.setAttribute('data-title', column.presentationLabel);
    cell.appendChild(inputField);
  }

  return tRow;
}

export function validateEvent(event) {
  // TODO: FRONTEND VALIDATION LOGIC

  return Object.values(event).every(prop => prop !== '' && prop !== null);
}

export function printTable() {
  // new empty window
  const printWin = window.open('');
  // fill tabledata in new window
  printWin.document.write(DOM.table.outerHTML);
  // function to open printdialog
  printWin.print();
  // close the "new page" after printing
  printWin.close();
  window.onload();
}

export function setActionBarAppearance(mode) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_setActionBarAppearance');

  switch (mode) {
    case Mode.CLEAN:
      DOM.addButton.classList.add('big');
      DOM.addButton.classList.remove('disabled');
      DOM.editButton.classList.remove('big');
      DOM.editButton.classList.add('disabled');
      DOM.saveButton.classList.remove('big');
      DOM.saveButton.classList.add('disabled');
      DOM.cancelButton.classList.remove('big');
      DOM.cancelButton.classList.add('disabled');
      break;
    case Mode.SELECTING:
      DOM.addButton.classList.add('big');
      DOM.addButton.classList.remove('disabled');
      DOM.editButton.classList.add('big');
      DOM.editButton.classList.remove('disabled');
      DOM.saveButton.classList.remove('big');
      DOM.saveButton.classList.add('disabled');
      DOM.cancelButton.classList.remove('big');
      DOM.cancelButton.classList.remove('disabled');
      break;
    case Mode.EDITING:
      DOM.addButton.classList.remove('big');
      DOM.addButton.classList.add('disabled');
      DOM.editButton.classList.remove('big');
      DOM.editButton.classList.add('disabled');
      DOM.saveButton.classList.add('big');
      DOM.saveButton.classList.remove('disabled');
      DOM.cancelButton.classList.remove('big');
      DOM.cancelButton.classList.remove('disabled');
      break;
    default:
      break;
  }
}

export function setActionBarHandlers(mode) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_setActionBarHandlers');

  switch (mode) {
    case Mode.CLEAN:
      DOM.addButton.onclick = addButtonClickHandler;
      DOM.editButton.onclick = null;
      DOM.saveButton.onclick = null;
      DOM.cancelButton.onclick = null;
      DOM.printButton.onclick = printTable;
      break;
    case Mode.SELECTING:
      DOM.addButton.onclick = addButtonClickHandler;
      DOM.editButton.onclick = editButtonClickHandler;
      DOM.saveButton.onclick = null;
      DOM.cancelButton.onclick = cancelButtonClickHandler;
      DOM.printButton.onclick = printTable;
      break;
    case Mode.EDITING:
      DOM.addButton.onclick = null;
      DOM.editButton.onclick = null;
      DOM.saveButton.onclick = saveButtonClickHandler;
      DOM.cancelButton.onclick = cancelButtonClickHandler;
      DOM.printButton.onclick = printTable;
      break;
    default:
      break;
  }
}
