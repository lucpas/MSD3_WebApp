'use strict';

// Temporary sample data
const eventJSON = `[{
    "title": "Sommerfest 2020",
    "description": "Wir feiern den Sommer!",
    "date": "20.06.2020",
    "time": "15:00",
    "place": "Innenhof FH Joanneum Graz",
    "contact": "sommerfest@fh-joanneum.at",
    "institute": "Bauplanung und Bauwirtschaft",
    "entry": "Gratis",
    "bouncycastle": "Ja"
  },
  {
    "title": "Lectures: Moodley Group 2 von 3",
    "description": "Corporate Design",
    "date": "29.11.2019",
    "time": "17:00",
    "place": "Medienfabrik Graz",
    "contact": "moodley.at/get-in-touch/",
    "institute": "Institut Design & Kommunikation",
    "entry": "fh-joanneum.at",
    "bouncycastle": "Nein"
  },
  {
    "title": "FUNtech 2020",
    "description": "Technik zum Angreifen",
    "date": "10.-13.02.2020",
    "time": "08:30-15:00",
    "place": "FH Joanneum Graz",
    "contact": "fh-joanneum.at",
    "institute": "Verschiedene",
    "entry": "Gratis",
    "bouncycastle": "Ja"
  },
  {
    "title": "Weihnachtsfeier 2020",
    "description": "Merry Christmas!",
    "date": "20.12.2020",
    "time": "19:00",
    "place": "FH Joanneum Graz",
    "contact": "fh-joanneum.at/weihnachtsfest",
    "institute": "Campus",
    "entry": "15€",
    "bouncycastle": "Ja"
  }
]`;

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
  {
    dataLabel: 'bouncycastle',
    presentationLabel: 'Hüpfburg',
  },
];

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
  DOM.modalCloseSpan = document.getElementsByClassName('close')[0];

  events = JSON.parse(eventJSON);
  drawTable(events);

  DOM.printButton.addEventListener('click', printTable);

  DOM.searchField.addEventListener('input', event =>
    filterTable(event.target.value),
  );

  DOM.modalButton.onclick = () => (DOM.modal.style.display = 'block');

  DOM.modalCloseSpan.onclick = () => (DOM.modal.style.display = 'none');
};

window.onclick = event => {
  if (event.target == DOM.modal) {
    DOM.modal.style.display = 'none';
  }
};

// Shorter version of drawTable function
function drawTable(events) {
  DOM.tBody.innerHTML = '';
  // DOM.table.appendChild(DOM.tHeader);

  let row;
  let cell;

  events.forEach(event => {
    row = DOM.tBody.insertRow(-1);
    for (let column of orderedEventDefinitions) {
      cell = row.insertCell(-1);
      cell.innerText = event[column.dataLabel];
      cell.setAttribute('data-title', column.presentationLabel);
    }
  });
}

function printTable() {
  //new empty window
  var printWin = window.open('');
  //fill tabledata in new window
  printWin.document.write(DOM.table.outerHTML);
  //function to open printdialog
  printWin.print();
  //close the "new page" after printing
  printWin.close();
}

function filterTable(filterText) {
  // do not filter if less than 3 characters were entered
  if (filterText.length < 3) {
    drawTable(events);
    return;
  }

  filterText = filterText.toLowerCase();
  const matches = [];
  let matchCount = 0;

  // filter events
  const filteredEvents = events.filter(event => {
    let isMatch = false;
    for (let key in event) {
      if (event[key].toLowerCase().includes(filterText)) {
        matches.push({ index: matchCount, key });
        isMatch = true;
      }
    }

    if (isMatch) {
      matchCount++;
    }
    return isMatch;
  });

  // redraw table
  drawTable(filteredEvents);

  // highlight matching cells
  matches.forEach(match => {
    highlightTableCell(
      match.index,
      orderedEventDefinitions.findIndex(
        eventDef => eventDef.dataLabel === match.key,
      ),
    );
  });
}

function highlightTableCell(rowIndex, columnIndex) {
  // increment row index to account for table header
  DOM.table.rows[rowIndex + 1].cells[columnIndex].classList.add('highlight');
}
