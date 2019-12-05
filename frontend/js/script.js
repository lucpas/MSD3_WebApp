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
const url = 'https://msd3-webapp.herokuapp.com/api/events';
// const url = 'http://localhost:8080/api/events';

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
  // eslint-disable-next-line prefer-destructuring
  DOM.modalCloseSpan = document.getElementsByClassName('close')[0];
  DOM.inputDateElem = document.getElementById('inpDate');
  DOM.saveEventButton = document.getElementById('saveEventButton');

  DOM.printButton.addEventListener('click', printTable);
  DOM.searchField.addEventListener('input', (event) => filterTable(event.target.value));

  DOM.addEventButton.onclick = () => {
    getCurrentDate();
    document.getElementById('inpTitle').value = "";
    document.getElementById('inpDescription').value ="";
    document.getElementById('inpDate').value = new Date().toISOString().substr(0, 10),
    document.getElementById('inpTime').value = "";
    document.getElementById('inpLocation').value = "";
    document.getElementById('inpContact').value = "";
    document.getElementById('inpInstitute').value = "";
    document.getElementById('inpSignup').value = "";
  // TODO: Set submit button text to 'Übernehmen'
    DOM.saveEventButton.innerHTML = 'Anlegen';
    DOM.saveEventButton.onclick = () => {
      DOM.modal.style.display = 'none';
      const newEvent = createEvent();
      if (isValidEvent(newEvent)) {
        console.log(newEvent)
        pushNewEvent(newEvent);
        fetchEvents();
      } else {
        console.log("Error in POST-Request")
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

window.onclick = (event) => {
  if (event.target === DOM.modal) {
    DOM.modal.style.display = 'none';
  }
};

function fetchEvents() {
  const request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();

  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const {
        responseText
      } = request;
      events = JSON.parse(responseText);
      drawTable(events);
    }
  };
}

function pushNewEvent(selectedEvent) {
  const request = new XMLHttpRequest();
  request.open('POST', url);
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send(JSON.stringify(selectedEvent));
}

function pushUpdatedEvent(selectedEvent) {
  const request = new XMLHttpRequest();
  request.open('PUT', `${url}/${selectedEvent.id}`, true);
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send(selectedEvent);
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
    for (const column of orderedEventDefinitions) {
      cell = row.insertCell(-1);
      cell.innerText = event[column.dataLabel];
      cell.setAttribute('data-title', column.presentationLabel);
    }

    // Add edit button
    const editButton = document.createElement('button');
    editButton.addEventListener('click', () => editEvent(event));
    editButton.classList.add('btn_edit');
    editButton.innerText = 'Event bearbeiten';
    cell = row.insertCell(-1);
    cell.appendChild(editButton);
  });
}

function isValidEvent(event) {
  let isValid = false;
  if (event.title !== "" && event.description !== "" && event.date !== null && event.time !== "" && event.place !== "" && event.contact !== "" && event.institute !== "" && event.entry !== "") {
    isValid = true;
  }
  return isValid;
}

function createEvent() {
  let event = {
    title: document.getElementById('inpTitle').value,
    description: document.getElementById('inpDescription').value,
    date: document.getElementById('inpDate').value,
    time: document.getElementById('inpTime').value,
    place: document.getElementById('inpLocation').value,
    contact: document.getElementById('inpContact').value,
    institute: document.getElementById('inpInstitute').value,
    entry: document.getElementById('inpSignup').value
  };
  fetchEvents();
  // console.log(event)
  return event;
}

function editEvent(event) {
  // TODO: Show modal and input form
  // TODO: Fill form with event data
  DOM.saveEventButton.innerHTML = 'Übernehmen';
    document.getElementById('inpTitle').value = event.title,
    document.getElementById('inpDescription').value = event.description,
    // document.getElementById('inpDate').value = event.date
    document.getElementById('inpDate').value = new Date().toISOString().substr(0, 10),
    document.getElementById('inpTime').value = event.time,
    document.getElementById('inpLocation').value = event.place,
    document.getElementById('inpContact').value = event.contact,
    document.getElementById('inpInstitute').value = event.institute,
    document.getElementById('inpSignup').value = event.entry
  // TODO: Set submit button text to 'Übernehmen'
  // TODO: Set submit button click event
  //       --> Call createEvent to receive new event out of form data
  //       --> Call isValidEvent
  //            --> if it returns true
  //                --> Close modal
  //                --> Call pushUpdatedElement with updated event
  //                --> Call fetchEvents()
  //            --> if not, show some error
  DOM.saveEventButton.onclick = () => {
    const updateEvent = createEvent();
    updateEvent.id = event.id;
    if (isValidEvent(updateEvent)) {
      DOM.modal.style.display = 'none';
      console.log(updateEvent);
      pushUpdatedEvent(updateEvent);
      fetchEvents();
    } else {
      console.log("Error in PUT-Request")
    }
  };
  DOM.modal.style.display = 'block';

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
}

function getCurrentDate() {
  DOM.inputDateElem.value = new Date().toISOString().substr(0, 10);
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
    for (const key in event) {
      if (event[key].toLowerCase().includes(filterText.toLowerCase())) {
        matches.push({
          index: matchCount,
          key
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
