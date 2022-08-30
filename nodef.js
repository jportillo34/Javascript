/* -------------------------------------------------- */
/* Ejemplos de Node JS para leer y escribir archivos. */
/*                                                    */
/* Ejecutar desde la consola de comandos de node,     */
/*                                                    */
/* node nodef.js                                      */
/* -------------------------------------------------- */
const fs = require('fs');


// Ejemplo de lectura de archivo TXT.
// fs.readFile('\\Users\\user\\Desktop\\jsonTest.json', 'utf8', (err, data) => {
//   if (err) { console.error(err); return; }
  // console.log(data);
// });

// ejemplo de lectura de archivo JSON.
// El archivo JSON contiene un arreglo con nombres de paises:
// [{"country": "Afghanistan"},{"country": "Albania"},{"country": "Algeria"},{"country": "American Samoa"},{"country": "Andorra"},{"country": "Angola"}]
// var obj = JSON.parse(fs.readFileSync('\\Users\\user\\Desktop\\jsonTest.json', 'utf8'));

// var paises = "";

// for(var i = 0; i < obj.length; i++) paises += obj[i].country + ',';

// var paisPrint = []

// Se separa la lista de paises y se elimina el ultimo elemento del arreglo, por estar en blanco.
// paisPrint = paises.split(",").slice(0, -1);

// for(var i = 0; i < paisPrint.length; i++) console.log(paisPrint[i]);


// Otro ejemplo de lectura de archivo JSON. Esta vez se trata de un registro con nombre de empresa, datos basicos y un erreglo con 
// el nombre de cada empleado:
// {"empresa":"Tecnomed","datos":{"direccion":"xxxxxx,xxxxxx,xxxxxxxx","telefono":"60854263","codPost":"1050"},"empleados":["Fernando","Isabel","Pedro","Maria"]}
var obj = JSON.parse(fs.readFileSync('\\Users\\user\\Desktop\\jsonTest.json', 'utf8'));

console.log(obj.empresa);
console.log(obj.datos.direccion);
console.log(obj.datos.telefono);
console.log(obj.datos.codPost);

// Para imprimir los nombres de los empleados, al tratarse de un arreglo, debemos iterar a traves de este.
for(var i = 0; i < obj.empleados.length; i++) console.log(obj.empleados[i]);


// Ejemplo de escritura de archivo.
// const content = '{"empresa":"Tecnomed","datos":{"direccion":"xxxxxx,xxxxxx,xxxxxxxx","telefono":"60854263","codPost":"1050"},"empleados":["Fernando","Isabel","Pedro","Maria"]}';

// fs.writeFile('\\Users\\user\\Desktop\\jsonTest.json', content, err => {
// if (err) {
//    console.error(err);
// }
  // file written successfully
// });


/* -------------------------------------------------------------------------------- */
/* Ejemplo de uso de first class functions: en Javascript las funciones son objetos */
/* que pueden ser asignados a variables, que pueden ser pasadas como parametros a   */
/* otras funciones (callback function), etc.                                        */
/*                                                                                  */
/* Ejemplo de arrow functions.                                                      */
/*                                                                                  */
/* Ejemplo de como Javascript maneja los parametros a funciones de forma variable.  */
/* La funcion "muestra" pudiera recibir uno o dos parametros. Javascript se encarga */
/* de manejar la cantidad de parametros para cada caso (sqr solo necesita uno, pero */
/* suma y mult necesitan dos).                                                      */
/* -------------------------------------------------------------------------------- */
var suma = (x, y) => { return x + y; }
var mult = (x, y) => { return x * y; }
var sqr  = (x)    => { return x*x; }

var muestra = (calculo, parm1, parm2) => { console.log(calculo(parm1, parm2)); }

muestra(sqr, 2);



/* --------------------------------------------------------------------------------- */
/* Ejemplo de map, forEach, reduce y filter en arreglos.                             */
/*                                                                                   */
/* map sirve para ejecutar una funcion (callback function) por cada uno de los       */
/* elementos de un arreglo y devolver el arreglo modificado para asignarse a una     */
/* variable tipo arreglo. Esto ultimo no es necesario: usted pudiera usar map para   */
/* iterar a traves del arreglo y ejecutar alguna sentencia (ejemplo console.log)     */
/* sobre cada elemento del arreglo.                                                  */
/*                                                                                   */
/* map permite, ademas, que la salida de un map sea la entrada a otra map!           */
/*                                                                                   */
/* forEach sirve para iterar a traves de los elementos de un arreglo, ejecutando una */
/* funcion (callback function) por cada elemento del arreglo. No devuelve valor      */
/* alguno y, por tanto, no debe asignarse a una variable (de hacerlo este devolvera  */
/* "undefined").                                                                     */
/* --------------------------------------------------------------------------------- */
var serie = [2, 3, 4, 5, 6]

// Devuelve el arreglo "serie" modificado. Lo puede usted asignar a alguna variable de tipo arreglo.
var doble = serie.map((x) => { return 2*x; })

console.log(serie)
console.log(doble)

// Ejecuta unas sentencias o una funcion, pero no devuelve valor alguno.
serie.forEach((x) => { if(x > 4) console.log(2*x); })

// Tambien puede hacer la sentencia anterior con map (no asignando a una variable).
serie.map((x) => { if(x > 4) console.log(2*x); })

// Dos maps en secuencia: suma 10 a cada elemento y, luego, convierte a string cada elemento.
var concatenada = serie.map((x) => { return x + 10; }).map((x) => { return x.toString(); })

console.log(concatenada)

// Calcula la suma total de los numeros contenidos en el arreglo.
const inicial = 0
const total   = serie.reduce((previo, enCurso) => previo + enCurso, inicial)

console.log(total)

// Filtra los elementos del arreglo y toma solo los que son menores que 4.
const ltCuatro = serie.filter((x) => x < 4)

console.log(ltCuatro)



/* ------------------------------------------------------------------------------- */
/* Ejemplo de arreglo de objetos. Ejemplo de adicionar un objeto a dicho arreglo.  */
/* Ejemplo de arrow function para devolver una propiedad de los objetos contenidos */
/* en ese arreglo.                                                                 */
/* ------------------------------------------------------------------------------- */
var objetos = [
                 {id: "0001", desc: "objeto_1"},
                 {id: "0002", desc: "objeto_2"},
                 {id: "0003", desc: "objeto_3"},
              ]

objetos.push({id: "0004", desc: "objeto_4"})

console.log(objetos.map((elemento) => { return elemento.id; }))


/* -------------------------------------------------------------------------------------------- */
/* Ejemplo del metodo sort aplicado a un arreglo tomando en cuenta una propiedad de los objetos */
/* que conforman dicho arreglo.                                                                 */
/* -------------------------------------------------------------------------------------------- */
var objs = [
              { first_nom: 'Lazslo', last_nom: 'Jamf' },
              { first_nom: 'Pig',    last_nom: 'Bodine'},
              { first_nom: 'Pirate', last_nom: 'Prentice' }
           ]

console.log(objs)

// IMPORTANTE: El metodo sort altera el arreglo al cual se aplica!
objs.sort((a, b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0))

// objs.sort((a, b) => a.last_nom - b.last_nom); // b - a for reverse sort

console.log(objs)

// OJO!! investigar el metodo reverse!!!!


/* ---------------------------------------------------------------- */
/* Implementar un stack es muy facil en Javacript: usar un arreglo. */
/* ---------------------------------------------------------------- */
let stack = []

stack.push({numCon: "00000001", mnt: 25.3})
stack.push({numCon: "00000002", mnt: 160.0})
stack.push({numCon: "00000003", mnt: 18.00})

console.log(stack)

console.log("Contratos:")

stack.forEach((x) => console.log(x.numCon))

let lastEle = stack.pop()

console.log(lastEle.numCon)

console.log("Nuevamente Contratos:")

stack.forEach((x) => console.log(x.numCon))


/* ------------------------------------------------------- */
/* Ejemplo de funciones recursivas: factorial y fibonacci. */
/* ------------------------------------------------------- */
function fact(x) { if(x === 0 || x === 1) return(1); return(x * fact(x - 1)); }

function fib(x) { if(x === 0 || x === 1) return(x); return(fib(x - 1) + fib(x - 2)); }

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(x => console.log(x + " ---> " + fact(x)));

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(x => console.log(x + " ---> " + fib(x)))



let pruebagitHub = []
