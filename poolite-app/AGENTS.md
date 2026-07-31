# Expo SDK 54 — versione bloccata a 54.0.2

Il progetto è fissato a **`expo` 54.0.2 esatta** (non un range) per combaciare
con la build di **Expo Go 54.0.2** installata sul telefono di sviluppo.

Expo Go ha i moduli nativi compilati al suo interno: le versioni JS dei
pacchetti `expo-*` devono corrispondere a quelle native, altrimenti si
ottengono errori a runtime difficili da diagnosticare. Le versioni qui
elencate vengono da `bundledNativeModules.json` di `expo@54.0.2`.

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
