Banana++ es un lenguaje de programacion rapido facil y portable en casi cualquier js

uso:
* cada parametros antes de `--args` y que no sea `--nonstdlib` sera considerado para adjuntar el nombre del archivo a los archivos a ejecutar y los ejecutara todos cuando termine de procesar los parametros
* si no se proporciona ningun archivo se iniciara el modo REPL cli muy parecido e inspirado en el de nodejs pero ejecutando codigo banana++
* `--nonstdlib` ignora la libreria std y no la ejecutara automaticamente
* `--args` indica que ahi termina los archivos a ejecutar y empiezan los parametros