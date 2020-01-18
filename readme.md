## FH JOANNEUM: events

This page was developed as part of the courses "Agile Project Management" and "Web Application Development" on the "Mobile Software Development" course. It is not an official FH JOANNEUM website.


### Developer:
- Kienzl Eva-Maria
- Kostmann Florian
- Luckhaus Pascal
- Reindl Jakob
- Sundl Simon
- Wurm Leopold


### HowToCode
Coding workflow:

1. Make sure npm is installed: `npm --v`
2. Install / update dependencies: `npm install`
3. Download .env from the Trello-Card "Resources" and copy it to the project directory
4. Execute `source .env` in the terminal
5. Execute check scripts
6. Start the live server: `npm run dev`
7. (coding)
8. Run check scripts
9. If more errors / warnings than before -> fix!!!
10. Otherwise git add, commit, push

Scripts (see package.json):
- `npm run dev`: starts the live server
- `npm run check: html`: Validates index.html against the W3C validator
- `npm run check: css`: Stylecheck and Autofix for style.css (Styleguide: [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard))
- `npm run check: js`: runs eslint with autofix (style guide: AirBnB)


### Sprint1

#### Userstory 1: List overview
An employee wants to have access to a current overview list. This overview list should include selected data about current needed data sets. In special cases the office management want to access this list on a mobile device or they want to print those list.

#### Userstory 2: Search
The amount of data will increase really fast. The personas Lisa and Norbert want an easy way to get only a subset of data. Lists will be too long to work efficiantly, if they include all datasets.

#### Userstory 3: Inserting new data
Norbert and Lisa want to insert all information in to the new course management system. It's necessary that both are able to add new data, because it's faster and less work to directly insert, and also state-of-the-art.


### Sprint 2

#### Userstory 4: Persistent data
At the next step it's important, that normal office users should be able to store data without any special (IT) knowledge. Inserting new data should be as easy as listing/requesting/showing existing data. 

#### Userstory 5: Edit single dataset
Lisa gets a lot of requests to change existing data every day, because of old deprecated information. Lisa wants to change the content of single fields and save the new information.

#### Userstory 6: Different look and feel
Norbert and Lisa are a little bit confused. Now they have a couple of different designs, different lists, and a mixup of german and english buttons, headlines, ... They prefer german language, and a nonstop look and feel through the course management system. 


### Sprint 3

#### Userstory 7: Input validation
The input needs to be validated before storing data to the course management system. Only validated data should be stored persistently.

#### Userstory 8: Remove data
The office management want to remove datasets from the course management system. They want to select data from the overview list, where they could finally remove them.

#### Userstory 9: Export list
There are some special cases, where the office management needs an exported list, e.g. event lists. The exports include a complete list of all data entries.

#### Userstory 10: Import list
Lisa and Norbert said, that a lot time can be saved, if the system is able to import data from a existing list.


The information regarding the user stories was provided by Michael Ulm. 

### Test criteria
- Test protocol
- Manual browser testing
- W3C valid
- No errors in web developer view (console)

Continous Deployment under https://msd3-webapp.herokuapp.com/
