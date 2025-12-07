#!/usr/bin/env node
const { existsSync, writeFileSync, readFileSync } = require("fs");
const path = require("path");

// carpeta donde se guardan dependencias
const FolderDependences = __dirname;

// parámetros
const params = process.argv.slice(2);
const action = params.length > 0 ? params[0] : null;

if (action === "install") {
    // segundo argumento: nombre del archivo a instalar
    const depFile = params[1];
    if (!depFile) {
        console.error("Debes indicar el archivo de la dependencia");
        process.exit(1);
    }

    const filePath = path.join(process.cwd(), depFile);

    if (existsSync(filePath)) {
        const destPath = path.join(FolderDependences, path.basename(depFile));
        writeFileSync(destPath, readFileSync(filePath, "utf-8"), "utf-8");
        console.log(`Dependencia instalada en ${destPath}`);
    } else {
        console.error("El archivo no existe:", filePath);
    }
}