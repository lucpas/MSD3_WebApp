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


/*
  State required: mode
  State modified: none
 */
const setActionBarObserver = new Observer((mode) => {
  setActionBarAppearance(mode);
  setActionBarHandlers(mode);
});

/*
  State required: mode, filteredEvents
  State modified: none
 */
const setRowCursorObserver = new Observer(() => {
  const mode = state.mode.get();
  const filteredEvents = state.filteredEvents.get();

  filteredEvents.forEach((event) => {
    const tRow = document.getElementById(event.id);
    
    if (mode === Mode.EDITING) {
      tRow.classList.remove('pointer')
    } else {
      tRow.classList.add('pointer');
    }
  })
})

/*
  State required: selectedEvents
  State modified: mode
 */
const setModeOnSelectionChangeObserver = new Observer((selectedEvents) => {
  // If the last row was just deselected
  if (selectedEvents.length === 0 && state.mode.get() === Mode.SELECTING) {
    state.mode.set(Mode.CLEAN);
  }
  // If the first row was just selected
  if (selectedEvents.length !== 0 && state.mode.get() === Mode.CLEAN) {
    state.mode.set(Mode.SELECTING);
  }
});

/*
  State required: filteredEvents
  State modified: none
 */
const addClickHandlerToRowObserver = new Observer((filteredEvents) => {
  filteredEvents.forEach((event) => document.getElementById(event.id).onclick = onSelectRowHandler);
});

/*
  State required: allEvents, filter
  State modified: filteredEvents, matches
 */
const filterEventsObserver = new Observer(() => {
  const { events, matches } = filterEvents(
    state.allEvents.get(),
    state.filter.get(),
  );

  state.filteredEvents.set(events);
  state.matches.set(matches);
});

/*
  State required: allEvents
  State modified: none
 */
const renderTableObserver = new Observer((events) => renderTable(events));

/*
  State required: matches
  State modified: none
 */
const highlightRowObserver = new Observer(() => {
  highlightFilterMatches(state.matches.get());
});

/*
  State required: [any]
  State modified: none
 */
const logStateChangeObserver = new Observer((data, descriptor) => {
  if (CONSTANTS.enableLogging) console.log(`STATE CHANGE IN ${descriptor}`);
});

/*
  State required: activeEvent
  State modified: mode
 */
const setModeOnActiveEventChangeObserver = new Observer((activeEventID) => {
  // Abort is no rowID is given ==> no activation
  if (!activeEventID) {
    if (state.selectedEvents.get().length === 0) {
      state.mode.set(Mode.CLEAN);
    } else {
      state.mode.set(Mode.SELECTING);
    }
  } else {
    state.mode.set(Mode.EDITING);
  }
});

/*
  State required: activeEvent
  State modified: none
 */
const activateRowObserver = new Observer((activeEventID) => {
  if (activeEventID === CONSTANTS.newRowID) {
    createEmptyRow();
  } else if (activeEventID !== null) {
    unlockTableRow(activeEventID);
  }
});

/*
  State required: activeEvent
  State modified: none
 */
const focusOnActiveEventObserver = new Observer(setFocusOnRow);

// Attaching Observers
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
  addClickHandlerToRowObserver,
  setRowCursorObserver
);

state.matches.attachObserver(highlightRowObserver)

state.selectedEvents.attachObserver(
  logStateChangeObserver,
  setModeOnSelectionChangeObserver,
);

state.activeEvent.attachObserver(
  logStateChangeObserver,
  activateRowObserver,
  focusOnActiveEventObserver,
  setModeOnActiveEventChangeObserver,
);

state.mode.attachObserver(
  logStateChangeObserver, 
  setRowCursorObserver,
  setActionBarObserver);
