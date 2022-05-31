// Obtengo el centro del elemento que remplazará el icono del cursor del mouse por una Luz. 
const light = document.getElementById("light");
const lightInfo = light.getBoundingClientRect();
const lightX = (lightInfo.width / 2 );
const lightY = (lightInfo.height / 2 );


// Detecto si el navegador usado es Firefox, para asignarle posteriormente un blur estático al borde de la sombra, por no funcionar bien un blur dinámico en tal navegador.
const userAgent = navigator.userAgent;
let browserName;  
if (userAgent.match(/firefox|fxios/i)) browserName = "firefox"


const allShadElem = document.getElementsByClassName("cast-shadow")   // Creo un array de objetos, con todos los elementos tendran iluminación y sombras dinámicas.  
let isUpdateShadowEnabled = true;   // ¿ Esta habilitada la función que actualiza las sombras?
let mouseX, mouseY   // Posición del cursor del mouse en en X e Y.


// Detecto cuando se mueve el cursor del mouse, cuando se hace scroll, y cuando se modifica el tamaño del navegador, para actualizar la sombra e iluminación de las elementos.
const milliseconds = 15;    // Milisegundos que la función que actualiza sombras permanecerá desactivada tras ejecutarse, para mejorar el rendimiento.
document.getElementsByTagName("body")[0].addEventListener('mousemove', (event) => { updateShadowControl(milliseconds, event) }) 
window.addEventListener("scroll", () => { updateShadowControl(milliseconds, null) });   
window.addEventListener("resize", () => { updateShadowControl(milliseconds, null) });    


// Deshabilito temporalmente la actualización de luz y sombras para mejorar el rendimiento.
function updateShadowControl(milliseconds, event) {
    if (!isUpdateShadowEnabled) return;  
    isUpdateShadowEnabled = false;
    setTimeout( () => {    
        isUpdateShadowEnabled = true;
    },milliseconds)
    updateShadow(event)
}


function updateShadow (event) {
    const shadMovement = 0.05;      // Cantidad de movimiento que tendrá la sombra al moverse el mouse.
    const shadBlur = 0.004;         // Cantidad de blur que tendá la sombra de un elemento al alejarse el cursor del mouse de él.
    const shadBlurFirefox = 2;      // Cantidad de blur estático en el borde de las sombras, cuando el navegador sea Firefox, por no funcionar bien un blur dinámico en tal navegador.
    const shadOpacMax = 0.4;   // Opacidad MÁXIMA de la sombra (cuando el cursor esta muy cerca del elemento que proyecta la sombra).
    const shadOpacMin = 3.0;   // Opacidad MÍNIMA de la sombra (cuando el cursor esta muy lejos del elemento que proyecta la sombra).
    const ilumMax = 1.15;       // Iluminación MÁXIMA que tendrá un elemento al acercarse el cursor a él. Ej:   0.5 --> 50%    1 --> 100%    
    const ilumMin = 0.8;       // Iluminación MÍNIMA que tendrá un elemento al alejarse el cursor de él.
    const viewportCenter = (window.innerWidth/2);     // Centro horizontal actual del viewport.

    // Si se entro a esta función por haberse movido el mouse, actualizo la posición del cursor.
    if (event) {   
        mouseX = event.clientX
        mouseY = event.clientY
    }

    // Mantengo el icono de luz, en el lugar del cursor.
    light.setAttribute("style", `left: ${(mouseX - lightX)}px;
                                 top: ${(mouseY - lightY + 16)}px;`  // Agrego un valor de desfasaje para que el cursor pueda seleccionar el texto debajo de la luz.
    )  
  
    // Actualizo las propiedades de sombra e iluminación para cada elemento segun la última posición del cursor del mouse.
    for (let i = 0; i < allShadElem.length; i++) {

        // Evito que se actualize la sombra de elementos que estan afuera del viewport, para mejorar el rendimiento. 
        const tolerance = 200;  // Valor que disminuye la probabilidad de que un elemento sea visto sin iluminación y sombra dinámica al hacerse scroll rapidamente.
        const elemInfo = allShadElem[i].getBoundingClientRect();
        if ((elemInfo.top - tolerance > window.innerHeight) || ((elemInfo.top + elemInfo.height + tolerance) < 0)) continue
        
        // Actualizo en centro de cada elemento.
        const elemCenterX = elemInfo.left + (elemInfo.width/2 )
        const elemCenterY = elemInfo.top + (elemInfo.height/2 )

        // Obtengo la distancia a la que esta cada elemento con respecto al cursor, para calcular después el blur de su sombra, y su iluminación.
        const cursDist = Math.sqrt(( Math.abs(elemCenterX - mouseX) ** 2 ) + ( Math.abs(elemCenterY - mouseY) ** 2 ))  // Formula para calcular la distancia entre dos puntos:  d=√((x2-x1)²+(y2-y1)²)

        const opacityValue = shadOpacMax - (cursDist / (window.innerWidth * shadOpacMin));  // Calculo la opacidad de la sombra del elemento actual.
        let brightnessValue = ilumMax - (cursDist / (window.innerWidth * ilumMin));  // Calculo la iluminación del elemento actual.
        if (brightnessValue < 0 ) brightnessValue = 0;     // La iluminación de un elemento no debe ser menor a 0, o podrían mostrarse con una iluminación del 100%.

        // Actualizo la sombra e iluminación de cada elemnto en el viewport. 
        allShadElem[i].style.filter = `drop-shadow( ${((elemCenterX - mouseX) * shadMovement)}px
                                                    ${((elemCenterY - mouseY) * shadMovement)}px
                                                    ${browserName !== "firefox" ? (cursDist * shadBlur) : shadBlurFirefox}px
                                                    hsla(180, 100%, 0%, ${ opacityValue }))
                                        brightness(${ brightnessValue })`   
                                                                                                

        // Modifico el z-index de cada elemento cuando el cursor cambia de lado para evitar que las sombras se proyecten sobre elementos cercanos.
        if ((mouseX >= viewportCenter && allShadElem[i].style.zIndex !== `${allShadElem.length - i}`) || 
            (mouseX < viewportCenter && allShadElem[i].style.zIndex !== "auto")){
            allShadElem[i].style.zIndex = `${mouseX >= viewportCenter ? allShadElem.length - i : "auto"}`
        }
    }
}
