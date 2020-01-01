import { State } from './state.js';

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
const backendURL = 'https://msd3-webapp.herokuapp.com/api/events';
// const backendURL = 'http://localhost:8080/api/events';

// Console logs are only allowed when this is on!
const enableLogging = true;

// Temporary ID of rows that have not been given a backend ID yet
const newRowID = 'NEW';

export const CONSTANTS = {
  backendURL,
  orderedEventDefinitions,
  enableLogging,
  newRowID,
};

// Collection of all unique DOM elements required to run script --> filled during onload
export const DOM = {};

// General mode the app is in
export const Mode = {
  CLEAN: 1, // no rows being edited, selected or created
  SELECTING: 2, // one or more rows are selected but none is edited or created
  EDITING: 3, // a existing row is being edited
};

// Object containing all application state
export const state = {
  allEvents: new State([], true, 'list of all events'),
  filteredEvents: new State([], true, 'filtered events'),
  filter: new State('', true, 'filter text'),
  highlights: new State([], true, 'cells of filtered rows to be highlighted'),
  selectedEvents: new State([], true, 'selected events'),
  activeEvent: new State(null, true, 'event that is currently being edited'),
  mode: new State(Mode.CLEAN, true, 'application mode'),
};
