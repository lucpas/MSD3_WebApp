// Convert an incoming array of JS event objects to a PDF binary object
function convertEventsArrayToPDF(events) {
  let pdf = new jsPDF();

//   var allRows = "";
//
//   events.forEach(function(event) {
//     let row = [event.title, event.description, event.date, event.time, event.place, event.contact, event.institute, event.entry].join(";");
//
//     allRows += row + "\r\n";
//   });
//
//   console.log(allRows)
//
//   pdf.autoTable({
//     head: [
//       ['Titel', 'Beschreibung', 'Datum', 'Uhrzeit', 'Ort', 'Kontakt', 'Institut', 'Anmeldung']
//     ],
//     body: [
//       allRows
//     ]
// });

pdf.autoTable({ html: '#tableEvents'})

// pdf.save('events.pdf')


return pdf;
}

module.exports = convertEventsArrayToPDF;
