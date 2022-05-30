// Obtengo el elemento que remplazará el cursor del mouse por una Luz, y su centro. 
const light = document.getElementById("light");
const lightInfo = light.getBoundingClientRect();
const lightX = (lightInfo.width / 2 )
const lightY = (lightInfo.height / 2 )


const userAgent = navigator.userAgent;
let browserName;
if (userAgent.match(/firefox|fxios/i)) browserName = "firefox"


const allShadElem = document.getElementsByClassName("cast-shadow")   // Creo un array de objetos, con todos los elementos que proyecta sombra.  
let isUpdateShadowEnabled = true;   // ¿ Esta habilitada la funcion que actualiza las sombras ?
let mouseX, mouseY   // Posicion del cursor del mouse en en X e Y.


// Detecto cuando se mueve el cursor del mouse, cuando se hace scroll y cuando se modifica el tamaño del navegador, para actualizar la sombra.
document.getElementsByTagName("body")[0].addEventListener('mousemove', (event) => { updateShadowControl(15, event) }) // Valor optimo aproximado cuando se mueve el mouse: 15
window.addEventListener("scroll", () => { updateShadowControl(100, null) });    // Valor optimo aproximado en casos de scroll o de redimensionamiento del viewport: 100.
window.addEventListener("resize", () => { updateShadowControl(100, null) });    


// Controlo que la función que actualiza las sombras se ejecute de forma más eficiente deshabilitandola temporalmente.
function updateShadowControl(time, event) {
    if (!isUpdateShadowEnabled) return;  
    isUpdateShadowEnabled = false;
    setTimeout( () => {    
        isUpdateShadowEnabled = true;
    },time)
    updateShadow(event)
}


function updateShadow (event) {
    // console.log("updateShadow")  // Para visualizar cuantas veces se ejecuta la función que actualiza las sombras
    const shadMovement = 0.05;      // Cantidad de movimiento que tendrá la sombra al moverse el mouse.
    const shadBlur = 0.004;    // Cantidad de blur que tendá la sombra de un objeto al alejarse el cursor de él.
    const shadBlurFirefox = 2;
    const shadOpacMax = 0.4;   // Opacidad MÁXIMA de la sombra (cuando el cursor esta muy cerca del elemento que proyecta la sombra).
    const shadOpacMin = 4.0;   // Opacidad MŃIMA de la sombra (cuando el cursor esta muy lejos del elemento que proyecta la sombra).
    const ilumMax = 1.2;       // Iluminación MÁXIMA que tendrá un elemento al acercarse el cursor a él. Ej:   0.5 --> 50%    1 --> 100%    
    const ilumMin = 0.9;      // Iluminación MŃIMA que tendrá un elemento al alejarse el cursor de él. Rangos sugeridos: de 0.5 a 1.5 
    const windowCenter = (window.innerWidth/2); 

    // Si se entro a esta funcion por haberse movido el cursor del mouse, actualizo la posición del cursor.
    if (event) {   
        mouseX = event.clientX
        mouseY = event.clientY
    }


    // Mantengo el elemeto que se muestra en lugar del cursor (el Sol pequeño) en el lugar del cursor.
    light.setAttribute("style", `left: ${(mouseX - lightX)}px;
                                 top: ${(mouseY - lightY + 16)}px;`  // Agrego un valor de desfasaje para que el cursor pueda seleccionar el texto debajo de la luz.
    )  
  
    // console.clear()
    // Actualizo las propiedades de sombra e iluminación para cada elemento segun la ultima posición del cursor del mouse.
    for (let i = 0; i < allShadElem.length; i++) {
        // Evito que se actualize la sombra de elementos que estan afuera del viewport, para mejorar el rendimiento. 
        const tolerance = 200;  // Este valor, disminuye la probabilidad de que un elemento sea visto sin iluminación y sombra dinámica al hacerce scroll rapidamente.
        const elemInfo = allShadElem[i].getBoundingClientRect();
        if ((elemInfo.top - tolerance > window.innerHeight) || ((elemInfo.top + elemInfo.height + tolerance) < 0)) continue
        

        // Actualizo en centro de cada elemento que arroja sombra.
        const elemCenterX = elemInfo.left + (elemInfo.width/2 )
        const elemCenterY = elemInfo.top + (elemInfo.height/2 )
        // console.log("ELEMENTO: ", i, "elemCenterY: ", elemCenterY)    // Usar junto a la linea   console.clear()  para controlar si se estan ignorando correctamente los elementos fuera del viewport.

        // Obtengo la distancia a la que esta cada elemento que arroja sombra con respecto al cursor, para calcular despues el blur de su sombra, y su iluminación.
        // Formula para calcular la distancia entre cualesquiera dos puntos:    d=√((x2-x1)²+(y2-y1)²)
        const cursDistX = Math.abs(elemCenterX - mouseX)  // Primero realizo la resta de las X.
        const cursDistY = Math.abs(elemCenterY - mouseY)  // Despues realizo la resta de las Y.
        const cursDist = Math.sqrt((cursDistX ** 2  ) + (cursDistY ** 2))  // Finalmente realizo las operaciones pendientes. 

        const opacityValue = shadOpacMax - (cursDist / (window.innerWidth * shadOpacMin));  // Calculo la opacidad de la sombra del elemento actual.
        let brightnessValue = ilumMax - (cursDist / (window.innerWidth * ilumMin));  // Calculo la iluminación del elemento actual.
        if (brightnessValue < 0 ) brightnessValue = 0;     // La iluminación de un elemento no debe ser menor a 0, o podrían mostrarse con una iluminación del 100%.

        allShadElem[i].style.filter = `drop-shadow( ${((elemCenterX - mouseX) * shadMovement)}px
                                                    ${((elemCenterY - mouseY) * shadMovement)}px
                                                    ${browserName !== "firefox" ? (cursDist * shadBlur) : shadBlurFirefox}px
                                                    hsla(180, 100%, 0%, ${ opacityValue }))
                                        brightness(${ brightnessValue })`   
                                                                                                

            
        if ((mouseX >= windowCenter && allShadElem[i].style.zIndex !== `${allShadElem.length - i}`) || 
            (mouseX < windowCenter && allShadElem[i].style.zIndex !== "auto")){
            // console.log("Modificando z-index" )
            allShadElem[i].style.zIndex = `${mouseX >= windowCenter ? allShadElem.length - i : "auto"}`
        }
    }
}
