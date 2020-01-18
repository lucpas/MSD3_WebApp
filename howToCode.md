Coding-Workflow:

1. Sicherstellen, dass npm installiert ist: `npm --v`
2. Dependencies installieren/updaten: `npm install`
3. .env aus Trello-Card "Ressourcen" runterladen und ins Projektverzeichnis kopieren
4. `source .env` im Terminal ausführen
5. Check-Scripts ausführen
6. Live-Server starten: `npm run dev`
7. (coding)
8. Check-Scripts ausführen
9. Wenn mehr Fehler/Warnungen als vorher --> Fixen!!!
10. Ansonsten git add, commit, push

Skripte (siehe package.json):

- `npm run dev`: Startet den Liveserver
- `npm run check:html`: Validiert index.html gegen den W3C-Validator
- `npm run check:css`: Stylecheck und Autofix für style.css (Styleguide: [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard))
- `npm run check:js`: Führt eslint mit Autofix aus (Styleguide: AirBnB)
