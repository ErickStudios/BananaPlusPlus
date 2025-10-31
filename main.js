/**
 * Banana++
 * 
 * un lenguaje de programacion rapido y portable
 */

/**
 * stdlib
 * 
 * la libreria std de Banana++
 */
let stdlib = `
// el valor nulo
out null = "";

// el tipo de array es una lista
out function Array.new(this:key, Ty:lang_type)
{
    // longitud
    out #%{this}% = 0;

    // añade un elemento nuevo a la lista
    out function %{this}%.push(item:%{Ty}%)
    {
        // añade el elemento a la lista
        out %{this}%[@get[#%{this}%]] = %{item}%;
        // incrementa la longitud
        out #%{this}% += 1;
    }

    // elimina el ultimo
    out function %{this}%.pop()
    {
        // decrementa la longitud
        out #%{this}% -= 1;
        // setea a null
        out %{this}%[@get[#%{this}%]] = null;
    }
}

// el tipo de cadena
out function String.new(this:key, Str:str)
{
    // el string
    out %{this}% = %{Str}%;

    // seprar
    out function %{this}%.split(Splitter:str, ReturnOn:Array)
    {        
        // la parte actual del string que se usara
        part = "";
        // crear array
        Array.new(ReturnOn, str);
        // longitud
        len = Sys.len(%{this}%);
        // el indexeador
        index = 0;

        // indexear
        for (len)
        {
            // ajustar el str del sistema actual
            Sys.__str__ = %{this}%;
            // ajustar el caracter a obtener
            Sys.__char__ = index;
            // obtenerlo en ch
            Sys.GetChar ch;

            // si es el caracter
            if ch == %{Splitter}% then {
                // poner la parte del array
                ReturnOn.push(part);
                // vaciar la parte actual
                part = "";
            else
                // juntarlo
                part $= ch; 
            }
            index += 1;
        }
    }
}
`;

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
        this.retval = "";
    }
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
    
    // 'x' y "x"
    else if ((Syntax.startsWith("\"") && Syntax.endsWith("\""))) return Syntax.substring(1, Syntax.length - 1);

    // VarSyntax[x]
    else if (Syntax.startsWith("VarSyntax[") && Syntax.endsWith("]")) return VarSyntax(Syntax.substring(10, Syntax.length - 1), Env);

    // Syntax[x]
    else if (Syntax.startsWith("Syntax[") && Syntax.endsWith("]")) return SyntaxSolve(Syntax.substring(7, Syntax.length - 1), Env);

    // Sys.len(x)
    else if (Syntax.startsWith("Sys.len[") && Syntax.endsWith("]")) return String(SyntaxSolve(Syntax.substring(8, Syntax.length - 1), Env).length); 

    return Syntax;
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
 * ExCode
 * 
 * ejecuta un codigo
 * @param {string} Code el codigo
 * @param {Envioriment} Env el entorno
 * @returns {Envioriment} el entorno despues
 */
function ExCode(Code, Env)
{
    
    let Word = "";
    let VarsThatDeletes = [];
    let EnvNew = Env;
    EnvNew.locals = Env.locals
    EnvNew.variables = Env.variables;

    let PutInOut = false;
    let OnFunction = false;
    let GoToReturn = false;
    let GoToAsign = false;
    let GoToAsignOp = false;
    let SysDotOutStatment = false;
    let Operator = "";
    let line = "";
    let AsignTo = "";
    let InString = false;
    let ForWhat = "";
    let IsInFor = false;
    let SysGetChar = false;

    for (let Recorrer = 0; Recorrer < Code.length; Recorrer++) {
        // el caracter actual
        const element = Code[Recorrer];

        // añadir a la linea
        line += element;

        if (element == "\"")
        {
            InString = !InString;
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
                    EnvNew = ExCode(fn, EnvNew);
                }

                // vaciar la linea
                line = "";
            }

            // comentarios
            else if (Code[Recorrer] == '/' && Code[Recorrer + 1] == '/')
            {
                line = "";
                Recorrer += 2;
                while (Recorrer < Code.length && Code[Recorrer] != '\n') Recorrer++;
            }

            // obtencion de caracteres
            else if (Word == "Sys.GetChar") SysGetChar = true;

            // impresion
            else if (Word == "Sys.Out") SysDotOutStatment = true;

            // poner en el principal
            else if (Word == "out") PutInOut = true;

            // crear funcion
            else if (Word == "function") OnFunction = true;

            // for
            else if (Word == "for") IsInFor = true;

            // retornar valor
            else if (Word == "return") GoToReturn = true;

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
                    
                    let BodyCode = FunctionBody.substring(FunctionBody.split("{")[0].length).trim();
                    BodyCode = BodyCode.substring(1, BodyCode.length - 2).trim();

                    console.log(ForIterations);
                    for (let index = 0; index < ForIterations; index++) {            
                        EnvNew = ExCode(BodyCode, EnvNew);
                    }
                }
                else if (SysDotOutStatment == true)
                {
                    SysDotOutStatment = false;
                    console.log(SyntaxSolve(Word, EnvNew));
                }
                else if (GoToReturn == true)
                {
                    EnvNew.retval = (Word);
                    return EnvNew;
                }
            }
    
            Word = "";
        }
    }

    VarsThatDeletes.forEach(element => {
        if (EnvNew.locals.has(element))
        {
            EnvNew.locals.delete(element);
        }
    });
    return EnvNew;
}

let envi = new Envioriment();

// ejecutar el stdlib y despues estamos listos
//envi = ExCode(stdlib, envi);

let args = process.argv.slice(2);
let parameters = [];
let params_mode = false;
let files_to_execute = [];

const fs = require("fs");
const { env } = require("process");

args.forEach(arg => {
    if (arg == "--args")
    {
        params_mode = true;
    }
    else if (params_mode == false) {
        const codef = fs.readFileSync(arg, 'utf8');
        
        files_to_execute.push(codef);
    }
    else {
        parameters.push(arg);
    }
});

parameters.forEach((element, index, array) => {
    envi.variables.set(`Sys.Argv[${index.toString()}]`, element);
});

envi.variables.set("#Sys.Argv", parameters.length);

files_to_execute.forEach(element => {
    envi = ExCode(element, envi);
});

/*
envi.variables.forEach((val, key, map) => {
   console.log(`${key} = ${val}`) 
});

envi.locals.forEach((val, key, map) => {
   console.log(`${key} = ${val}`) 
});*/