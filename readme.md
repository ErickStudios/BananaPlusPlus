Banana++ es un lenguaje de programacion rapido facil y portable en casi cualquier js

uso del interprete:
* cada parametros antes de `--args` y que no sea `--nonstdlib` sera considerado para adjuntar el nombre del archivo a los archivos a ejecutar y los ejecutara todos cuando termine de procesar los parametros
* si no se proporciona ningun archivo se iniciara el modo REPL cli muy parecido e inspirado en el de nodejs pero ejecutando codigo banana++
* `--nonstdlib` ignora la libreria std y no la ejecutara automaticamente
* `--args` indica que ahi termina los archivos a ejecutar y empiezan los parametros

# generador de dependencias
hay otro comando llamado `b++depgen` para generar dependencias este se usa de la siguiente manera
```sh
b++depgen Nombre
```

por usar un ejemplo asi se genera un modulo
```
PS C:\Users\erick\OneDrive\ErickCraftStudiosMgrChannel\Saved Proyects\Banana++\Banana--> node module_gen MiModulo
Bienvenido al generador de modulos de b++
> class-gen
   Nombre: MiClase
   Descripcion: MiClase es una clase
   class-gen> new-obj
      Nombre: MiObjeto
      Tipo: var
      Comentario: ejemplo
   class-gen> new-obj
      Nombre: MiMetodo
      Tipo: function
      Comentario: ejemplo2
   class-gen> ok
Añadir al modulo Y/n: y
> exit
Crear modulo Y/n: y
Generado: C:\Users\erick\OneDrive\ErickCraftStudiosMgrChannel\Saved Proyects\Banana++\Banana--\MiModulo\install.sh
Generado: C:\Users\erick\OneDrive\ErickCraftStudiosMgrChannel\Saved Proyects\Banana++\Banana--\MiModulo\install.ps1
```

# manejador de dependencias
hay otro comando que es `b++dep` que sirve para manejar dependencias por ahora solo tiene
```sh
b++dep instal Nombre
```
* `install` esto instala la dependencia especificada en la carpeta al directorio principal del interprete para poder ser usada