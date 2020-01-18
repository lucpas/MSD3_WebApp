// Convert an incoming array of JS event objects to a CSV string
function convertEventsArrayToCSV(events) {
  let csv = '';

  events.forEach((event) => {
    const row = [event.title, event.description, event.date, event.time, event.place, event.contact, event.institute, event.entry].join(';');

    csv += `${row}\r\n`;
  });

  return csv;
}

module.exports = convertEventsArrayToCSV;
