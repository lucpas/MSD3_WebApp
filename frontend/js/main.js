import { Observer } from './state.js';
import {
  CONSTANTS, DOM, Mode, state,
} from './constants.js';
import {
  fetchEvents,
  onSelectRowHandler,
  onKeyDownHandler,
  renderTable,
  filterEvents,
  highlightFilterMatches,
  unlockTableRow,
  createEmptyRow,
  setFocusOnRow,
  setActionBarAppearance,
  setActionBarHandlers,
} from './functions.js';

document.addEventListener('keydown', onKeyDownHandler);

// Initialization and first render
window.addEventListener('DOMContentLoaded', () => {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_window.onload');

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
  // Static Event handlers
  DOM.searchField.addEventListener('input', (event) => {
    state.filter.set(event.target.value);
  });

  state.mode.set(Mode.CLEAN);

  fetchEvents((events) => state.allEvents.set(events));
  // window.setInterval(() => fetchEvents((events) => state.allEvents.set(events));
});

const setActionBarObserver = new Observer((mode) => {
  setActionBarAppearance(mode);
  setActionBarHandlers(mode);
});

const changeModeOnSelectionChangeObserver = new Observer((selectedEvents) => {
  // If the last row was just deselected
  if (selectedEvents.length === 0 && state.mode.get() === Mode.SELECTING) {
    state.mode.set(Mode.CLEAN);
  }
  // If the first row was just selected
  if (selectedEvents.length !== 0 && state.mode.get() === Mode.CLEAN) {
    state.mode.set(Mode.SELECTING);
  }
});

const addClickHandlerToRowObserver = new Observer((filteredEvents) => {
  filteredEvents.forEach((event) => {
    document.getElementById(event.id).onclick = onSelectRowHandler;
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

const renderTableObserver = new Observer((events) => renderTable(events));

const highlightRowObserver = new Observer(() => {
  highlightFilterMatches(state.highlights.get());
});

const logStateChangeObserver = new Observer((data, descriptor) => {
  if (CONSTANTS.enableLogging) console.log(`STATE CHANGE IN ${descriptor}`);
});

const activateEventObserver = new Observer((activeEventID) => {
  // Abort is no rowID is given ==> no activation
  if (!activeEventID) {
    if (state.selectedEvents.get().length === 0) {
      state.mode.set(Mode.CLEAN);
    } else {
      state.mode.set(Mode.SELECTING);
    }
    return;
  }

  if (activeEventID === CONSTANTS.newRowID) {
    createEmptyRow();
  } else {
    unlockTableRow(activeEventID);
  }

  state.mode.set(Mode.EDITING);
});

const focusOnActiveEventObserver = new Observer(setFocusOnRow);

// Attaching Observers
state.allEvents.attachObserver(logStateChangeObserver, filterEventsObserver);

state.filter.attachObserver(logStateChangeObserver, filterEventsObserver);

state.filteredEvents.attachObserver(
  logStateChangeObserver,
  renderTableObserver,
  highlightRowObserver,
  addClickHandlerToRowObserver,
);

state.selectedEvents.attachObserver(
  logStateChangeObserver,
  changeModeOnSelectionChangeObserver,
);

state.activeEvent.attachObserver(
  logStateChangeObserver,
  activateEventObserver,
  focusOnActiveEventObserver,
);

state.mode.attachObserver(logStateChangeObserver, setActionBarObserver);
