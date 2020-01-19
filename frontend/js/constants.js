import { State } from './state.js';

// URL of backend api (prod and dev)
const backendURL = 'https://msd3-webapp.herokuapp.com/api';
// const backendURL = 'http://localhost:8080/api';

// Console logs are only allowed when this is on!
const enableLogging = true;

// Temporary ID of rows that have not been given a backend ID yet
const newRowID = 'NEW';

// List of all FH Joanneum Institutes
const institutes = [
  'Angewandte Produktionswissenschaften',
  'Architektur & Management',
  'Bank- und Versicherungswirtschaft',
  'Bauplanung und Bauwirtschaft',
  'Biomedizinische Analytik',
  'Design & Kommunikation',
  'Diaetologie',
  'eHealth',
  'Electronic Engineering',
  'Energie-, Verkehrs- und Umweltmanagement',
  'Ergotherapie',
  'FH Allgemein',
  'Fahrzeugtechnik / Automotive Engineering',
  'Gesundheits- und Krankenpflege',
  'Gesundheits- und Tourismusmanagement',
  'Hebammenwesen',
  'Industriewirtschaft',
  'Informationsmanagement',
  'International Management',
  'Internet-Technologien & -Anwendungen',
  'Journalismus und Public Relations',
  'Logopaedie',
  'Luftfahrt / Aviation',
  'Physiotherapie',
  'Product & Transportation Design',
  'Radiologietechnologie',
  'Soziale Arbeit',
];


// Types of input fields used
const textArea = document.createElement('textarea');
const inputDate = document.createElement('input');
inputDate.setAttribute('type', 'date');
const inputTime = document.createElement('input');
inputTime.setAttribute('type', 'time');
const instituteDataListID = 'institutes';
const instituteDropdown = document.createElement('input');
instituteDropdown.setAttribute('list', instituteDataListID);

// Ordered definition of events
const orderedEventDefinitions = [
  {
    dataLabel: 'title',
    presentationLabel: 'Titel',
    inputField: textArea,
  },
  {
    dataLabel: 'description',
    presentationLabel: 'Beschreibung',
    inputField: textArea,
  },
  {
    dataLabel: 'date',
    presentationLabel: 'Datum',
    inputField: inputDate,
  },
  {
    dataLabel: 'time',
    presentationLabel: 'Uhrzeit',
    inputField: inputTime,
  },
  {
    dataLabel: 'place',
    presentationLabel: 'Ort',
    inputField: textArea,
  },
  {
    dataLabel: 'contact',
    presentationLabel: 'Kontakt',
    inputField: textArea,
  },
  {
    dataLabel: 'institute',
    presentationLabel: 'Institut',
    inputField: instituteDropdown,
  },
  {
    dataLabel: 'entry',
    presentationLabel: 'Eintritt',
    inputField: textArea,
  },
];

const instituteDefaultValue = 'FH Allgemein';

export const CONSTANTS = {
  backendURL,
  orderedEventDefinitions,
  enableLogging,
  newRowID,
  institutes,
  instituteDefaultValue,
  instituteDataListID,
};

// Collection of all unique DOM elements required to run script --> filled during onload
export const DOM = {};

// General mode the app is in
export const Mode = {
  CLEAN: 1, // no rows being edited, selected or created
  SELECTING: 2, // one or more rows are selected but none is edited or created
  EDITING: 3, // a existing row is being edited
  POPUP: 4, // a popup message is currently displayed
};

// Object containing all application state
export const state = {
  allEvents: new State([], true, 'list of all events'),
  displayedEvents: new State([], true, 'filtered events'),
  filter: new State('', true, 'filter text'),
  matches: new State([], true, 'cells of filtered rows to be highlighted'),
  selectedEvents: new State([], true, 'selected events'),
  activeEvent: new State(null, true, 'event that is currently being edited'),
  mode: new State(Mode.CLEAN, true, 'application mode'),
  message: new State({
    heading: null,
    text: null,
    backdropClickHandler: null,
    okButtonClickHandler: null,
    cancelButtonClickHandler: null,
  }, true, 'popup message'),
};
