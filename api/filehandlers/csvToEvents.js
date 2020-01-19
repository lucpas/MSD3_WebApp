const parse = require('csv-parse/lib/sync');

// Convert an incoming csv string to an array of JS event objects
function convertCSVToEventsArray(csv) {
  const events = parse(csv, {
    delimiter: ';',
    from_line: 1,
  }).map((event) => ({
    title: event[0],
    description: event[1],
    date: event[2],
    time: event[3],
    place: event[4],
    contact: event[5],
    institute: event[6],
    entry: event[7],
  }));

  return events;
}

module.exports = convertCSVToEventsArray;
