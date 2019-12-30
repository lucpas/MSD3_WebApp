const States = {
  SELECTING: 1,
  EDITING: 2,
  CREATING: 3,
};

let state;

let rowInEditing;

// Ordered definition of events
const orderedEventDefinitions = [
  {
    dataLabel: 'title',
    presentationLabel: 'Titel',
  },
  {
    dataLabel: 'description',
    presentationLabel: 'Beschreibung',
  },
  {
    dataLabel: 'date',
    presentationLabel: 'Datum',
  },
  {
    dataLabel: 'time',
    presentationLabel: 'Uhrzeit',
  },
  {
    dataLabel: 'place',
    presentationLabel: 'Ort',
  },
  {
    dataLabel: 'contact',
    presentationLabel: 'Kontakt',
  },
  {
    dataLabel: 'institute',
    presentationLabel: 'Institut',
  },
  {
    dataLabel: 'entry',
    presentationLabel: 'Eintritt',
  },
];

// URL of backend api (prod and dev)
// const url = 'https://msd3-webapp.herokuapp.com/api/events';
const url = 'http://localhost:8080/api/events';

// Collection of all loaded events --> filled during onload
let events = [];

// Collection of all DOM elements required to run script --> filled during onload
const DOM = {};

// Initialization and first render
window.onload = () => {
  // --- UNIQUE DOM ELEMENTS
  // Table and structural elements
  DOM.tContainer = document.getElementById('table-container');
  DOM.table = document.getElementById('tableEvents');
  DOM.tBody = document.getElementById('tableBody');
  DOM.tHeader = document.getElementById('tableHeader');
  DOM.modal = document.getElementById('addEventModal');
  DOM.editForm = document.getElementById('editEventForm');
  // Interaction elements
  DOM.searchField = document.getElementById('searchfield');
  DOM.addButton = document.getElementById('addButton');
  DOM.editButton = document.getElementById('editButton');
  DOM.saveButton = document.getElementById('saveButton');
  DOM.cancelButton = document.getElementById('cancelButton');
  DOM.printButton = document.getElementById('printButton');

  DOM.searchField.addEventListener('input', (event) => filterTable(event.target.value));

  DOM.addButton.onclick = () => {
    console.log('DEBUG_addEventButton.onclick');

    if (state !== States.SELECTING) {
      return;
    }

    state = States.CREATING;
    setActionBar(state);

    createEmptyRow();

    DOM.saveButton.onclick = () => {
      const newEvent = createEventOutOfRow('NEW');
      const isValidEvent = validateEvent(newEvent);
      if (isValidEvent) {
        pushNewEvent(newEvent, () => {
          events.push(newEvent);
          filterTable(DOM.searchField.value);
          state = States.SELECTING;
          setActionBar(state);
        });
      } else {
        // TODO: Sprint 3 validate -> errorMessage()
        window.alert('OOOPS');
      }
    };
  };

  DOM.editButton.onclick = () => {
    console.log('DEBUG_editButton.onclick');

    if (state !== States.SELECTING) {
      return;
    }

    state = States.EDITING;
    setActionBar(state);

    rowInEditing = markedEvents.pop();

    unlockTableRow(rowInEditing);

    DOM.saveButton.onclick = () => {
      const updatedEvent = createEventOutOfRow(rowInEditing);
      updatedEvent.id = rowInEditing;
      const isValidEvent = validateEvent(updatedEvent);

      if (isValidEvent) {
        pushUpdatedEvent(updatedEvent, () => {
          const eventIndex = events.findIndex((e) => e.id === updatedEvent.id);
          events[eventIndex] = updatedEvent;
          filterTable(DOM.searchField.value);
          state = States.SELECTING;
          setActionBar(state);
        });
      } else {
        // TODO: Sprint 3 validate -> errorMessage()
        window.alert(errorMessage());
      }
    };
  };

  DOM.cancelButton.onclick = () => {
    console.log('DEBUG_cancelButton.onclick');

    switch (state) {
      case States.SELECTING:
        // Reset marked EDITING
        markedEvents.forEach((rowId) => {
          document.getElementById(rowId).style.background = '';
        });
        markedEvents = [];
        break;
      case States.CREATING:
        // TODO: Styled prompt
        if (!confirm('Witty confirmation message?')) {
          break;
        }

        // Delete new table row, if exists
        if (DOM.tBody.rows[0].id === 'NEW') {
          DOM.tBody.deleteRow(0);
        }
        break;
      case States.EDITING:
        if (!confirm('Witty confirmation message?')) {
          break;
        }

        lockTableRow(rowInEditing);
        rowInEditing = '';
        break;
      default:
        break;
    }

    // Reset view to table mode
    state = States.SELECTING;
    setActionBar(state);
  };

  DOM.printButton.addEventListener('click', printTable);

  // Set inital state
  state = States.SELECTING;
  setActionBar(state);

  fetchEvents(() => drawTable(events));
  // window.setInterval(() => fetchEvents(), 30000);
};

// window.onclick = event => {
//   if (event.target === DOM.modal) {
//     DOM.modal.style.display = 'none';
//   }
// };

function setActionBar(state) {
  switch (state) {
    case States.SELECTING:
      DOM.addButton.classList.add('big');
      DOM.addButton.classList.remove('disabled');

      if (markedEvents.length !== 0) {
        DOM.editButton.classList.add('big');
        DOM.editButton.classList.remove('disabled');
      } else {
        DOM.editButton.classList.remove('big');
        DOM.editButton.classList.add('disabled');
      }

      DOM.saveButton.classList.remove('big');
      DOM.saveButton.classList.add('disabled');

      DOM.cancelButton.classList.remove('big');
      DOM.cancelButton.classList.add('disabled');

      DOM.saveButton.onclick = null;
      break;
    case States.CREATING:
    case States.EDITING:
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

function fetchEvents(callback) {
  console.log('DEBUG_fetchEvents');

  const request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();

  // eslint-disable-next-line func-names
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      events = JSON.parse(request.responseText);
      // console.log('DEBUG: Completed fetch');

      if (typeof callback === 'function') {
        // console.log('DEBUG: Executing callback');
        callback();
      }
    }
  };
}

function pushNewEvent(selectedEvent, callback) {
  const request = new XMLHttpRequest();
  request.open('POST', url);
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

function pushUpdatedEvent(selectedEvent, callback) {
  const request = new XMLHttpRequest();
  request.open('PUT', `${url}/${selectedEvent.id}`, true);
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

let markedEvents = [];
function markEvent(mouseEvent) {
  if (state !== States.SELECTING) {
    return;
  }

  const tRow = mouseEvent.path[2];
  if (tRow.id === 'tableBody') {
    return;
  }

  if (markedEvents.includes(tRow.id)) {
    tRow.style.background = '';
    markedEvents = markedEvents.filter((id) => id !== tRow.id);
  } else {
    tRow.style.background = 'antiquewhite';
    markedEvents.push(tRow.id);
    markedEvents.sort();
  }

  if (markedEvents.length === 0) {
    DOM.editButton.classList.remove('big');
    DOM.editButton.classList.add('disabled');
    DOM.cancelButton.classList.add('disabled');
  } else {
    DOM.editButton.classList.add('big');
    DOM.editButton.classList.remove('disabled');
    DOM.cancelButton.classList.remove('disabled');
  }
}

function validateEvent(event) {
  // TODO: FRONTEND VALIDATION LOGIC

  return Object.values(event).every((prop) => prop !== '' && prop !== null);
}

function createEventOutOfRow(rowId) {
  console.log('DEBUG_createEventOutOfRow');

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
  const tableRow = document.getElementById(rowId);

  for (const cell of tableRow.cells) {
    cell.firstChild.removeAttribute('disabled');
  }
}

function lockTableRow(rowId) {
  const tableRow = document.getElementById(rowId);

  for (const cell of tableRow.cells) {
    cell.firstChild.setAttribute('disabled', '');
  }
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

function highlightTableCell(rowIndex, columnIndex) {
  // increment row index to account for table header
  DOM.table.rows[rowIndex + 1].cells[columnIndex].classList.add('highlight');
}

function filterTable(filterText) {
  // do not filter if less than 3 characters were entered
  if (filterText.length < 3) {
    drawTable(events);
    return;
  }

  const matches = [];
  let matchCount = 0;

  // filter events
  const filteredEvents = events.filter((event) => {
    let isMatch = false;
    // for (const key in event) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(event)) {
      if (value.toLowerCase().includes(filterText.toLowerCase())) {
        matches.push({
          index: matchCount,
          key,
        });
        isMatch = true;
      }
    }

    if (isMatch) {
      matchCount += 1;
    }
    return isMatch;
  });

  // redraw table
  drawTable(filteredEvents);

  // highlight matching cells
  matches.forEach((match) => {
    highlightTableCell(
      match.index,
      orderedEventDefinitions.findIndex(
        (eventDef) => eventDef.dataLabel === match.key,
      ),
    );
  });
}

// Shorter version of drawTable function
function drawTable(selectedEvents) {
  DOM.tBody.innerHTML = '';

  let tRow;
  let cell;

  selectedEvents.forEach((event) => {
    tRow = DOM.tBody.insertRow(0);
    tRow.setAttribute('id', event.id);

    // Write event data to table
    // eslint-disable-next-line no-restricted-syntax
    for (const column of orderedEventDefinitions) {
      cell = tRow.insertCell(-1);

      const inputField = document.createElement('textarea');
      inputField.value = event[column.dataLabel];
      inputField.setAttribute('disabled', '');

      cell.classList.add(column.dataLabel);
      cell.setAttribute('data-title', column.presentationLabel);
      cell.appendChild(inputField);
    }

    tRow.addEventListener('click', (mouseEvent) => markEvent(mouseEvent));
  });
}

function createEmptyRow() {
  const tRow = DOM.tBody.insertRow(0);
  tRow.setAttribute('id', 'NEW');

  let cell;
  // eslint-disable-next-line no-restricted-syntax
  for (const column of orderedEventDefinitions) {
    cell = tRow.insertCell(-1);
    const inputField = document.createElement('textarea');
    inputField.value = '';

    cell.classList.add(column.dataLabel);
    cell.setAttribute('data-title', column.presentationLabel);
    cell.appendChild(inputField);
  }
}

EventsObserver = {
  events: [],
  handlers: [],
  subscribe(handler) {
    this.handlers.push(handler);
  },
  notify() {
    this.handlers.forEach((handler) => handler(this.events));
  },
  setEvents(events) {
    this.events = events;
    notify();
  },
  applyArrayMethod(func) {
    func.apply(null, this.events);
  },

};
