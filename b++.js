#!/usr/bin/env node
/**
 * la shell de banana++
 */
const bananaplusplus = require("./internal/b++.js");
const fs = require("fs");
const readline = require('readline');
const path = require('path');
const { env, exit } = require("process");
const { math } = require("blockly/blocks");
const { create } = require("domain");
const { type } = require("os");
let onlyLanguaje = false; // activa esto si solo desea el lenguaje
if (onlyLanguaje == false) {
    /**
     * respuesta_anterior
     * 
     * la respuesta anterior
     */
    let respuesta_anterior = "";

    /**
     * use_stdlib
     * 
     * si usa la libreria std
     */
    let use_stdlib = true;

    /**
     * envi
     * 
     * el entorno principal del interprete
     */
    let envi = new bananaplusplus.Envioriment();

    /**
     * args
     * 
     * los argumentos
     */
    let args = process.argv.slice(2);

    /**
     * parameters
     * 
     * los parametros guardados
     */
    let parameters = [];

    /**
     * params_mode
     * 
     * si esta en modo seleccionar parametros
     */
    let params_mode = false;

    /**
     * files_to_execute
     * 
     * los archivos a ejecutar
     */
    let files_to_execute = [];

    /**
     * cli_reference_fmt
     * 
     * @param {string} ref la referencia
     */
    function cli_reference_fmt(ref)
    {
        let ref_val = bananaplusplus.StringScape(bananaplusplus.SyntaxSolve(ref, envi));
        let num_resalt = bananaplusplus.StringScape("\\k33m");
        let string_resalt = bananaplusplus.StringScape("\\k32m");
        let function_resalt = bananaplusplus.StringScape("\\k36m");
        let resalt_normal = bananaplusplus.StringScape("\\k0m");
        let IsClassBody = bananaplusplus.SyntaxSolve(ref + ".new", envi) != (ref + ".new");
        let DarkColor = bananaplusplus.StringScape("\\k2m");
        let non_function = [32];

        // si es una clase
        if (IsClassBody) { return function_resalt + "[class " + ref + "]" + resalt_normal;}
        // si es una funcion
        else if (Array.isArray(bananaplusplus.GetParams(ref_val)) && bananaplusplus.GetParams(ref_val).length > 0) { return function_resalt + "[Function: " + ref + "]" + resalt_normal; }
        // si es un undefined
        else if (ref_val == "") { return DarkColor + bananaplusplus.StringScape("\\k37m") + "undefined" + resalt_normal;}
        // si es un boolean interno osea tambien esta Boolean.new pero ese usa boolean, como diablos esperes que funcione sin un internal
        else if (ref_val == "true" || ref_val == "false") { return num_resalt + ref_val + resalt_normal; }
        // un string
        else if (isNaN(Number(ref_val))) { return string_resalt + bananaplusplus.EcodeJsStr(ref_val) + resalt_normal; }
        // un numero
        else if (isNaN(Number(ref_val)) == false) { return num_resalt + ref_val + resalt_normal; }
        // un valor ordinario
        else { return resalt_normal + ref_val; }
    }

    /**
     * cli
     * 
     * la linea de comandos
     */
    function cli() {
        
        // respuestas
        bananaplusplus.rl.question('> ', (respuestaa) => {
            let respuesta = respuestaa.trim();
            // salir
            if (respuesta.toLowerCase() === '.exit') {
                rl.close();
                return;
            }
            // mostrar entorno
            else if (respuesta == ".env")
            {
                // variables
                envi.variables.forEach((val, key, map) => { 
                    console.log(`${key}: ${cli_reference_fmt(key)}`);
                });
                // locales
                envi.locals.forEach((val, key, map) => { 
                    console.log(`${key}: ${cli_reference_fmt(key)}`)  
                });
            }
            // listar entorno
            else if (respuesta == ".mem")
            {
                // variables
                envi.variables.forEach((val, key, map) => { console.log(`\x1b[32m${key}\x1b[34m;\x1b[0m`) });
                // locales
                envi.locals.forEach((val, key, map) => { console.log(`\x1b[31m${key}\x1b[34m;\x1b[0m`) });
                // constantes
                envi.constants.forEach((val, key, map) => { console.log(`\x1b[33m${key}\x1b[34m;\x1b[0m`)  });
            }
            else {
                envi = bananaplusplus.ExCode(respuesta + " ", envi);

                if (
                    (envi.constants.has(respuesta) || envi.locals.has((respuesta)) || envi.variables.has(respuesta)) || envi.variables.has(respuesta + ".new") ||
                    isNaN(Number(respuesta)) == false ||
                    (respuesta.startsWith("\"") && respuesta.endsWith("\"")) ||
                    respuesta == "true" || 
                    respuesta == "false"
                )
                console.log(cli_reference_fmt(respuesta.trim()));
                else if (respuesta == "donde esta")
                {
                    let variable = bananaplusplus.SyntaxSolve(respuesta_anterior, envi);
                    let donde_esta = "no se";

                    if (envi.locals.has(variable)) donde_esta = "en el scope";
                    else if (envi.variables.has(variable)) donde_esta = "en el global";
                    else if (envi.constants.has(variable)) donde_esta = "en constantes";
                    
                    console.log(bananaplusplus.StringScape("\\k32m") + bananaplusplus.EcodeJsStr(donde_esta) + bananaplusplus.StringScape("\\k0m"));
                }
                else if (respuesta == "we")
                {
                    console.log(bananaplusplus.StringScape("\\k32m") + bananaplusplus.EcodeJsStr("que") + bananaplusplus.StringScape("\\k0m"));
                }
                else if (respuesta_anterior == "we")
                {
                    switch (respuesta) {
                        case "ejecuta algo":
                            console.log(bananaplusplus.StringScape("\\k32m") + bananaplusplus.EcodeJsStr("pero pon que ejecutare, ahhh") + bananaplusplus.StringScape("\\k0m"));
                            break;
                    
                        default:
                            console.log(bananaplusplus.StringScape("\\k32m") + bananaplusplus.EcodeJsStr("q?") + bananaplusplus.StringScape("\\k0m"));
                            break;
                    }
                }
            }

        respuesta_anterior = respuesta;
        cli();
    });
    }

    // leer parametros
    args.forEach(arg => {
        // cambiar a modo argumentos
        if (arg == "--args") params_mode = true;
        // si no se va a usar la libreria std
        else if (arg == "--nonstdlib") use_stdlib = false;
        // añadir archivo
        else if (params_mode == false) {
            const codef = fs.readFileSync(arg, 'utf8');
            files_to_execute.push(codef);
        }
        // añadir parametro
        else parameters.push(arg);
    });

    // para los parametros
    parameters.forEach((element, index, array) => {
        // añadirlo al entorno
        envi.variables.set(`Sys.Argv[${index.toString()}]`, element);
    });

    // añade el numero de parametros, si , creamos un readonly Array de stdlib.bpp (osea que no tiene ni un metodo de cualquier Array y solo es leible)
    envi.variables.set("#Sys.Argv", String(parameters.length));

    // inicializar variables del entorno
    envi.constants.set("Sys.PathSep", path.sep);
    envi.constants.set("Sys.PathDelimiter", path.delimiter);
    envi.constants.set("Sys.ActualPath", process.cwd());
    envi.constants.set("Sys.RunPath", __dirname);

    if (use_stdlib == true) {  
        const stdlibPath = path.join(__dirname, 'stdlib.b++');

        if (fs.existsSync(stdlibPath)) {
            envi = bananaplusplus.ExCode(fs.readFileSync(stdlibPath, 'utf8'), envi);
        }
        else { if (files_to_execute.length == 0) console.log("No hay ningun archivo 'stdlib.b++' en el directorio princiapl"); }
    }
    else { if (files_to_execute.length == 0) console.log("increible programador, te arreglaras la vida solo, eso no se ve todos los dias") }

    // ejecutar archivo uno por uno
    files_to_execute.forEach(element => {  envi = bananaplusplus.ExCode(element, envi); });

    if (files_to_execute.length == 0) {
        console.log("Bienvenido a Banana++");
        if (bananaplusplus.SyntaxSolve("EnvContains[\"stdlib_ver\"]", envi) == "true")
        {
            console.log("la version de la stdlib que se esta ejecutando es la " + bananaplusplus.SyntaxSolve("stdlib_ver", envi))
        }
        cli();
        }
    else exit(0);
}