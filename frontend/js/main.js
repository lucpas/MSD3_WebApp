import { State, Observer } from './state.js';
import {
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
} from './functions.js';

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

// Collection of all unique DOM elements required to run script --> filled during onload
const DOM = {};

const Modes = {
  CLEAN: 1,
  SELECTING: 2,
  EDITING: 3,
  CREATING: 4,
};

// Object containing all application state
const state = {
  allEvents: new State('all events', true),
  filteredEvents: new State('filtered events', true),
  filter: new State('filter text', true),
  highlights: new State('cells of filtered rows to be highlighted', true),
  selectedEvents: new State(
    'events that have selectedEvents by clicking',
    true,
  ),
  rowInEditing: new State('row that is currently being edited', true),
  mode: new State('Initial state, event selection, editing or creation'),
};

// Initialize state
state.allEvents.set([]);
state.filteredEvents.set([]);
state.filter.set('');
state.highlights.set([]);
state.selectedEvents.set([]);
state.mode.set(Modes.CLEAN);

// Initialization and first render
window.onload = () => {
  console.log('DEBUG_window.onload');
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

  DOM.searchField.addEventListener('input', event => {
    console.log('DEBUG_window.onload');
    state.filter.set(event.target.value);
  });

  DOM.addButton.onclick = () => {
    console.log('DEBUG_addEventButton.onclick');

    if (state.mode.get() !== Modes.SELECTING) {
      return;
    }

    state.mode.set(Modes.CREATING);

    createEmptyRow(DOM.tBody, orderedEventDefinitions);

    DOM.saveButton.onclick = () => {
      const newEvent = createEventOutOfRow('NEW');
      const isValidEvent = validateEvent(newEvent);
      if (isValidEvent) {
        pushNewEvent(newEvent, () => {
          state.allEvents.set([newEvent, ...state.allEvents.get()]);

          state.mode.set(Modes.SELECTING);
        });
      } else {
        // TODO: Sprint 3 validate -> errorMessage()
        window.alert('OOOPS');
      }
    };
  };

  DOM.editButton.onclick = () => {
    console.log('DEBUG_editButton.onclick');

    let selectedEvents = state.selectedEvents.get();

    if (mode !== Modes.SELECTING || selectedEvents.length === 0) {
      return;
    }

    state.mode.set(Modes.EDITING);

    const rowInEditing = selectedEvents.pop();
    state.rowInEditing.set(rowInEditing);
    state.selectedEvents.set(selectEvents);

    unlockTableRow(rowInEditing);

    DOM.saveButton.onclick = () => {
      const updatedEvent = createEventOutOfRow(rowInEditing);
      updatedEvent.id = rowInEditing;
      const isValidEvent = validateEvent(updatedEvent);

      if (isValidEvent) {
        pushUpdatedEvent(updatedEvent, () => {
          const untouchedEvents = state.allEvents
            .get()
            .filter(e => e.id !== updatedEvent.id);
          state.allEvents.set([updatedEvent, ...untouchedEvents]);

          state.mode.set(Modes.SELECTING);
        });
      } else {
        // TODO: Sprint 3 validate -> errorMessage()
        window.alert(errorMessage());
      }
    };
  };

  DOM.cancelButton.onclick = () => {
    console.log('DEBUG_cancelButton.onclick');

    switch (mode) {
      case Modes.SELECTING:
        // Reset marked EDITING
        state.selectedEvents.get().forEach(rowId => {
          document.getElementById(rowId).style.background = '';
        });
        state.selectedEvents.set([]);
        break;
      case Modes.CREATING:
        // TODO: Styled prompt
        // if (!confirm('Witty confirmation message?')) {
        //   break;
        // }

        // Delete new table row, if exists
        if (DOM.tBody.rows[0].id === 'NEW') {
          DOM.tBody.deleteRow(0);
        }
        break;
      case Modes.EDITING:
        // if (!confirm('Witty confirmation message?')) {
        //   break;
        // }

        lockTableRow(rowInEditing);
        rowInEditing = '';
        break;
      default:
        break;
    }

    // Reset view to table mode
    state.mode.set(Modes.SELECTING);
  };

  setActionBar(state.mode.get());

  DOM.printButton.onclick = printTable;

  fetchEvents(url, events => state.allEvents.set(events));
  // window.setInterval(() => fetchEvents(url, (events) => state.allEvents.set(events));
};

function setActionBar(mode) {
  console.log(mode);

  switch (mode) {
    case Modes.CLEAN:
      DOM.addButton.classList.add('big');
      DOM.addButton.classList.remove('disabled');
      DOM.editButton.classList.remove('big');
      DOM.editButton.classList.add('disabled');
      DOM.saveButton.classList.remove('big');
      DOM.saveButton.classList.add('disabled');
      DOM.cancelButton.classList.remove('big');
      DOM.cancelButton.classList.add('disabled');
      DOM.saveButton.onclick = null;
      break;
    case Modes.SELECTING:
      DOM.addButton.classList.add('big');
      DOM.addButton.classList.remove('disabled');
      DOM.editButton.classList.add('big');
      DOM.editButton.classList.remove('disabled');
      DOM.saveButton.classList.remove('big');
      DOM.saveButton.classList.add('disabled');
      DOM.cancelButton.classList.remove('big');
      DOM.cancelButton.classList.add('disabled');
      DOM.saveButton.onclick = null;
      break;
    case Modes.CREATING:
    case Modes.EDITING:
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

const updateActionBarOnModeChangeObserver = new Observer(setActionBar);

const changeModeOnSelectionChangeObserver = new Observer(selectedEvents => {
  // If the last row was just deselected
  if (selectedEvents.length === 0 && state.mode.get() === Modes.SELECTING) {
    state.mode.set(Modes.CLEAN);
  }
  // If the first row was just selected
  if (selectedEvents.length !== 0 && state.mode.get() === Modes.CLEAN) {
    state.mode.set(Modes.SELECTING);
  }
});

const addClickHandlerToRowObserver = new Observer(filteredEvents => {
  filteredEvents.forEach(event => {
    document.getElementById(event.id).onclick = mouseEvent => {
      const mode = state.mode.get();
      if (mode !== Modes.CLEAN && mode !== Modes.SELECTING) {
        return;
      }

      const rowId = mouseEvent.path[2].id;
      if (rowId === 'tableBody' || rowId === 'tableEvents') {
        return;
      }

      const tRow = document.getElementById(rowId);

      let events = state.selectedEvents.get();

      if (events.includes(rowId)) {
        tRow.style.background = '';
        events = events.filter(id => id !== rowId);
      } else {
        tRow.style.background = 'antiquewhite';
        events.push(rowId);
        events.sort();
      }

      state.selectedEvents.set(events);
    };
  });
});

const filterEventsObserver = new Observer(() => {
  const { events, matches } = filterEvents(
    state.filter.get(),
    state.allEvents.get(),
  );

  state.highlights.set(matches);
  state.filteredEvents.set(events);
});

const renderTableObserver = new Observer(events =>
  renderTable(events, DOM.tBody, orderedEventDefinitions),
);

const highlightRowObserver = new Observer(() => {
  highlightFilterMatches(state.highlights.get());
});

state.filter.attachObserver(filterEventsObserver);
state.allEvents.attachObserver(filterEventsObserver);
state.filteredEvents.attachObserver(renderTableObserver);
state.filteredEvents.attachObserver(highlightRowObserver);
state.filteredEvents.attachObserver(addClickHandlerToRowObserver);
state.selectedEvents.attachObserver(changeModeOnSelectionChangeObserver);
state.mode.attachObserver(updateActionBarOnModeChangeObserver);

// Necessary so browsers will recognize file as module
export {};
