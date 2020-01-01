import { CONSTANTS, DOM, Mode } from './constants.js';

// ----------- IO
function fetchEvents(callback) {
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

function pushNewEvent(callback, selectedEvent) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_pushNewEvent:', callback, selectedEvent);

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

function pushUpdatedEvent(callback, selectedEvent) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_pushNewEvent:', callback, selectedEvent);
  
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

// ----------- UTILS

function renderTable(events, tableBody) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_renderTable:', events, tableBody);

  tableBody.innerHTML = '';

  events.forEach(event => {
    let tRow = tableBody.insertRow(0);
    tRow.setAttribute('id', event.id);

    // Write event data to table
    // eslint-disable-next-line no-restricted-syntax
    for (const column of CONSTANTS.orderedEventDefinitions) {
      let cell = tRow.insertCell(-1);

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

function filterEvents(events, filterText) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_filterEvents:', filterText, events);

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

function highlightFilterMatches(matches) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_highlightFilterMatches:', matches);

  matches.forEach(match => {
    document.getElementById(match).classList.add('highlight');
  });
}

function createEventOutOfRow(rowId) {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_createEventOutOfRow:', rowId);

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

function unlockTableRow(rowId) {
  const tRow = document.getElementById(rowId);

  for (const cell of tRow.cells) {
    cell.firstChild.removeAttribute('disabled');
  }
}

function lockTableRow(rowId) {
  const tRow = document.getElementById(rowId);

  for (const cell of tRow.cells) {
    cell.firstChild.setAttribute('disabled', '');
  }
}

function createEmptyRow() {
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

function validateEvent(event) {
  // TODO: FRONTEND VALIDATION LOGIC

  return Object.values(event).every(prop => prop !== '' && prop !== null);
}

function printTable() {
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

function setActionBarAppearance(mode) {
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



export {
  fetchEvents,
  pushNewEvent,
  pushUpdatedEvent,
  renderTable,
  filterEvents,
  highlightFilterMatches,
  createEventOutOfRow,
  unlockTableRow,
  lockTableRow,
  createEmptyRow,
  validateEvent,
  printTable,
  setActionBarAppearance,
};
