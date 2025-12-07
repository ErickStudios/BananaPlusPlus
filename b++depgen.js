#!/usr/bin/env node
/** generador de dependencias*/
// para colores
// el sistema de archivos
const fs = require("fs");
// las carpetas
const path = require("path");
// para el interprete
const { StringScape , readl, ExCode, Envioriment, SyntaxSolve } = require("./internal/b++.js");
// comando
const args = process.argv.slice(2);
// ejecutador
const { exec } = require("child_process");
const { exit, env } = require("process");
// la shell
const shell = process.platform === "win32" ? "powershell.exe" : "/bin/bash";
/**
 * 
 */
function dependence_gen(name, content, folder) {
  // carpeta de la dependencia
  const DependenceFolder = path.join(folder, name);
  // extensiones de scripts
  const Extensions = [".sh", ".ps1"];
  // crear carpeta si no existe
  if (!fs.existsSync(DependenceFolder) || !fs.statSync(DependenceFolder).isDirectory()) {
    fs.mkdirSync(DependenceFolder, { recursive: true });
  }
  // crear codigo
  fs.writeFileSync(path.join(DependenceFolder, name + ".b++"), content, "utf-8")
  // crear los scripts de instalación
  Extensions.forEach(ext => {
    const ScriptName = path.join(DependenceFolder, "install" + ext);
    fs.writeFileSync(ScriptName, "#script de instalacion generado por B++Gen\nb++dep install " + name + ".b++", "utf-8");
    console.log(`Generado: ${ScriptName}`);
  });
}
/**
 * ejecuta un comando
 * @param {string} cmd el comando
 */
function cmd_execute(cmd) { exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`${stderr}`);
        return;
    }
    console.log(`${stdout}`);
    });
}
// destrimear cosas
function UnTrim(text)
{
  return "      " + text.replaceAll("\n", "\n      ");
}
// objetos
async function main() {
  let envi = new Envioriment();
  let ModuleName = args.length != 0 ? args[0] : (await readl("Nombre: "))
  let modulo = "//(((generado por B++Gen)))\nout function " + ModuleName + ".require(this_require:key) {\n";
  console.log("Bienvenido al generador de modulos de b++");

  while (true) {
    // leer comando
    let command = (await readl("> "));
    // salir
    if (command.trim() === "exit") break; 
    // requiere otra dependencia
    else if (command.trim() == "req-dep") {
      let Dependencia = (await readl("   Dependencia: "));

      modulo += UnTrim(`import "${Dependencia}";\nrequire ${Dependencia}.require;\n${Dependencia}.require(${Dependencia});`) + "\n";
    }
    // generador de clases
    else if (command.trim() == "class-gen")
    {
      // el nombre
      let ClassName = (await readl("   Nombre: "));
      // el comentario
      let ClassDocumentation = (await readl("   Descripcion: "));
      // el cuerpo
      let ClassBody = "";
      // el parametro
      let ClassParams = "";
      // el loop de la class
      while (true)
      {
        let Action = (await readl("   class-gen> "));
        // si es nuevo objeto
        if (Action.trim() == "new-obj")
        {
          let Name = (await readl("      Nombre: "));
          let Type = (await readl("      Tipo: "));
          let Comment = (await readl("      Comentario: "));
          ClassBody += Name + ":" + Type + ":" + Comment + "|";
        }
        // añadirlo
        else if (Action.trim().substring(0, 10) == "new-param ") ClassParams += Action.trim().substring(10, Action.trim().length) + "|";
        // añadir parametro
        // salir
        else if (Action.trim() == "ok") break;
      }
      if (ClassBody != "") ClassBody = ClassBody.substring(0, ClassBody.length - 1);
      if (ClassParams != "") ClassParams = ClassParams.substring(0, ClassParams.length - 1);

      let Params = ClassParams.split("|"); if (Params.length > 2) Params.pop();
      let Objects = ClassBody.split("|"); if (Objects.length > 2) Objects.pop();

      let result = "//(((" + ClassDocumentation + ")))\nout function %{this_require}%." + ClassName + ".new(this:key";
      Params.forEach((element, index, array) => {
        if (index != (array.length - 1)) result += ", ";
        result += element;
      });
      result += ")\n{\n";
      Objects.forEach((element, index, array) => {
        let Obj = element.split(":");
        let Name = Obj[0];
        let Type = Obj[1];
        let Documentation = Obj[2];

        if (Type == "function")
          result += "      //(((" + Documentation + ")))\n      out function %{this}%." + Name + "(...:any)\n      { }\n";
        else
          result += "      //(((" + Documentation + ")))\n      out %{this}%." + Name + " = Placeholder;\n";
      });
      result += "}";

      let AniadirAModulo = await readl("Añadir al modulo Y/n: ");

      if (AniadirAModulo.trim().toLowerCase() == 'y')
      {
        modulo += UnTrim(result) + "\n";
      }
    }
  }

  modulo += "}";

  let CrearModulo = await readl("Crear modulo Y/n: ");

  if (CrearModulo.trim().toLowerCase() == "y")
  {
    dependence_gen(ModuleName, modulo, process.cwd());
  }
  exit(0);
}
main();
