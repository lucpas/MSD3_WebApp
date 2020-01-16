// Ordered definition of events
const orderedEventDefinitions = [{
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
    presentationLabel: 'Anmeldung/Eintritt',
  },
];

// URLs of backend api: production, development
// const url = 'https://msd3-webapp.herokuapp.com/api/events';
const url = 'http://localhost:8080/api';

// Collection of all loaded events --> filled during onload
let events = [];

// Collection of all DOM elements required to run script --> filled during onload
const DOM = {};

// Initialization and first render
window.onload = () => {
  DOM.table = document.getElementById('tableEvents');
  DOM.tBody = document.getElementById('tableBody');
  DOM.tHeader = document.getElementById('tableHeader');
  DOM.printButton = document.getElementById('printButton');
  DOM.searchField = document.getElementById('searchfield');
  DOM.modal = document.getElementById('addEventModal');
  DOM.addEventButton = document.getElementById('addEventButton');
  DOM.inputButton = document.getElementById('importButton');
  DOM.exportCSVButton = document.getElementById('exportCSVButton');
  DOM.exportPDFButton = document.getElementById('exportPDFButton');
  // eslint-disable-next-line prefer-destructuring
  DOM.modalCloseSpan = document.getElementsByClassName('close')[0];
  DOM.inputTitle = document.getElementById('inpTitle');
  DOM.inputDesc = document.getElementById('inpDescription');
  DOM.inputDate = document.getElementById('inpDate');
  DOM.inputTime = document.getElementById('inpTime');
  DOM.inputLoc = document.getElementById('inpLocation');
  DOM.inputContact = document.getElementById('inpContact');
  DOM.inputInst = document.getElementById('inpInstitute');
  DOM.inputSignup = document.getElementById('inpSignup');
  DOM.saveEventButton = document.getElementById('saveEventButton');

  DOM.printButton.addEventListener('click', printTable);
  DOM.searchField.addEventListener('input', (event) => filterTable(event.target.value));
  DOM.inputButton.addEventListener('click', importEvents);
  DOM.exportCSVButton.addEventListener('click', exportCSVEvents);
  DOM.exportPDFButton.addEventListener('click', exportPDFEvents);

  DOM.inputTitle.addEventListener('blur', () => checkInp(DOM.inputTitle));
  DOM.inputDesc.addEventListener('blur', () => checkInp(DOM.inputDesc));
  DOM.inputDate.addEventListener('blur', () => checkInp(DOM.inputDate));
  DOM.inputTime.addEventListener('blur', () => checkInp(DOM.inputTime));
  DOM.inputLoc.addEventListener('blur', () => checkInp(DOM.inputLoc));
  DOM.inputContact.addEventListener('blur', () => checkInp(DOM.inputContact));
  DOM.inputInst.addEventListener('blur', () => checkInp(DOM.inputInst));
  DOM.inputSignup.addEventListener('blur', () => checkInp(DOM.inputSignup));

  DOM.addEventButton.onclick = () => {
    DOM.saveEventButton.style = 'initial';
    DOM.inputTitle.value = '';
    DOM.inputDesc.value = '';
    DOM.inputDate.value = new Date().toISOString().substr(0, 10);
    DOM.inputTime.value = '';
    DOM.inputLoc.value = '';
    DOM.inputContact.value = '';
    DOM.inputInst.value = '';
    DOM.inputSignup.value = '';
    DOM.saveEventButton.innerHTML = 'Anlegen';
    DOM.saveEventButton.onclick = () => {
      const newEvent = createEvent();
      if (isValidEvent(newEvent)) {
        pushNewEvent(newEvent, () => {
          events.push(newEvent);
          drawTable(events);
          DOM.modal.style.display = 'none';
        });
        fetchEvents();
      } else {
        // Temp error message/ TODO: Sprint 3 validate -> errorMessage()
        errorMessage();
      }
    };
    DOM.modal.style.display = 'block';
  };

  DOM.modalCloseSpan.onclick = () => {
    DOM.modal.style.display = 'none';
  };

  fetchEvents();
  window.setInterval(() => fetchEvents(), 30000);
};

function checkInp(inpField) {
  const checkEvent = createEvent();
  const currInpField = inpField;
  validateEvent(checkEvent, currInpField, () => {
    currInpField.style.borderColor = 'initial';
    DOM.saveEventButton.disabled = false;
    DOM.saveEventButton.style = 'initial';

  });
};

function validateEvent(checkEvent, inpField, callback) {
  const request = new XMLHttpRequest();
  request.open('POST', url + "?validate=true");
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  const stringCheckEvent = JSON.stringify(checkEvent)
  request.send(stringCheckEvent);
  //console.log(JSON.stringify(checkEvent))
  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        if (typeof callback === 'function') {
          callback();
        }
      } else if (this.status === 400) {
        console.log(stringCheckEvent.indexOf(inpField.id) )
        if (stringCheckEvent.indexOf(inpField.id) === -1) {
          inpField.style.borderColor = 'red';
          DOM.saveEventButton.disabled = true;
          DOM.saveEventButton.style.background = 'grey';
          DOM.saveEventButton.style.border = 'grey';
        }
      }
    }
  }

};


window.onclick = (event) => {
  if (event.target === DOM.modal) {
    DOM.modal.style.display = 'none';
  }
};

function fetchEvents(callback) {
  // console.log('DEBUG: Starting fetch');

  const request = new XMLHttpRequest();
  request.open('GET', `${url}/events`);
  request.send();

  // eslint-disable-next-line func-names
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      events = JSON.parse(request.responseText);
      // console.log('DEBUG: Completed fetch');
      filterTable(DOM.searchField.value);

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
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 201) {
      if (typeof callback === 'function') {
        callback();
      }
    }
  };
}

function pushUpdatedEvent(selectedEvent, callback) {
  const request = new XMLHttpRequest();
  request.open('PUT', `${url}/events/${selectedEvent.id}`, true);
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

// Shorter version of drawTable function
function drawTable(selectedEvents) {
  DOM.tBody.innerHTML = '';
  // DOM.table.appendChild(DOM.tHeader);

  let row;
  let cell;

  selectedEvents.forEach((event) => {
    row = DOM.tBody.insertRow(-1);

    // Write event data to table
    // eslint-disable-next-line no-restricted-syntax
    for (const column of orderedEventDefinitions) {
      cell = row.insertCell(-1);
      cell.innerText = event[column.dataLabel];
      cell.setAttribute('data-title', column.presentationLabel);
    }

    // Add edit button
    const editButton = document.createElement('img');
    editButton.src = 'img/pencil.svg';
    editButton.alt = 'edit icon';
    editButton.height = '20';
    editButton.width = '20';

    editButton.addEventListener('click', () => editEvent(event));
    editButton.classList.add('icon');

    // Add delete button
    const deleteButton = document.createElement('img');
    deleteButton.src = 'img/delete.svg';
    deleteButton.alt = 'delete icon';
    deleteButton.height = '20';
    deleteButton.width = '20';

    deleteButton.addEventListener('click', () => deleteEvent(event, () => {
      events.delete(event);
      fetchEvents(() => drawTable(events));
      DOM.modal.style.display = 'none';
    }));
    deleteButton.classList.add('icon');

    cell = row.insertCell(-1);
    cell.setAttribute('data-title', 'Aktionen');
    cell.appendChild(editButton);
    cell.appendChild(deleteButton);
  });
}

function isValidEvent(event) {
  return Object.values(event).every((prop) => prop !== '' && prop !== null);
}

function createEvent() {
  return {
    title: DOM.inputTitle.value,
    description: DOM.inputDesc.value,
    date: DOM.inputDate.value,
    time: DOM.inputTime.value,
    place: DOM.inputLoc.value,
    contact: DOM.inputContact.value,
    institute: DOM.inputInst.value,
    entry: DOM.inputSignup.value,
  };
}

function editEvent(event) {
  DOM.saveEventButton.style = 'initial';
  DOM.saveEventButton.innerHTML = 'Übernehmen';
  DOM.inputTitle.value = event.title;
  DOM.inputDesc.value = event.description;
  DOM.inputDate.value = event.date;
  DOM.inputTime.value = event.time;
  DOM.inputLoc.value = event.place;
  DOM.inputContact.value = event.contact;
  DOM.inputInst.value = event.institute;
  DOM.inputSignup.value = event.entry;
  DOM.saveEventButton.onclick = () => {
    const updatedEvent = createEvent();
    updatedEvent.id = event.id;
    if (isValidEvent(updatedEvent)) {
      pushUpdatedEvent(updatedEvent, () => {
        const eventIndex = events.findIndex((e) => e.id === updatedEvent.id);
        events[eventIndex] = updatedEvent;
        drawTable(events);
        DOM.modal.style.display = 'none';
      });
    } else {
      // Temp error message/ TODO: Sprint 3 validate -> errorMessage()
      errorMessage();
    }
  };
  DOM.modal.style.display = 'block';
}

function deleteEvent(selectedEvent, callback) {
  const request = new XMLHttpRequest();
  request.open('DELETE', `${url}/events/${selectedEvent.id}`, true);
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send(JSON.stringify(selectedEvent));

  // eslint-disable-next-line func-names
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 204) {
      if (typeof callback === 'function') {
        callback();
      }
    }
  };
}

// Params: {status ('warning', error), message: String}
function errorMessage(message, title) {
  if (!title) title = 'Fehler';

  if (!message) message = 'Fehler bei der Eingabe.';

  $('<div></div>').html(message).dialog({
    title,
    resizable: false,
    modal: true,
    buttons: {
      Ok() {
        $(this).dialog('close');
      },
    },
  });
}

function printTable() {
  // new empty window
  const printWin = window.open('');
  // fill tabledata in new window
  const table = DOM.table.outerHTML;
  printWin.document.write(table);
  // table.column[1].style.display="none";
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

function importEvents() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'text/csv');
  input.addEventListener('change', handleFiles, false);
  let file;

  function handleFiles() {
    // const boundary = '----'

    file = this.files[0];
    const formData = new FormData();
    // formData.append('boundary', boundary);
    formData.append('readme.me', file, 'readme.me');
    // formData.append('boundary', boundary);
    const request = new XMLHttpRequest();
    request.open('POST', `${url}/upload/csv`, true);
    // request.setRequestHeader('Content-type', 'multipart/form-data');
    // eslint-disable-next-line func-names
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          console.log('Successfully sent CSV');
        } else {
          console.log('failed to sent csv');
        }
      }
    };
    request.send(file);
  }
  input.click();

  return false; // avoiding navigation
}

function exportCSVEvents() {
  const request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const downloadUrl = URL.createObjectURL(request.response);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = downloadUrl;
      a.download = '';
      a.click();
    }
  };
  request.open('GET', `${url}/download/csv`, true);
  request.responseType = 'blob';
  request.send();
}

function exportPDFEvents() {
  const request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const downloadUrl = URL.createObjectURL(request.response);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = downloadUrl;
      a.download = '';
      a.click();
    }
  };
  request.open('GET', `${url}/download/pdf`, true);
  request.responseType = 'blob';
  request.send();
}
