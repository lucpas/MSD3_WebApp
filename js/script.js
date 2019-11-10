var events = {};

var eventJSON = `[{
    "title": "Sommerfest 2020",
    "description": "Wir feiern den Sommer!",
    "date": "20.06.2020",
    "time": "15:00",
    "place": "Innenhof FH Joanneum Graz",
    "contact": "sommerfest@fh-joanneum.at",
    "institut": "Bauplanung und Bauwirtschaft",
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
    "institut": "Institut Design & Kommunikation",
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
    "institut": "Verschiedene",
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
    "institut": "Campus",
    "entry": "15€",
    "bouncycastle": "Ja"
  }
]`;

window.onload = () => {
  events = JSON.parse(eventJSON);
  drawTable(events);
};

function drawTable(events) {
  const rows = events.length - 1;
  const cells = document.getElementById('tableEvents').rows[0].cells.length;

  var table = document.getElementById('tableEvents');
  var row = '';
  var cell = '';
  for (var i = 0; i <= rows; i++) {
    row = table.insertRow(-1);
    for (var j = 0; j <= cells; j++) {
      cell = row.insertCell(-1);
      var position = j;
      switch (position) {
        case 0:
          cell.innerHTML = events[i].title;
          break;
        case 1:
          cell.innerHTML = events[i].description;
          break;
        case 2:
          cell.innerHTML = events[i].date;
          break;
        case 3:
          cell.innerHTML = events[i].time;
          break;
        case 4:
          cell.innerHTML = events[i].place;
          break;
        case 5:
          cell.innerHTML = events[i].contact;
          break;
        case 6:
          cell.innerHTML = events[i].institut;
          break;
        case 7:
          cell.innerHTML = events[i].entry;
          break;
        case 8:
          cell.innerHTML = events[i].bouncycastle;
          break;
        default:
      }
    }
  }
};

function printTable() {
  //Get the tabledata by id
  var table = document.getElementById('tableEvents');
  //new empty window
  var printWin = window.open('');
  //fill tabledata in new window
  printWin.document.write(table.outerHTML);
  //function to open printdialog
  printWin.print();
  //close the "new page" after printing
  printWin.close();
}

//console.log(eventData[0].title)
console.log('Script loaded');
