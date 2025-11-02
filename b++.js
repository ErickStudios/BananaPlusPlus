/**
 * Banana++
 * 
 * un lenguaje de programacion rapido y portable
 */

//
// rincon de inclusion
//

const fs = require("fs");
const readline = require('readline');
const path = require('path');
const { env } = require("process");

/**
 * Envioriment
 * 
 * representa el entorno de ejecucion
 */
class Envioriment {
    /** 
     * variables y funciones persistentes
     * @type {Map<string,string>}
     */
    variables;

    /** 
     * variables y funciones locales
     * @type {Map<string,string>}
     */
    locals;

    /**
     * variables de lectura namas
     * @type {Map<string, string>}
     */
    constants;

    /**
     * valor de retorno
     *  @type {string}
     */
    retval;

    /**
     * retorna un valor
     * @param {string} r el retorno
     */
    return(r) {this.retval = r; }

    /**
     * el constructor
     * @param {Map<string, string>} vars las variables
     *  @param {Map<string, string>} locals las locales
     */
    constructor()
    {
        this.variables = new Map();
        this.locals = new Map();
        this.constants = new Map();
        this.retval = "";
    }
}

/**
 * readl
 * 
 * lee la linea
 * @param {string} ask la pregunta
 * @returns la respuesta
 */
function readl(ask) {
  return new Promise((resolve) => {
    rl.question(ask, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * StringScape
 * 
 * codigos de escape en Banana++
 * @param {string} str el string
 * @returns el string escapado
 */
function StringScape(str)
{
    return str.replaceAll("@ASCII:","\x1b[");
}

/**
 * SyntaxSolve
 * 
 * soluciona la sintaxis
 * @param {string} Syntax la sintaxis
 * @param {Envioriment} Env el entorno
 * @returns {string} la sintaxis resuelta
 */
function SyntaxSolve(Syntax, Env)
{
    // x
    if (Env.locals.has(Syntax)) return Env.locals.get(Syntax);
    
    // x
    else if (Env.variables.has(Syntax)) return Env.variables.get(Syntax);
        
    // x
    else if (Env.constants.has(Syntax)) return Env.constants.get(Syntax);
    
    // 'x' y "x"
    else if ((Syntax.startsWith("\"") && Syntax.endsWith("\""))) return StringScape(Syntax.substring(1, Syntax.length - 1));

    // Syntax["x"]
    else if (Syntax.startsWith("Syntax[\"") && Syntax.endsWith("\"]")) return SyntaxSolve(Syntax.substring(8, Syntax.length - 2), Env);

    // VarSyntax[x]
    else if (Syntax.startsWith("VarSyntax[") && Syntax.endsWith("]")) return VarSyntax(Syntax.substring(10, Syntax.length - 1), Env);

    // Syntax[x]
    else if (Syntax.startsWith("Syntax[") && Syntax.endsWith("]")) return SyntaxSolve(Syntax.substring(7, Syntax.length - 1), Env);

    // Sys.len[x]
    else if (Syntax.startsWith("Sys.len[") && Syntax.endsWith("]")) return String(SyntaxSolve(Syntax.substring(8, Syntax.length - 1), Env).length); 

    // x==y
    if (Syntax.split("==").length == 2) 
    { 
        return String(SyntaxSolve(Syntax.split("==")[0], Env) == SyntaxSolve(Syntax.split("==")[1], Env))
    }

    // Sys.Read[]
    //else if (Syntax.startsWith("Sys.Read[") && Syntax.endsWith("]")) return await readl(SyntaxSolve(Syntax.substring(9, Syntax.length - 1)));

    return Syntax;
}

/**
 * NormalizePath
 * 
 * normaliza la carpeta
 * @param {string} directory el directorio
 * @returns {string} normalizado
 */
function NormalizePath(directory)
{
    return directory.replaceAll("/", path.sep);
}

/**
 * IsOperator
 * 
 * revisa si un caracter es uno de operacion
 * @param {*} char el operador
 * @returns si es uno
 */
function IsOperator(char)
{
    return char == '$' || char == '*' || char == '+' || char == '-' || char == '/' || char == '%';
}

/**
 * VarSyntax
 * 
 * soluciona el nombre de variable
 * @param {string} VarName el nombre
 * @param {Envioriment} Env el entorno
 * @returns {string} el nombre devuelto
 */
function VarSyntax(VarName, Env)
{
    let retval = VarName;
    Env.variables.forEach((val, key, map) => {
        retval = retval.replaceAll(`@get[${key}]`, val);
    });

    Env.locals.forEach((val, key, map) => {
        retval = retval.replaceAll(`@get[${key}]`, val);
    })

    return retval;
}

/**
 * IsWhileSpace
 * 
 * ve si es un espacion en blanco
 * @param {*} str el string
 * @returns {boolean} si es o no
 */
function IsWhileSpace(str)
{
    if (str == ' ' || str == '\t' || str == '\n' || str == '\r') return true;
    return false;
}

/**
 * GetParams
 * 
 * obtiene los parametros
 * @param {string} func el cuerpo
 * @returns {string[]} los parametros
 */
function GetParams(func)
{
    let pars = "";

    for (let index = 1; index < func.length; index++) {
        const element = func[index];
        
        if (element == ')') break;
        else pars += element;
    }

    let psm = pars.split(",");
    let nm = [];

    psm.forEach(element => {
        let el = element.trim()

        if (el.split(":").length == 2) el = el.split(":")[0];

        nm.push(el);
    });

    return nm;
}

/**
 * IsAValidCharForWord
 * 
 * si es un caracter valido para una palabra
 * @param {string} element el caracter
 * @returns si es
 */
function IsAValidCharForWord(element)
{
    return (IsWhileSpace(element) == false && element != '&' && element != '|' && element != '+' && element != '$' && element != '-' && element != '=' && element != '/' && element != '*' && element != '(' && element != ')' && element != '{' && element != '}' && element != ':' && element != ';');
}

/**
 * ExCode
 * 
 * ejecuta un codigo
 * @param {string} Code el codigo
 * @param {Envioriment} Env el entorno
 * @returns {Envioriment} el entorno despues
 */
function ExCode(Code, Env)
{
    
    // declarar parametros del interpete

    let Word = "";
    let VarsThatDeletes = [];
    let ConstsThatDeletes = [];
    let EnvNew = Env;
    let PutInOut = false;
    let OnFunction = false;
    let GoToReturn = false;
    let GoToAsign = false;
    let GoToAsignOp = false;
    let SysWarnStatment = false;
    let SysDotOutStatment = false;
    let Operator = "";
    let line = "";
    let AsignTo = "";
    let InString = false;
    let IsInFor = false;
    let SysGetChar = false;
    let InIfDef = false;
    let IfCondition = "";
    let importfile = false;
    let filestoimport = [];
    let requirethings = false;
    let thingstorequire = [];
    let DeclareAsConst = false;

    EnvNew.locals = Env.locals
    EnvNew.variables = Env.variables;
    EnvNew.constants = Env.constants;

    for (let Recorrer = 0; Recorrer < Code.length; Recorrer++) {
        // el caracter actual
        const element = Code[Recorrer];

        // añadir a la linea
        line += element;

        if (element == "\\" && InString)
        {
            if (Code[Recorrer + 1] == "\"")
            {
                Word += "\"";
                Recorrer++;
                continue;
            }
        }
        if (element == "\"")
        {
            InString = !InString;
        }

        if (InIfDef == true)
        {
            IfCondition += element;
        }

        // mas para la palabra
        if (InString == false ? (IsWhileSpace(element) == false && element != '&' && element != '|' && element != '+' && element != '$' && element != '-' && element != '=' && element != '/' && element != '*' && element != '(' && element != ')' && element != '{' && element != '}' && element != ':' && element != ';') : true) Word += element;
        // ejecutar lo dicho
        else
        {
            //console.log(Word)
            line = line.trimStart()

            // terminar linea
            if (Code[Recorrer] == ';')
            {
                // si se va a asignar algo
                if (GoToAsign == true)
                {
                    if (DeclareAsConst == true)
                    {
                        // ah?
                        if (EnvNew.constants.has(VarSyntax(AsignTo,EnvNew))) return EnvNew;

                        ConstsThatDeletes.push(AsignTo);
                        EnvNew.constants.set(VarSyntax(AsignTo,EnvNew), SyntaxSolve(Word,EnvNew));
                    }
                    else {
                        if (PutInOut == false)
                        {
                            if (Env.locals.has(AsignTo) == false)
                            {
                                VarsThatDeletes.push(AsignTo);
                            }
                        }

                        // va a asignarlo
                        GoToAsign = false;

                        // en todo el codigo global
                        if (PutInOut == true) Env.variables.set(VarSyntax(AsignTo,EnvNew), SyntaxSolve(Word,EnvNew));
                        // solo en este stack
                        else Env.locals.set(VarSyntax(AsignTo,EnvNew), SyntaxSolve(Word,EnvNew));
                    }
                }
                // operadores 
                else if (GoToAsignOp == true)
                {
                    // va a asignarlo
                    GoToAsignOp = false;

                    if (Operator != '$')
                    {
                        let val = Number(SyntaxSolve(VarSyntax(AsignTo, EnvNew), EnvNew));
                        
                        switch (Operator)
                        {
                            case '+':
                                val += Number(SyntaxSolve(VarSyntax(Word, EnvNew), EnvNew));
                                break;
                            case '-':
                                val -= Number(SyntaxSolve(VarSyntax(Word, EnvNew), EnvNew));
                                break;
                            case '*':
                                val *= Number(SyntaxSolve(VarSyntax(Word, EnvNew), EnvNew));
                                break;
                            case '/':
                                val /= Number(SyntaxSolve(VarSyntax(Word, EnvNew), EnvNew));
                                break;
                            case '%':
                                val %= Number(SyntaxSolve(VarSyntax(Word, EnvNew), EnvNew));
                                break;
                            default:
                                break;
                        }

                        // en todo el codigo global
                        if (PutInOut == true) Env.variables.set(VarSyntax(AsignTo,EnvNew), String(val));
                        // solo en este stack
                        else Env.locals.set(VarSyntax(AsignTo, EnvNew), String(val));
                    }
                    else {
                        let val = SyntaxSolve(VarSyntax(AsignTo, EnvNew), EnvNew) + SyntaxSolve(VarSyntax(Word, EnvNew), EnvNew);
                        
                        // en todo el codigo global
                        if (PutInOut == true) Env.variables.set(VarSyntax(AsignTo,EnvNew), val);
                        // solo en este stack
                        else Env.locals.set(VarSyntax(AsignTo, EnvNew), val);
                    }

                }
                // requerir cosas
                else if (requirethings == true)
                {
                    requirethings = false;
                    thingstorequire.push(Word);

                    for (const elemental of thingstorequire) {
                        if (!(EnvNew.locals.has(elemental) || EnvNew.variables.has(elemental) || EnvNew.constants.has(elemental))) {
                            return EnvNew; // esto sí interrumpe el flujo externo
                        }
                    }

                    thingstorequire = [];
                }
                // importar archivos
                else if (importfile == true)
                {
                    importfile = false;
                    filestoimport.push(Word);

                    filestoimport.forEach(elemental => {
                        if (fs.existsSync(NormalizePath(SyntaxSolve(elemental, EnvNew))))
                        {
                            let file_content = fs.readFileSync(NormalizePath(SyntaxSolve(elemental, EnvNew)) , 'utf-8');
                            EnvNew = ExCode(file_content, EnvNew);
                        }
                    });

                    filestoimport = [];
                }
                // crear funcion
                else if (line.endsWith(");"))
                {
                    // la funcion
                    let func = "";
                    let fmt = 0;

                    for (let ind = 0; ind < line.length; ind++) {
                        // la letra
                        const element = line[ind];
                        
                        // si termina ahi
                        if (element == "(") { func = func.trim(); fmt = ind; break; }
                        // si no pues, el nombre de la funcion sigue
                        else func += element;
                    }

                    // la sintaxis
                    let fn = SyntaxSolve(func, EnvNew).trim();
                    // los parametros de la funcion
                    let params = GetParams(fn);
                    // los parametros puestos
                    let psm = GetParams(line.substring(fmt, (line.length) - 1));
                    // ir parametro por parametro y remplazarlos
                    params.forEach((elemental, index, array) => {fn = fn.replaceAll(`%{${elemental}}%`, psm[index]);});

                    // eliminar los parametros
                    fn = fn.substring(fn.split("{")[0].length).trim();
                    // eliminar las llaves
                    fn = fn.substring(1, fn.length - 2).trim();

                    //console.log(fn);
                    EnvNew = ExCode(fn + "\n//.", EnvNew);
                }

                // vaciar la linea
                line = "";
            }

            // comentarios
            else if (Code[Recorrer] == '/' && Code[Recorrer + 1] == '/')
            {
                line = "";
                Recorrer += 2;

                if (
                    Code[Recorrer] == '(' &&
                    Code[Recorrer + 1] == '(' &&
                    Code[Recorrer + 2] == '('
                )
                {
                    while (Recorrer < Code.length)
                    {
                        if (
                            Code[Recorrer] == ')' &&
                            Code[Recorrer + 1] == ')' &&
                            Code[Recorrer + 2] == ')'     
                        )
                        {
                            Recorrer += 2;
                            break;
                        }

                        Recorrer++;
                    }
                }
                else { while (Recorrer < Code.length && Code[Recorrer] != '\n') Recorrer++; }
            }

            
            // if
            else if (Word == "if") 
            {
                InIfDef = true;
            }

            // import
            else if (Word == "import") importfile = true;

            // require
            else if (Word == "require") {requirethings = true;}

            // then
            else if (Word == "then" && InIfDef == true)
            {
                InIfDef = false;
                IfCondition = IfCondition.replaceAll("then", "").trim()
                IfCondition = SyntaxSolve(IfCondition, EnvNew);

                let Treads = 0;
                let FunctionBody = "";
                let havem = false;
                while ((havem == true ? (Treads != 0) : true) && Recorrer < Code.length) {
                    FunctionBody += Code[Recorrer];
                    if (Code[Recorrer] == '{') { Treads++; havem = true;}
                    else if (Code[Recorrer] == '}') Treads--;
                    Recorrer++;
                }
                line = ""; 
                let BodyCode = FunctionBody.trim().substring(1, FunctionBody.trim().length - 1);
                let IfTrueCode = BodyCode;
                let IfFalseCode = "";

                while (Recorrer < Code.length && IsWhileSpace(Code[Recorrer])) Code[Recorrer++];

                if (
                    Recorrer + 4 < Code.length &&
                    Code[Recorrer] === 'e' &&
                    Code[Recorrer + 1] === 'l' &&
                    Code[Recorrer + 2] === 's' &&
                    Code[Recorrer + 3] === 'e' &&
                    !IsAValidCharForWord(Code[Recorrer + 4])
                ) {
                    Recorrer += 4;
                    while (Recorrer < Code.length && IsWhileSpace(Code[Recorrer])) Code[Recorrer++];

                    if (Code[Recorrer] == '{')
                    {
                        Treads = 0;
                        FunctionBody = "";
                        havem = false;
                        while ((havem == true ? (Treads != 0) : true) && Recorrer < Code.length) {
                            FunctionBody += Code[Recorrer];
                            if (Code[Recorrer] == '{') { Treads++; havem = true;}
                            else if (Code[Recorrer] == '}') Treads--;
                            Recorrer++;
                        }
                        line = ""; 
                        BodyCode = FunctionBody.trim().substring(1, FunctionBody.trim().length - 1);
                        IfFalseCode = BodyCode;
                    }
                }
            
                if (IfCondition == "true")
                {
                    EnvNew = ExCode(IfTrueCode+ "\n//.", EnvNew);
                }
                else
                {
                    EnvNew = ExCode(IfFalseCode+ "\n//.", EnvNew);
                }
            }

            // obtencion de caracteres
            else if (Word == "Sys.GetChar") SysGetChar = true;

            // impresion
            else if (Word == "Sys.Out") SysDotOutStatment = true;

            // advertencia
            else if (Word == "Sys.Warn") SysWarnStatment = true;

            // poner en el principal
            else if (Word == "out") PutInOut = true;

            // crear funcion
            else if (Word == "function") OnFunction = true;

            // for
            else if (Word == "for") IsInFor = true;

            // retornar valor
            else if (Word == "return") GoToReturn = true;

            // const x = val;
            else if (Word == "const") DeclareAsConst = true;

            // asignar
            else if (Code[Recorrer + 1] == '=')
            {
                Recorrer++;
                // eliminar espacios en blanco
                while (Recorrer < Code.length && IsWhileSpace(Code[Recorrer])) { Recorrer++;}
                // preparar asignacion
                GoToAsign = true; 
                AsignTo = Word;
            } 
            // operar algo
            else if (Code[Recorrer + 2] == '=' && IsOperator(Code[Recorrer + 1]))
            {
                let operator = Code[Recorrer + 1];
                GoToAsignOp = true; 
                Operator = operator; 
                AsignTo = Word;
                Recorrer++;
            }
            else
            {
                if (OnFunction == true)
                {
                    //if (Code[Recorrer] != '(') return EnvNew;
                    
                    //console.log("Function " + Word + " created!")
                    OnFunction = false;

                    let Treads = 0;
                    let FunctionBody = "";
                    let havem = false;
                    while ((havem == true ? (Treads != 0) : true) && Recorrer < Code.length) {
                        FunctionBody += Code[Recorrer];

                        if (Code[Recorrer] == '{') { Treads++; havem = true;}
                        else if (Code[Recorrer] == '}') Treads--;

                        Recorrer++;
                    }
                    line = "";
                    //console.log(FunctionBody);

                    // en todo el codigo global
                    if (PutInOut == true) Env.variables.set(Word, FunctionBody);
                    // solo en este stack
                    else Env.locals.set(Word, FunctionBody);
                }
                else if (SysGetChar)
                {
                    SysGetChar = false;

                    let Str = SyntaxSolve("Sys.__str__",Env);
                    let CharGet = Number(SyntaxSolve("Sys.__char__",Env));

                    EnvNew.variables.set(Word, Str[CharGet]);
                }
                else if (requirethings == true)
                {
                    thingstorequire.push(Word);
                }
                else if (importfile == true)
                {
                    filestoimport.push(Word);
                }
                else if (IsInFor)
                {
                    let Treads = 0;
                    let FunctionBody = "";
                    let havem = false;
                    while ((havem == true ? (Treads != 0) : true) && Recorrer < Code.length) {
                        FunctionBody += Code[Recorrer];

                        if (Code[Recorrer] == '{') { Treads++; havem = true;}
                        else if (Code[Recorrer] == '}') Treads--;

                        Recorrer++;
                    }
                    line = "";

                    let Params = GetParams(FunctionBody);
                    let ForIterations = Number(SyntaxSolve(Params[0], EnvNew));
                    
                    let HaveIndex = false;
                    let IndexVar = "";
                    if (Params.length == 2)
                    {
                        IndexVar = Params[1];
                    }

                    let BodyCode = FunctionBody.substring(FunctionBody.split("{")[0].length).trim();
                    BodyCode = BodyCode.substring(1, BodyCode.length - 2).trim();

                    for (let index = (HaveIndex ? SyntaxSolve(IndexVar, EnvNew) : 0); index < (HaveIndex ? SyntaxSolve(IndexVar, EnvNew) : ForIterations); index++) {            
                        EnvNew = ExCode(BodyCode+ "\n//.", EnvNew);
                    }
                }
                else if (SysWarnStatment == true)
                {
                    SysWarnStatment = false;
                    console.warn(SyntaxSolve(Word, EnvNew));
                }
                else if (SysDotOutStatment == true)
                {
                    SysDotOutStatment = false;
                    console.log(SyntaxSolve(Word, EnvNew));
                }
                else if (GoToReturn == true)
                {
                    EnvNew.retval = SyntaxSolve(Word, EnvNew);
                    return EnvNew;
                }
            }
    
            Word = "";
        }
    }

    // se despiden las constantes
    ConstsThatDeletes.forEach(element => {
        if (EnvNew.constants.has(element)) EnvNew.constants.delete(element);
    });

    // se despiden las variables locales
    VarsThatDeletes.forEach(element => {
        if (EnvNew.locals.has(element)) EnvNew.locals.delete(element);
    });
    return EnvNew;
}

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
let envi = new Envioriment();

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
 * rl
 * 
 * el lector de linea de cli
 */
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

/**
 * cli
 * 
 * la linea de comandos
 */
function cli() {
    
    rl.question('> ', (respuesta) => {
        if (respuesta.toLowerCase() === '.exit') {
            rl.close();
            return;
        }
        else if (respuesta == ".env")
        {
            envi.variables.forEach((val, key, map) => {
                console.log(`\x1b[32m${key}\x1b[0m = \x1b[34m${val}`) 
            });

            envi.locals.forEach((val, key, map) => {
                console.log(`${key} = ${val}`) 
            });
        }
        else if (respuesta == ".mem")
        {
            envi.variables.forEach((val, key, map) => {
                console.log(`\x1b[32m${key}\x1b[34m;\x1b[0m`) 
            });

            envi.locals.forEach((val, key, map) => {
                console.log(`\x1b[31m${key}\x1b[34m;\x1b[0m`) 
            });
                        
            envi.constants.forEach((val, key, map) => {
                console.log(`\x1b[33m${key}\x1b[34m;\x1b[0m`) 
            });
        }
        else {
            envi = ExCode(respuesta + " ", envi);
        }

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
envi.variables.set("#Sys.Argv", parameters.length);

// ejecutar archivo uno por uno
files_to_execute.forEach(element => {  envi = ExCode(element, envi); });

// inicializar variables del entorno
envi.constants.set("Sys.PathSep", path.sep);
envi.constants.set("Sys.PathDelimiter", path.delimiter);

// llamar a la command line?
if (files_to_execute.length == 0 ) {

    if (use_stdlib == true) {  
        console.log("Cargando libreria std");
        if (fs.existsSync("stdlib.b++")) {
            envi = ExCode(fs.readFileSync("stdlib.b++", 'utf8'), envi);
            console.log("Libreria std cargada");
        }
        else console.log("No hay ningun archivo 'stdlib.b++' en el directorio princiapl");
    }
    else console.log("increible programador, te arreglaras la vida solo, eso no se ve todos los dias")
    cli();
}