// Convert an incoming array of JS event objects to a PDF binary object
// in some service
const PdfTable = require('voilab-pdf-table');
const PdfDocument = require('pdfkit');

function convertEventsArrayToPDF(events) {
  // create a PDF from PDFKit, and a table from PDFTable
  const pdf = new PdfDocument({
    autoFirstPage: false,
    size: 'A4',
    layout: 'landscape',
  });
  pdf.info.Title = 'Events';


  const headertable = new PdfTable(pdf, {
    bottomMargin: 10,
  });

  const table = new PdfTable(pdf, {
    bottomMargin: 10,
  });

  headertable

    // set defaults to your columns
    .setColumnsDefaults({
      headerBorder: 'B',
      align: 'center',
      padding: [2, 2, 10, 2],
      // lineGap: 3.1,


    })
    // add table columns
    .addColumns([
      // headerCols

      {
        id: 'htitle',
        header: 'Titel',
        width: 100,
        align: 'left',

      },
      {
        id: 'hdescription',
        header: 'Beschreibung',
        width: 100,

      },
      {
        id: 'hdate',
        header: 'Datum',
        width: 50,

      },
      {
        id: 'htime',
        header: 'Uhrzeit',
        width: 50,
      },
      {
        id: 'hplace',
        header: 'Ort',
        width: 100,
      },
      {
        id: 'hcontact',
        header: 'Kontakt',
        width: 100,
      },
      {
        id: 'hinstitute',
        header: 'Institut',
        width: 100,
      },
      {
        id: 'hentry',
        header: 'Eintritt',
        width: 100,
      },

    ]);

  table
  // add some plugins (here, a 'fit-to-width' for a column)
  // .addPlugin(new(require('voilab-pdf-table/plugins/fitcolumn'))({
  //   column: 'title',
  // }))

    // set defaults to your columns
    .setColumnsDefaults({
      headerBorder: 'B',
      align: 'center',
      padding: [2, 2, 2, 2],
      // lineGap: 3.1,
    })
    // add table columns
    .addColumns([

      // MainBody
      {
        id: 'title',
        // header: 'Titel',
        width: 100,
        align: 'left',

      },
      {
        id: 'description',
        // header: 'Beschreibung',
        width: 100,

      },
      {
        id: 'date',
        // header: 'Datum',
        width: 50,

      },
      {
        id: 'time',
        // header: 'Uhrzeit',
        width: 50,
      },
      {
        id: 'place',
        // header: 'Ort',
        width: 100,
      },
      {
        id: 'contact',
        // header: 'Kontakt',
        width: 100,
      },
      {
        id: 'institute',
        // header: 'Institut',
        width: 100,
      },
      {
        id: 'entry',
        // header: 'Eintritt',
        width: 100,
      },
    ])
    // add events (here, we draw headers on each new page)
    .onPageAdded(() => {
      pdf.fontSize('12');
      headertable.addHeader();
      pdf.fontSize('9');
    });
  // if no page already exists in your PDF, do not forget to add one
  pdf.addPage();

  pdf.fontSize('20').text('Events der FH Joanneum', {
    align: 'center',
  });
  pdf.moveDown();

  pdf.fontSize('12');
  headertable.addHeader();
  pdf.fontSize('9');

  // draw content, by passing data to the addBody method
  events.forEach((event) => {
    table.addBody([{
      emptyLine: '',
    },
    {
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      place: event.place,
      contact: event.contact,
      institute: event.institute,
      entry: event.entry,
    },
    {
      emptyLine: '',
    },
    ]);
  });

  return pdf;
}

module.exports = convertEventsArrayToPDF;
