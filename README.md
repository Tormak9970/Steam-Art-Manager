# Steam Art Manager
A simple tool for setting the artwork of your Steam library.

<!-- TODO: Image of main UI here -->

## How to use the App


### Download and Install


### Setting up the API Keys


### Loading Your Games


### Setting the Art


### Exporting to a Zip


### Importing from a Zip


### Using Custom Art

<br/>

## Features
 - Easily edit the art for your games
 - Upload custom images
 - Export your current art to a zip file
 - Import art from a zip file

<br/>

## Building the app
**Please note:** you may edit and distrubute this program as you see fit but you must retain the license and the copyright notice I included (feel free to mark your contributions as I have)<br/>

### Setting Up the Enviroment
I used the Tauri framework for the program, so you will need to to setup your enviroment as specified [here](https://tauri.app/v1/guides/getting-started/prerequisites). Additionally, you need a [Node.js](https://nodejs.org/en/) installation, as well as `npm`, which should be included with the node install.

### Cloning the Program
The next step is to get a local copy of the repository. This can be done many ways, I recommend forking this repository and cloning that.<br/>
**IMPORTANT:**<br/>
If you make changes you are not allowed to redistribute the application with me labeled as the developer. Please remember to change the `author` information in the `package.json` and the related copyright information in `src-tauri/tauri.config.json` file. You should also change the copyright notice in `src/App.svelte`.

### Installing Dependencies
Once you have cloned the repository and opened it in your preffered Editor/IDE (I recommend [VSCode](https://code.visualstudio.com/)), you will need to install the program's dependencies. To do this, you will need to run two commands:<br/>
First:<br/>
```
npm i
```
Next:<br/>
```
cd src-tauri
cargo install
```

### Running the Application
Now you are finally ready to get the app up and running! Assuming everything is set up correctly, all you need to do is run:<br/>
```
npm run tauri dev
```

### Building With Your Changes
Once you have made your edits and are ready to share it with the world, run the following command:
```
npm run tauri build
```
This will generate a `.msi` file in `src-tauri/target/release/bundle/msi/app_name.msi`. And there you go, you've got a distributeable installer!

<br/>

## Acknowledgements

<br/>

## Licensing
This program is licensed under the [GNU General Public License Version 3](https://www.gnu.org/licenses/#GPL)

<br/>

Copyright Travis Lane (Tormak) 