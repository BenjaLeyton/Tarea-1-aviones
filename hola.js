let myMap = L.map('myMap').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(myMap);

const mensaje_inicio ={
    "type": "join",
    "id": "d907025a-4fba-483f-a551-eb4bf2f655d5",
    "username": "Benja"
}
const llegada_mensajes ={
    "type": "chat",
    "content": "Some message"
}

let socket= new WebSocket("wss://tarea-1.2022-2.tallerdeintegracion.cl/connect");
socket.onopen = function() {
    console.log("Conectado");
    socket.send(JSON.stringify(mensaje_inicio));
};

function agregarFila(lista, largo){
    for ( i=0; i < largo; i++) {
        document.getElementById("table").insertRow(-1).innerHTML = '<table><tr><td>'+lista[i][0]+'</td><td>'+lista[i][1]+'</td><td>'+lista[i][2]+'</td></tr></table>';
    }
}
function reemplazarFila(lista) {
    for ( i=0; i < lista.length; i++) {
        let celdas1 = document.getElementById("table").rows[i+1].cells;
        celdas1[0].innerHTML = lista[i][0];
        let celdas2 = document.getElementById("table").rows[i+1].cells;
        celdas2[1].innerHTML = lista[i][1];
        let celdas3 = document.getElementById("table").rows[i+1].cells;
        celdas3[2].innerHTML = lista[i][2];
    }
}
let lista_aviones = []
let lista_orden = [] 
let indice = 0 
const $messageForm = $("#message-form");
const $messageBox = $("#message");
const $chat = $("#chat");
socket.onmessage = function(Mensajes){
    var mensajesobtenidos = JSON.parse(Mensajes.data);
    if (mensajesobtenidos.type == "flights"){
        let llaves = (Object.keys(mensajesobtenidos.flights)).sort();
        for ( i=0; i < llaves.length; i++) {
            a = mensajesobtenidos.flights[llaves[i]].id;
            b = mensajesobtenidos.flights[llaves[i]].departure.id;
            c = mensajesobtenidos.flights[llaves[i]].destination.id;
            lista_orden.push([a, b, c])
            if (lista_orden.length >=2){
                for (i=0; i < lista_orden.length - 1; i++) {
                    if (lista_orden[i][1] == lista_orden[i + 1][1]){
                        let orden = [];
                        orden.push(lista_orden[i][2]);
                        orden.push(lista_orden[i+1][2]);
                        orden.sort();
                        let primero = 0
                        let segundo = 0
                        if (orden[0]==lista_orden[i][2]){
                            primero = lista_orden[i]; 
                            segundo = lista_orden[i+1];
                        } else if(orden[0]==lista_orden[i+1][2]){
                            primero = lista_orden[i+1]; 
                            segundo = lista_orden[i];
                        }
                        lista_orden[i] = primero;
                        lista_orden[i+1] = segundo;  
                    }
                }
            }
            if (indice == 0 & i == llaves.length-1){
                agregarFila(lista_orden, llaves.length);
                lista_orden = [];
                indice = 1;
            }
            if (indice == 1 & i == llaves.length-1){
                reemplazarFila(lista_orden);
                lista_orden = [];
            }
        }
        for ( i=0; i < llaves.length; i++) {
            let latitud = mensajesobtenidos.flights[llaves[i]].departure.location.lat;
            let longitud = mensajesobtenidos.flights[llaves[i]].departure.location.long;
            L.marker([latitud, longitud]).addTo(myMap)
            .bindPopup("<strong>id vuelo: </strong>" + a + "<br/>" + "<strong>Nombre: </strong>" + mensajesobtenidos.flights[llaves[i]].departure.name + "<br/>" + 
            "<strong>país: </strong>" + mensajesobtenidos.flights[llaves[i]].departure.city.country.name + "<br/>" + "<strong>ciudad: </strong>" + mensajesobtenidos.flights[llaves[i]].departure.city.name + "<br/>");
            
            let latitud2 = mensajesobtenidos.flights[llaves[i]].destination.location.lat;
            let longitud2 = mensajesobtenidos.flights[llaves[i]].destination.location.long;
            var customIcon = new L.Icon({
                iconUrl: 'icono_verde.png',
                iconSize: [50, 50],
                iconAnchor: [25, 50]
              });
            L.marker([latitud2, longitud2], {icon: customIcon}).addTo(myMap)
            .bindPopup("<strong>id vuelo: </strong>" + a + "<br/>" + "<strong>Nombre: </strong>" + mensajesobtenidos.flights[llaves[i]].destination.name + "<br/>" + 
            "<strong>país: </strong>" + mensajesobtenidos.flights[llaves[i]].destination.city.country.name + "<br/>" + "<strong>ciudad: </strong>" + mensajesobtenidos.flights[llaves[i]].destination.city.name + "<br/>");
            
            var latlngs = [
                [latitud, longitud],
                [latitud2, longitud2],
            ];
            
            L.polyline(latlngs, {color: 'red'}).addTo(myMap);
        }
    } 
    if (mensajesobtenidos.type == "message"){
        let color = mensajesobtenidos.message.level
        let fecha = mensajesobtenidos.message.date
        let nombre = mensajesobtenidos.message.name
        if (color == "info"){
            $chat.append('<div class="mensaje" >' + nombre + ': ' + mensajesobtenidos.message.content + '<br/>' + fecha + '<br/>' + '</div>');
            document.getElementById('chat').scrollTop=50000;
        } else if (color == "warn") {
            $chat.append('<div class="mensaje2" >' + nombre + ': ' + mensajesobtenidos.message.content + '<br/>' + fecha + '<br/>' + '</div>');
            document.getElementById('chat').scrollTop=50000;
        }
    }
    if (mensajesobtenidos.type == "plane"){
        let state = 0
        let id = mensajesobtenidos.plane.flight_id;
        let nombre = mensajesobtenidos.plane.airline.name;
        let capitan = mensajesobtenidos.plane.captain;
        let eta = mensajesobtenidos.plane.ETA;
        let estado = mensajesobtenidos.plane.status;
         
        let latitud_posicion = mensajesobtenidos.plane.position.lat;
        let longitud_posicion = mensajesobtenidos.plane.position.long;
        let latitud_direccion = mensajesobtenidos.plane.heading.lat;
        let longitud_direccion = mensajesobtenidos.plane.heading.long;
        
        var customIcon = new L.Icon({
            iconUrl: 'avion.png',
            iconSize: [50, 50],
            iconAnchor: [25, 50]
            });
        for ( i=0; i < lista_aviones.length; i++) {
            if (lista_aviones[i][1] == id){
                state = 1
                myMap.removeLayer(lista_aviones[i][0])
                lista_aviones[i][0] = L.marker([latitud_posicion, longitud_posicion], {icon: customIcon}).addTo(myMap)
                .bindPopup("<strong>id avión: </strong>" + id + "<br/>" + "<strong>Nombre: </strong>" + nombre + "<br/>" + 
                "<strong>Capitán: </strong>" + capitan + "<br/>" + "<strong>ETA: </strong>" + eta + "<br/>" + "<strong>Estado: </strong>" + estado + "<br/>");
                
                var latlngs = [
                    [lista_aviones[i][2], lista_aviones[i][3]],
                    [latitud_posicion, longitud_posicion],
                ];
                
                const linea = L.polyline(latlngs, {color: 'blue'}).addTo(myMap);
                if (estado != "flying"){
                    myMap.removeLayer(lista_aviones[i][0])
                    myMap.removeLayer(linea)
                }
            }
        }
        if (state == 0){
            const marker = L.marker([latitud_posicion, longitud_posicion], {icon: customIcon}).addTo(myMap)
            .bindPopup("<strong>id avión: </strong>" + id + "<br/>" + "<strong>Nombre: </strong>" + nombre + "<br/>" + 
            "<strong>Capitán: </strong>" + capitan + "<br/>" + "<strong>ETA: </strong>" + eta + "<br/>" + "<strong>Estado: </strong>" + estado + "<br/>");
            
            lista_aviones.push([marker, id, latitud_posicion, longitud_posicion])
        } 
        
    }
}



$messageForm.submit( e => {
    e.preventDefault();
    socket.send(JSON.stringify({
        "type": "chat",
        "content": $messageBox.val()
    }));
    $messageBox.val('');
});
