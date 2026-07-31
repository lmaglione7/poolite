# Expo SDK 54

Questo progetto è fissato a **Expo SDK 54** perché deve girare sull'app
**Expo Go** pubblicata sull'App Store, che supporta solo un SDK per volta.

Prima di scrivere codice, consulta la documentazione della versione esatta:
https://docs.expo.dev/versions/v54.0.0/

## Non aggiornare l'SDK senza motivo

Alzare la versione di `expo` rompe Expo Go: l'app sul telefono mostrerebbe
l'errore "Project is incompatible with this version of Expo Go". Se un giorno
serve davvero salire di SDK, vanno aggiornati **insieme** tutti i pacchetti
nativi, prendendo le versioni da:

```sh
npm pack expo@<versione> && tar -xzf expo-<versione>.tgz
cat package/bundledNativeModules.json
```

(`npx expo install --fix` fa lo stesso in automatico, ma richiede accesso a
`api.expo.dev`.)
