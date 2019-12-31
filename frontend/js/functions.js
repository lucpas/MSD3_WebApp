// ----------- IO
function fetchEvents(url, callback) {
  console.log('DEBUG_fetchEvents:', url, callback);

  const request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();

  // eslint-disable-next-line func-names
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // state.set({ events: JSON.parse(request.responseText) })
      // state.dumpToConsole()

      if (typeof callback === 'function') {
        callback(JSON.parse(request.responseText));
      }
    }
  };
}

function pushNewEvent(url, callback, selectedEvent) {
  console.log('DEBUG_pushNewEvent:', url, callback, selectedEvent);

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

function pushUpdatedEvent(url, callback, selectedEvent) {
  console.log('DEBUG_pushNewEvent:', url, callback, selectedEvent);
  
  const request = new XMLHttpRequest();
  request.open('PUT', `${url}/${selectedEvent.id}`, true);
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

// ----------- UTILS

function renderTable(events, tableBody, orderedEventDefinitions) {
  console.log('DEBUG_renderTable:params:', events, tableBody);

  tableBody.innerHTML = '';

  events.forEach(event => {
    let tRow = tableBody.insertRow(0);
    tRow.setAttribute('id', event.id);

    // Write event data to table
    // eslint-disable-next-line no-restricted-syntax
    for (const column of orderedEventDefinitions) {
      let cell = tRow.insertCell(-1);

      const inputField = document.createElement('textarea');
      inputField.value = event[column.dataLabel];
      inputField.setAttribute('disabled', '');

      cell.classList.add(column.dataLabel);
      cell.setAttribute('id', `${event.id}_${column.dataLabel}`);
      cell.setAttribute('data-title', column.presentationLabel);
      cell.appendChild(inputField);
    }
  });
}

function filterEvents(filterText, events) {
  console.log('DEBUG_filterEvents:', filterText, events);
  const matches = [];

  // do not filter if less than 3 characters were entered
  if (filterText.length < 3) {
    return { events, matches };
  }

  // filter events
  const filteredEvents = events.filter(event => {
    let isMatch = false;
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(event)) {
      if (value.toLowerCase().includes(filterText.toLowerCase())) {
        matches.push(`${event.id}_${key}`);
        isMatch = true;
      }
    }

    return isMatch;
  });

  // console.log('DEBUG_filterEvents:results:', filteredEvents, matches);
  return { events: filteredEvents, matches };
}

function highlightFilterMatches(matches) {
  console.log('DEBUG_highlightFilterMatches:', matches);

  matches.forEach(match => {
    document.getElementById(match).classList.add('highlight');
  });
}

function createEventOutOfRow(rowId) {
  console.log('DEBUG_createEventOutOfRow:', rowId);

  const { cells } = document.getElementById(rowId);

  return {
    title: cells[0].firstChild.value,
    description: cells[1].firstChild.value,
    date: cells[2].firstChild.value,
    time: cells[3].firstChild.value,
    place: cells[4].firstChild.value,
    contact: cells[5].firstChild.value,
    institute: cells[6].firstChild.value,
    entry: cells[7].firstChild.value,
  };
}

function unlockTableRow(rowId) {
  const tableRow = document.getElementById(rowId);

  for (const cell of tableRow.cells) {
    cell.firstChild.removeAttribute('disabled');
  }
}

function lockTableRow(rowId) {
  const tableRow = document.getElementById(rowId);

  for (const cell of tableRow.cells) {
    cell.firstChild.setAttribute('disabled', '');
  }
}

function createEmptyRow(tableBody, orderedEventDefinitions) {
  console.log('DEBUG_createEmptyRow:', tableBody);

  const tRow = tableBody.insertRow(0);
  tRow.setAttribute('id', 'NEW');

  let cell;
  // eslint-disable-next-line no-restricted-syntax
  for (const column of orderedEventDefinitions) {
    cell = tRow.insertCell(-1);
    const inputField = document.createElement('textarea');
    inputField.value = '';

    cell.classList.add(column.dataLabel);
    cell.setAttribute('data-title', column.presentationLabel);
    cell.appendChild(inputField);
  }
}


export {
  fetchEvents,
  pushNewEvent,
  pushUpdatedEvent,
  renderTable,
  filterEvents,
  highlightFilterMatches,
  createEventOutOfRow,
  unlockTableRow,
  lockTableRow,
  createEmptyRow
};
