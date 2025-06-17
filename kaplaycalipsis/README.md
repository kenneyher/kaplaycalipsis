# Folder structure

- `src` - source code for your kaplay project
- `dist` - distribution folder, contains your index.html, built js bundle and static assets
- `src-tauri` - tauri project folder, contains tauri config file, icons, rust source if you need native code

## Development

```sh
$ npm run dev
```

will start a dev server at http://localhost:8000

## Distribution

```sh
$ npm run build
```

will build your js files into `dist/`

```sh
$ npm run zip
```

will build your game and package into a .zip file, you can upload to your server or itch.io / newground etc.


## Desktop

This project uses tauri for desktop builds, you have to have `rust` installed on your system for desktop to work, check out [tauri setup guide](https://tauri.app/v1/guides/getting-started/prerequisites/)

For tauri native APIs look [here](https://tauri.app/v1/api/js/)

```sh
$ npm run dev:desktop
```

will start the dev server and a native window that servers content from that dev server

```sh
$ npm run build:desktop
```

will create distributable native app package