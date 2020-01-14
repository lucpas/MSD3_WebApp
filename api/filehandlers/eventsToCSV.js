// Convert an incoming array of JS event objects to a CSV string
function convertEventsArrayToCSV(events) {

  let csv = "data:text/csv;charset=utf-8,";

    events.forEach(function(rowArray) {
    let row = rowArray.join(";");
    csv += row + "\r\n";
    });

  return csv;
}

module.exports = convertEventsArrayToCSV;
