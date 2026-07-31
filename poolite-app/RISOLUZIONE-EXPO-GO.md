# "Project is incompatible with this version of Expo Go"

## Prima cosa: leggi bene l'errore

Expo Go mostra **due** numeri. Servono entrambi:

```
Project SDK version:    ← quello che dichiara IL PROGETTO sul tuo PC
Supported SDK version:  ← quello che supporta EXPO GO sul telefono
```

Il repo è configurato per dichiarare **54.0.0**, che combacia con Expo Go 54.
Se sul telefono leggi un "Project SDK version" diverso da 54.0.0, allora il
tuo PC sta ancora usando i pacchetti vecchi.

## Verifica cosa dichiara il tuo PC

```sh
cd poolite-app
npm run check-sdk
```

Cerca `"sdkVersion"` nell'output. Deve essere **`54.0.0`**.

Controlla anche la versione installata davvero:

```sh
node -p "require('./node_modules/expo/package.json').version"
```

Deve stampare **`54.0.2`**. Se stampa 57.x, le dipendenze sono vecchie.

## La soluzione (risolve il 95% dei casi)

```sh
cd poolite-app
npm run reset
```

Fa tutto: cancella `node_modules`, il lockfile e la cartella `.expo`,
reinstalla e riavvia il server pulendo la cache di Metro.

### A mano, se preferisci

```sh
git pull
cd poolite-app
rm -rf node_modules package-lock.json .expo
npm install
npx expo start -c
```

> Il `-c` è importante: senza, Metro riusa il bundle in cache e il telefono
> continua a ricevere il manifest vecchio anche dopo aver sistemato tutto.

## Se ancora non va

1. **Chiudi Expo Go dal multitasking** e riaprila (non basta tornare indietro:
   tiene il progetto in memoria).
2. **Svuota la cache di Expo Go**: nell'app, tieni premuto il progetto nella
   lista recenti → *Clear cache*, oppure disinstalla e reinstalla Expo Go.
3. **Stessa rete Wi-Fi** tra PC e telefono. Se la rete è aziendale o isola i
   dispositivi, usa il tunnel:
   ```sh
   npx expo start --tunnel
   ```
4. **Node aggiornato**: serve Node 20+. Verifica con `node -v`.

## Cosa non funziona in Expo Go (per scelta, non è un errore)

Expo Go contiene solo i moduli nativi standard di Expo. Queste due cose
richiedono una *development build*:

- **Widget Salvadanaio** sulla home screen iOS
- **Notifiche push** programmate

Il codice le gestisce senza crashare (`src/lib/widgetBridge.ts` non fa nulla
se il modulo nativo manca). Per averle davvero:

```sh
npx expo prebuild -p ios --clean
npx expo run:ios      # richiede Xcode su Mac
```
