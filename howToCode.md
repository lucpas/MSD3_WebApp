How to code:

1. Sicherstellen, dass npm installiert ist: `npm --v`
2. Dependencies installieren: `npm install`
3. Check- und Fix-Scripte ausführen
4. Live-Server starten
5. (coding)
6. Check- und Fix-Skripte ausführen
7. Wenn mehr Fehler/Warnungen als vorher --> Fixen!!!
8. Ansonsten git add, commit, push
9. ...
10. Profit

Skripte (siehe package.json):

- `npm run dev`: Startet den Liveserver
- `npm run check:html`: Validiert index.html gegen den W3C-Validator
- `npm run check:css`: Stylecheck für style.css (weniger Fehler --> besser :-) )
- `npm run check:js`: Führt eslint aus (Styleguide: AirBnB)
- `npm run fix:js`: Führt die Autofix-Funktion von eslint aus
