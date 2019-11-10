var events = {};

var eventData = [{
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
]

events.drawTable = function(rows, cells) {
  var table = document.getElementById('tableEvents')
  var row = "";
  var cell = "";
  for (var i = 0; i <= rows; i++) {
    row = table.insertRow(-1);
    for (var j = 0; j <= cells; j++) {
      cell = row.insertCell(-1);
      var position = j;
      switch (position) {
        case 0:
          cell.innerHTML = eventData[i].title;
          break;
        case 1:
          cell.innerHTML = eventData[i].description;
          break;
        case 2:
          cell.innerHTML = eventData[i].date;
          break;
        case 3:
          cell.innerHTML = eventData[i].time;
          break;
        case 4:
          cell.innerHTML = eventData[i].place;
          break;
        case 5:
          cell.innerHTML = eventData[i].contact;
          break;
        case 6:
          cell.innerHTML = eventData[i].institut;
          break;
        case 7:
          cell.innerHTML = eventData[i].entry;
          break;
        case 8:
          cell.innerHTML = eventData[i].bouncycastle;
          break;
        default:
      }
    }
  }
};



//console.log(eventData[0].title)
console.log("Script loaded");
