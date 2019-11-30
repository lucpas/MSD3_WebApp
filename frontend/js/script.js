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
  DOM.modalButton = document.getElementById('addEventButton');
  // eslint-disable-next-line prefer-destructuring
  DOM.modalCloseSpan = document.getElementsByClassName('close')[0];
  DOM.inputDateElem = document.getElementById('inpDate');

  getEvents();

  DOM.printButton.addEventListener('click', printTable);
  DOM.searchField.addEventListener('input', (event) => filterTable(event.target.value));

  DOM.modalButton.onclick = () => {
    DOM.modal.style.display = 'block';
    getCurrentDate();
  };

  DOM.modalCloseSpan.onclick = () => {
    (DOM.modal.style.display = 'none');
  };

  window.setInterval(() => getEvents(), 30000);
};

window.onclick = (event) => {
  if (event.target === DOM.modal) {
    DOM.modal.style.display = 'none';
  }
};

function getEvents() {
  const request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();

  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const { responseText } = request;
      events = JSON.parse(responseText);
      console.log(events);
      drawTable(events);
      // console.log(tableData);
    }
  };
}

function updateEvent(selectedEvent) {
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
    for (const column of orderedEventDefinitions) {
      cell = row.insertCell(-1);
      cell.innerText = event[column.dataLabel];
      cell.setAttribute('data-title', column.presentationLabel);
    }
  });
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
        matches.push({ index: matchCount, key });
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
