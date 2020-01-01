import { State, Observer } from './state.js';
import { CONSTANTS, DOM, Mode } from './constants.js';
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
  validateEvent,
  printTable,
  setActionBarAppearance,
} from './functions.js';

// Object containing all application state
const state = {
  allEvents: new State([], true, 'list of all events'),
  filteredEvents: new State([], true, 'filtered events'),
  filter: new State('', true, 'filter text'),
  highlights: new State([], true, 'cells of filtered rows to be highlighted'),
  selectedEvents: new State([], true, 'selected events'),
  activeEvent: new State(null, true, 'event that is currently being edited'),
  mode: new State(Mode.CLEAN, true, 'application mode'),
};

// Initialization and first render
window.onload = () => {
  if (CONSTANTS.enableLogging) 'FUNCTION_window.onload';

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
  // Button click handlers
  DOM.searchField.addEventListener('input', event => {
    state.filter.set(event.target.value);
  });
  DOM.addButton.onclick = addButtonClickHandler;
  DOM.editButton.onclick = editButtonClickHandler;
  DOM.saveButton.onclick = saveButtonClickHandler;
  DOM.cancelButton.onclick = cancelButtonClickHandler;
  DOM.printButton.onclick = printTable;

  // setActionBarAppearance(state.mode.get());

  state.allEvents.attachObserver(
    logStateChangeObserver,
    filterEventsObserver
    );
  
  state.filter.attachObserver(
    logStateChangeObserver,
    filterEventsObserver
    );
  
  state.filteredEvents.attachObserver(
    logStateChangeObserver,
    renderTableObserver,
    highlightRowObserver,
    addClickHandlerToRowObserver
    );
  
  state.selectedEvents.attachObserver(
    logStateChangeObserver,
    changeModeOnSelectionChangeObserver
    );
  
  state.activeEvent.attachObserver(
    logStateChangeObserver,
    activateEventObserver
    );
  
  state.mode.attachObserver(
    logStateChangeObserver,
    setActionBarObserver,
    );

  state.mode.set(Mode.CLEAN);

};

fetchEvents(events => state.allEvents.set(events));
// window.setInterval(() => fetchEvents((events) => state.allEvents.set(events));

const setActionBarObserver = new Observer((mode) => {
  setActionBarAppearance(mode);
  setActionBarHandlers(mode);
});

function setActionBarHandlers(mode) {
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
      DOM.editButton.onclick = null;
      DOM.saveButton.onclick = saveButtonClickHandler;
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
};

const changeModeOnSelectionChangeObserver = new Observer(selectedEvents => {
  // If the last row was just deselected
  if (selectedEvents.length === 0 && state.mode.get() === Mode.SELECTING) {
    state.mode.set(Mode.CLEAN);
  }
  // If the first row was just selected
  if (selectedEvents.length !== 0 && state.mode.get() === Mode.CLEAN) {
    state.mode.set(Mode.SELECTING);
  }
});

const addClickHandlerToRowObserver = new Observer(filteredEvents => {
  filteredEvents.forEach(event => {
    document.getElementById(event.id).onclick = mouseEvent => {
      const mode = state.mode.get();
      if (mode !== Mode.CLEAN && mode !== Mode.SELECTING) {
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
    state.allEvents.get(),
    state.filter.get(),
  );

  state.highlights.set(matches);
  state.filteredEvents.set(events);
});

const renderTableObserver = new Observer(events =>
  renderTable(events, DOM.tBody),
);

const highlightRowObserver = new Observer(() => {
  highlightFilterMatches(state.highlights.get());
});

const logStateChangeObserver = new Observer((data, descriptor) => {
  if (CONSTANTS.enableLogging) console.log(`STATE CHANGE IN ${descriptor}`);
});

const activateEventObserver = new Observer(rowID => {
  // Abort is no rowID is given ==> no activation
  if (!rowID) {
    state.mode.set(Mode.CLEAN);
    return;
  }
  
  if (rowID === CONSTANTS.newRowID) {
    createEmptyRow();
  } else {
    unlockTableRow(rowID);
  }

  state.mode.set(Mode.EDITING);
});

function addButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_addButtonClickHandler');

  state.activeEvent.set(CONSTANTS.newRowID);
}

function editButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_editButtonClickHandler');

  if (state.mode.get() !== Mode.SELECTING) {
    return;
  }
  
  let selectedEvents = state.selectedEvents.get();
  const activeEvent = selectedEvents.pop();
  state.activeEvent.set(activeEvent);
  state.selectedEvents.set(selectEvents);
}

function saveButtonClickHandler() {
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
    if (event.id === CONSTANTS.newRowID) {
      pushNewEvent(saveEventCallback, event);
    } else {
      pushUpdatedEvent(saveEventCallback, event);
    }
  } else {
    // TODO: SPRINT 3 --> React to bad validation
  }
}

function cancelButtonClickHandler() {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_cancelButtonClickHandler');

  switch (state.mode.get()) {
    case Mode.SELECTING:
      // Reset marked EDITING
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

      if (activeEventID === CONSTANTS.newRowID)
        // Delete new table row, if exists
        if (DOM.tBody.rows[0].id === 'NEW') {
          DOM.tBody.deleteRow(0);
        } else {
          console.log('Wait what?'); 
          break;
        }
      else {
        lockTableRow(activeEventID);
      }
      
      state.activeEvent.set(null)
      break;
    default:
      break;
  }
}
