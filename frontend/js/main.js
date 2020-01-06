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
  setActionBarToMode,
} from './functions.js';

document.addEventListener('keydown', onKeyDownHandler);

// Initialization and first render
window.addEventListener('DOMContentLoaded', () => {
  if (CONSTANTS.enableLogging) console.log('FUNCTION_window.onload');

  // --- UNIQUE DOM ELEMENTS
  // Table and structural elements
  DOM.body = document.getElementsByTagName('body')[0];
  DOM.tContainer = document.getElementById('table-container');
  DOM.table = document.getElementById('tableEvents');
  DOM.tBody = document.getElementById('tableBody');
  DOM.tHeader = document.getElementById('tableHeader');
  DOM.modal = document.getElementById('addEventModal');
  // Interaction elements
  DOM.searchField = document.getElementById('searchfield');
  DOM.addButton = document.getElementById('addButton');
  DOM.editButton = document.getElementById('editButton');
  DOM.saveButton = document.getElementById('saveButton');
  DOM.cancelButton = document.getElementById('cancelButton');
  DOM.deleteButton = document.getElementById('deleteButton');
  DOM.printButton = document.getElementById('printButton');
  // Static Event handlers
  DOM.searchField.addEventListener('input', (event) => {
    state.filter.set(event.target.value);
  });

  state.mode.set(Mode.CLEAN);

  fetchEvents((events) => state.allEvents.set(events));
  // window.setInterval(() => fetchEvents((events) => state.allEvents.set(events));

  // Add and populate institute options list
  const instituteList = document.createElement('datalist');
  instituteList.setAttribute('id', CONSTANTS.instituteDataListID);

  CONSTANTS.institutes.forEach((inst) => {
    const option = document.createElement('option');
    option.value = inst;
    instituteList.appendChild(option);
  });

  DOM.body.appendChild(instituteList);
});


/*
  State required: mode
  State modified: none
 */
const setActionBarObserver = new Observer(setActionBarToMode);

/*
  State required: mode, displayedEvents
  State modified: none
 */
const setRowCursorObserver = new Observer(() => {
  const mode = state.mode.get();
  const displayedEvents = state.displayedEvents.get();

  displayedEvents.forEach((event) => {
    const tRow = document.getElementById(event.id);

    if (mode === Mode.EDITING) {
      tRow.classList.remove('pointer');
    } else {
      tRow.classList.add('pointer');
    }
  });
});

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
  State required: displayedEvents
  State modified: none
 */
const addClickHandlerToRowObserver = new Observer((displayedEvents) => {
  displayedEvents.forEach((event) => {
    document.getElementById(event.id).onclick = onSelectRowHandler;
  });
});

/*
  State required: allEvents, filter
  State modified: displayedEvents, matches
 */
const filterEventsObserver = new Observer(() => {
  const { events, matches } = filterEvents(
    state.allEvents.get(),
    state.filter.get(),
  );

  state.displayedEvents.set(events);
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
  filterEventsObserver,
);

state.filter.attachObserver(
  logStateChangeObserver,
  filterEventsObserver,
);

state.displayedEvents.attachObserver(
  logStateChangeObserver,
  renderTableObserver,
  addClickHandlerToRowObserver,
  setRowCursorObserver,
);

state.matches.attachObserver(highlightRowObserver);

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
  setActionBarObserver,
);
