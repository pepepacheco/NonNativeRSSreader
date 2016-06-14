/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var alimentadores;


function startup(){
    loadMenu("menu.xml");
    loadMain("main.xml");
    // alimentadores = [];
    if (localStorage.alimentadores) {
        alimentadores = JSON.parse(localStorage.alimentadores);
    } else {
        alimentadores = [];
    }
    
}

function alimentadoresSave(){
    localStorage.alimentadores = JSON.stringify(alimentadores);
}

function listRSS(){
    var main = $("#principal");
    /* var html = "<ul>";
    for (var i=0; i<alimentadores.length;i++){
        html += "<li onclick='loadNews(\""+alimentadores[i].url+"\",\""+alimentadores[i].tipo+"\")'>"+alimentadores[i].nombre+"</li>";
    }
    html += "</ul>";
    */
    var html = "<div>";
    for (var i=0;i<alimentadores.length;i++){
        html+="<div class='well' onclick=\"loadNews('"+alimentadores[i].url+"','"+alimentadores[i].tipo+"')\">"+alimentadores[i].nombre+"</div>";
    }
    html +="</div>";
    main.html(html);
}

function deleteRSS(){
    var main = $("#principal");    
    var html = "<div>";
    for (var i=0;i<alimentadores.length;i++){
        html+="<div class='well' onclick=\"deleteAlimentador('"+i+"')\">"+alimentadores[i].nombre+"</div>";
    }
    html +="</div>";
    main.html(html);
}

function deleteAlimentador(alimentador){
    // implementar el borrado
    alimentadores.splice(alimentador,1);
    alimentadoresSave();
    listRSS();
}

function updateRSS(){
    var main = $("#principal");    
    var html = "<div>";
    for (var i=0;i<alimentadores.length;i++){
        html+="<div class='well' onclick=\"updateAlimentador('"+i+"')\">"+alimentadores[i].nombre+"</div>";
    }
    html +="</div>";
    main.html(html);
}

function updateAlimentador(i){
    var main = $("#principal");    
    var html = "<div class='container'>";
    html += "<div class='form-group'>";
    html += "<label for='nombreRSS'>Nombre del alimentador:</label>";
    html += "<input type='text' class='form-control' id='nombreRSS' value='"+alimentadores[i].nombre+"'>";
    html += "<label for='urlRSS'>URL:</label>";
    html += "<input type='text' class='form-control' id='urlRSS' value='"+alimentadores[i].url+"' disabled>";
    html += "<label for='urlRSS'>tipo:</label>";
    html += "<input type='text' class='form-control' id='tipoRSS' value='"+alimentadores[i].tipo+"' disabled>";
    html += "<input type='button' class='btn btn-success' onclick='updateSave("+i+")' value='Aceptar'>";
    html += "<input type='button' class='btn btn-danger' onclick='loadMain(\"main.xml\")' value='Cancelar'>";
    html += "</div></div>";
    main.html(html);
}

function updateSave(i){
    alimentadores[i].nombre = $("#nombreRSS").val();
    alimentadoresSave();
    listRSS();
}

function addRSS(){
    var url = $("#url").val();
    var nombre = $("#nombre").val();
    testRSS(url,nombre);    
}

function testRSS(url, nombre){
    rssDetected=false;
    data = $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22"+url+"%22&format=json&diagnostics=true", function (data){
        if (data.query.count > 0) {            
            rssDetected=true;
            alimentadores.push({ 
                "nombre": nombre,
                "tipo": "rss",
                "url" : url
            });
            alimentadoresSave();
            alert('RSS guardado correctamente');
        }
        else {
            testATOM(url, nombre); 
        }
    });
}

function testATOM(url, nombre){
    atomDetected=false;
    data = $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20atom%20where%20url%3D%22"+url+"%22&format=json&diagnostics=true",function (data){
        if (data.query.count > 0) {            
            atomDetected=true;
            alimentadores.push({ 
                "nombre": nombre,
                "tipo": "atom",
                "url" : url
            });
            alimentadoresSave();
            alert('ATOM guardado correctamente');
        }
        else {
            alert("La URL introducida:\n"+url+"\nno puede ser procesada");
        }
    });
}

function processRSS(data){
    /* <div class="well well-sm">Small Well</div>*/
    var count = data.query.count;
    
    if (count>0) {
        var items = data.query.results.item;

        var principal = $("#principal");
        var html = "<h1>Encontradas "+count+" noticias</h1>";
        for (i=0; i<count; i++){
            html+='<a href="'+items[i].link+'"><div class="well well-sm">';
            if (typeof(items[i].title)==="string") {
                html+=items[i].title;
            } else {
                html+=items[i].title[0];
            }
            html+='</div></a>';
        }    
        principal.html(html); 
    } else {
        alert("Error al procesar el RSS");
    }
}

// QUEDA PENDIENTE COMO PRACTICA HACER EL ATOM!!!!!
function processATOM(data){
    /* <div class="well well-sm">Small Well</div>*/
    var count = data.query.count;
     
    if (count>0) {
        var items = data.query.results.entry;

        var principal = $("#principal");
        var html = "<h1>Encontradas "+count+" noticias</h1>";
        for (i=0; i<count; i++){
            html+='<a href="'+items[i].id+'"><div class="well well-sm">';
            if (typeof(items[i].title)==="string") {
                html+=items[i].title;
            } else {
                html+=items[i].title[0];
            }
            html+='</div></a>';
        }    
        principal.html(html); 
    } else {
        alert("Error al procesar el ATOM");
    }
}


// tipo puede ser rss o atom
function loadNews(url, tipo){
    if (tipo==="rss") {
        $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20"+tipo+"%20where%20url%3D%22"+url+"%22&format=json&diagnostics=true&callback=", processRSS);
    }
    if (tipo==="atom") {
        $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20"+tipo+"%20where%20url%3D%22"+url+"%22&format=json&diagnostics=true&callback=", processATOM);
    }
    
}

function loadMain(menufile){
    // var main = document.getElementById("main");
    var main = $("#principal");
    
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
                main.html(xhttp.responseText);
            }
    };
    xhttp.open("GET", "views/"+menufile, true);
    xhttp.send();
}

function loadMenu(menufile){
    var menu = $("#menu");
    
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
                menu.html(xhttp.responseText);
            }
    };
    xhttp.open("GET", "views/"+menufile, true);
    xhttp.send();
}

/* tmp = {
 "query": {
  "count": 42,
  "created": "2016-01-19T13:34:30Z",
  "lang": "en-US",
  "diagnostics": {
   "publiclyCallable": "true",
   "url": {
    "execution-start-time": "0",
    "execution-stop-time": "1196",
    "execution-time": "1196",
    "content": "http://www.ideal.es/jaen/rss/2.0/portada"
   },
   "user-time": "1198",
   "service-time": "1196",
   "build-version": "0.2.376"
  },
  "results": {
   "item": [
    {
     "title": " Libertad con cargos para el acusado de agredir al celador del centro de salud de Jódar ",
     "guid": "\n                                    http://www.ideal.es/jaen/provincia-jaen/201601/19/libertad-cargos-para-acusado-20160119135602.html\n                          ",
     "link": "http://www.ideal.es/jaen/provincia-jaen/201601/19/libertad-cargos-para-acusado-20160119135602.html",
     "pubDate": "Tue, 19 Jan 2016 12:58:47 +0100",
     "description": " El imputado deberá comparecer todos los 1 y 15 mientras se sigue la instrucción de este caso  "
    },
    {
     "title": " 90 millones para incorporar a los jóvenes al campo andaluz ",
     "guid": "\n                                    http://www.ideal.es/andalucia/201601/19/millones-para-incorporar-jovenes-20160119140504.html\n                          ",
     "link": "http://www.ideal.es/andalucia/201601/19/millones-para-incorporar-jovenes-20160119140504.html",
     "pubDate": "Tue, 19 Jan 2016 13:08:05 +0100",
     "description": " La Junta de Andalucía ha ampliado las ayudas para \"favorecer el relevo generacional en un sector estratégico para la economía andaluza\" "
    },
    {
     "title": " El alcalde pide una reunión a Susana Díaz ",
     "guid": "\n                                    http://www.ideal.es/jaen/jaen/201601/19/alcalde-pide-reunion-susana-20160119124657.html\n                          ",
     "link": "http://www.ideal.es/jaen/jaen/201601/19/alcalde-pide-reunion-susana-20160119124657.html",
     "pubDate": "Tue, 19 Jan 2016 11:47:48 +0100",
     "description": " Javier Márquez quiere tratar \"asuntos de interés común que beneficien\" a la capital "
    },
    {
     "title": " Los jóvenes de Jaén necesitan ganar unos 12.261 euros/año para disponer de vivienda ",
     "guid": "\n                                    http://www.ideal.es/jaen/jaen/201601/19/jovenes-jaen-necesitan-ganar-20160119005533-v.html\n                          ",
     "link": "http://www.ideal.es/jaen/jaen/201601/19/jovenes-jaen-necesitan-ganar-20160119005533-v.html",
     "pubDate": "Tue, 19 Jan 2016 00:01:40 +0100",
     "description": " Ocho de cada 10 jóvenes jienenses menores de 30 años (con un 66% de paro juvenil) continúa aún viviendo con sus padres "
    },
    {
     "title": " Jaén registra 2.989 ventas de viviendas hasta noviembre, un 22,1% más interanual ",
     "guid": "\n                                    http://www.ideal.es/jaen/jaen/201601/19/jaen-registra-ventas-viviendas-20160119005534-v.html\n                          ",
     "link": "http://www.ideal.es/jaen/jaen/201601/19/jaen-registra-ventas-viviendas-20160119005534-v.html",
     "pubDate": "Tue, 19 Jan 2016 00:06:56 +0100",
     "description": " 2015 ha sido el año en el que el mercado inmobiliario ha frenado su declive y comienza a recuperar su actividad, con precios muy bajos y 541 ventas más que un año atrás "
    },
    {
     "title": " El fraude de Acuamed salpica a diez empresas, entre ellas FCC y Acciona ",
     "guid": "\n                                    http://www.ideal.es/nacional/201601/19/directivos-acciona-entre-detenidos-20160119100125-rc.html\n                          ",
     "link": "http://www.ideal.es/nacional/201601/19/directivos-acciona-entre-detenidos-20160119100125-rc.html",
     "pubDate": "Tue, 19 Jan 2016 09:14:45 +0100",
     "description": " Entre los trece detenidos figura el presidente de FCC Construcción, Miguel Jurado "
    },
    {
     "title": " Alcaudete incorporará audioguías para las visitas a su castillo ",
     "guid": "\n                                    http://www.ideal.es/jaen/provincia-jaen/201601/19/alcaudete-incorporara-audioguias-para-20160119133933.html\n                          ",
     "link": "http://www.ideal.es/jaen/provincia-jaen/201601/19/alcaudete-incorporara-audioguias-para-20160119133933.html",
     "pubDate": "Tue, 19 Jan 2016 12:41:27 +0100",
     "description": " Diputación y Ayuntamiento firman un convenio de colaboración para mejorar la calidad de la visita "
    },
    {
     "title": " Una mujer resulta herida tras ser atropellada en Úbeda  ",
     "guid": "\n                                    http://www.ideal.es/jaen/provincia-jaen/201601/19/mujer-resulta-herida-tras-20160119102220.html\n                          ",
     "link": "http://www.ideal.es/jaen/provincia-jaen/201601/19/mujer-resulta-herida-tras-20160119102220.html",
     "pubDate": "Tue, 19 Jan 2016 09:26:29 +0100",
     "description": " Debido al golpe, quedó tumbada en el suelo, siendo atendida en primera instancia por los ocupantes del vehículo y algunos peatones que pasaban por allí, entre ellos un agente de la Policía Local que no estaba de servicio y que además se ocupó de controlar la circulació "
    },
    {
     "title": " El agua de Mogón ya es apta para el consumo tras 37 días  ",
     "guid": "\n                                    http://www.ideal.es/jaen/provincia-jaen/201601/19/agua-mogon-apta-para-20160119135227.html\n                          ",
     "link": "http://www.ideal.es/jaen/provincia-jaen/201601/19/agua-mogon-apta-para-20160119135227.html",
     "pubDate": "Tue, 19 Jan 2016 12:55:33 +0100",
     "description": " Las tres analíticas consecutivas realizadas muestran que los valores paramétricos de color y turbidez se encuentran por debajo por los límites dispuestos en la normativa "
    },
    {
     "title": " Desarrollan un proyecto para producir bioplástico con desechos del tomate ",
     "guid": "\n                                    http://www.ideal.es/jaen/provincia-jaen/201601/19/desarrollan-proyecto-para-producir-20160119124055.html\n                          ",
     "link": "http://www.ideal.es/jaen/provincia-jaen/201601/19/desarrollan-proyecto-para-producir-20160119124055.html",
     "pubDate": "Tue, 19 Jan 2016 11:44:10 +0100",
     "description": " Se estima que se generan alrededor de 6.500 toneladas al año en España y 25.000 toneladas anuales en toda Europa de desechos, principalmente piel, fibra y semillas en la producción de tomate triturado comercial "
    },
    {
     "title": " Los interinos pueden cobrar ya la carrera profesional ",
     "guid": "\n                                    http://www.ideal.es/sociedad/201601/19/interinos-pueden-cobrar-carrera-20160119123657.html\n                          ",
     "link": "http://www.ideal.es/sociedad/201601/19/interinos-pueden-cobrar-carrera-20160119123657.html",
     "pubDate": "Tue, 19 Jan 2016 11:38:25 +0100",
     "description": " El TSJCV reconoce que los trabajadores con contrato de duración determinada \"no pueden ser tratados de forma menos favorable que los fijos, a menos que quede justificado un trato distinto por razones objetivas\" "
    },
    {
     "title": " Descubren a un grupo que facilitaba las respuestas del examen de conducir ",
     "guid": "\n                                    http://www.ideal.es/nacional/201601/19/descubren-grupo-facilitaba-respuestas-20160119111951.html\n                          ",
     "link": "http://www.ideal.es/nacional/201601/19/descubren-grupo-facilitaba-respuestas-20160119111951.html",
     "pubDate": "Tue, 19 Jan 2016 10:20:26 +0100",
     "description": " La Policía Local descubrió a cuatro individuos dentro de un coche manipulando un aparato con cable. Al realizar el registro, encontraron la presencia de un sistema de comunicación para contactar con otra persona y una convocatoria de examen de conducir "
    },
    {
     "title": " Estafan 130.000 euros haciéndose pasar por el ex guitarrista de El Canto del Loco ",
     "guid": "\n                                    http://www.ideal.es/nacional/201601/19/estafan-euros-haciendose-pasar-20160118152302.html\n                          ",
     "link": "http://www.ideal.es/nacional/201601/19/estafan-euros-haciendose-pasar-20160118152302.html",
     "pubDate": "Tue, 19 Jan 2016 10:15:46 +0100",
     "description": " Una pareja consiguió engañar a varias entidades sin ánimo de lucro, que transfirieron distintas cantidades de dinero para ayudar a un supuesto niño enfermo de leucemia | Samuel Eto?o y la Bruixa d?Or, entre las víctimas del engaño "
    },
    {
     "title": " \"No queremos morir\": la frase de un tripulante de Ryanair que desató el infierno ",
     "guid": "\n                                    http://www.ideal.es/sociedad/201601/19/queremos-morir-frase-tripulacion-20160118161017.html\n                          ",
     "link": "http://www.ideal.es/sociedad/201601/19/queremos-morir-frase-tripulacion-20160118161017.html",
     "pubDate": "Tue, 19 Jan 2016 08:55:17 +0100",
     "description": " Esa fue la explicación que dio al retraso de ocho horas que sufría el avión "
    },
    {
     "title": " Corte de pelo gratis y mucha atención para los que no tienen hogar ",
     "guid": "\n                                    http://www.ideal.es/sociedad/201601/19/corte-pelo-gratis-mucha-20160119112208.html\n                          ",
     "link": "http://www.ideal.es/sociedad/201601/19/corte-pelo-gratis-mucha-20160119112208.html",
     "pubDate": "Tue, 19 Jan 2016 10:27:50 +0100",
     "description": " Tres jóvenes madrileños se dedican a pelar y dar conversación a esa gente que vive en la calle "
    },
    {
     "title": " Pólvora mojada ante los grandes ",
     "guid": "\n                                    http://realjaen.ideal.es/noticias/201601/19/polvora-mojada-ante-grandes-20160119005532-v.html\n                          ",
     "link": "http://realjaen.ideal.es/noticias/201601/19/polvora-mojada-ante-grandes-20160119005532-v.html",
     "pubDate": "Tue, 19 Jan 2016 00:18:20 +0100",
     "description": " El Real Jaén sólo ha marcado un gol, y de penalti, ante los ocho primeros de la tabla "
    },
    {
     "title": " Linares y Granada zanjan la polémica con la cesión del brasileño Luizinho ",
     "guid": "\n                                    http://linaresdeportivo.ideal.es/noticias/201601/19/linares-granada-zanjan-polemica-20160119005533-v.html\n                          ",
     "link": "http://linaresdeportivo.ideal.es/noticias/201601/19/linares-granada-zanjan-polemica-20160119005533-v.html",
     "pubDate": "Tue, 19 Jan 2016 00:19:11 +0100",
     "description": " Juanfran lamenta que su comentario se considere racista, cuando su intención era reivindicar oportunidades a canteranos como él, que se formó en el Granada "
    },
    {
     "title": " Derrotas de las secciones de waterpolo del Club Natación Jaén\n ",
     "guid": "\n                                    http://www.ideal.es/jaen/deportes/deporte-provincial/201601/19/derrotas-secciones-waterpolo-club-20160119005533-v.html\n                          ",
     "link": "http://www.ideal.es/jaen/deportes/deporte-provincial/201601/19/derrotas-secciones-waterpolo-club-20160119005533-v.html",
     "pubDate": "Tue, 19 Jan 2016 00:19:31 +0100",
     "description": " El bloque masculino llegó al último cuarto con opciones ante el Épsilon, invicto esta temporada, pero sucumbió en el último parcial\n "
    },
    {
     "title": " Raúl: «El Madrid siempre será mi casa y ojalá en algún momento pueda ayudar» ",
     "guid": "\n                                    http://www.ideal.es/jaen/deportes/futbol/201601/19/raul-madrid-siempre-sera-20160119025444-rc.html\n                          ",
     "link": "http://www.ideal.es/jaen/deportes/futbol/201601/19/raul-madrid-siempre-sera-20160119025444-rc.html",
     "pubDate": "Tue, 19 Jan 2016 01:58:53 +0100",
     "description": " \"Con Zidane creo que el equipo va a tener muchas más opciones de poder aspirar a conseguir algo importante en la Liga y en la Champions\", reconoce el exfutbolista "
    },
    {
     "title": " Debacle de Nadal ante Verdasco ",
     "guid": "\n                                    http://www.ideal.es/jaen/deportes/tenis/open-australia/201601/19/verdasco-encuentra-venganza-australia-20160119091330-rc.html\n                          ",
     "link": "http://www.ideal.es/jaen/deportes/tenis/open-australia/201601/19/verdasco-encuentra-venganza-australia-20160119091330-rc.html",
     "pubDate": "Tue, 19 Jan 2016 08:15:59 +0100",
     "description": " El madrileño eliminó al balear en primera ronda del Open de Australia después de redondear un gran partido decidido en el quinto set ante un Nadal dominado de principio a fin "
    },
    {
     "title": " Blatter sigue recibiendo el sueldo de presidente de la FIFA pese a estar inhabilitado ",
     "guid": "\n                                    http://www.ideal.es/jaen/deportes/futbol/201601/19/blatter-sigue-recibiendo-sueldo-20160119115811-rc.html\n                          ",
     "link": "http://www.ideal.es/jaen/deportes/futbol/201601/19/blatter-sigue-recibiendo-sueldo-20160119115811-rc.html",
     "pubDate": "Tue, 19 Jan 2016 11:05:04 +0100",
     "description": " \"Hasta la elección de un nuevo presidente el 26 de febrero, el señor Blatter es el presidente electo y por lo tanto tiene derecho a recibir su remuneración\", confirma un portavoz del organismo "
    },
    {
     "title": " La actriz Rosario Pardo 'forma' a los profesores para llevar el teatro a las aulas ",
     "guid": "\n                                    http://www.ideal.es/jaen/linares/201601/19/actriz-rosario-pardo-forma-20160119005534-v.html\n                          ",
     "link": "http://www.ideal.es/jaen/linares/201601/19/actriz-rosario-pardo-forma-20160119005534-v.html",
     "pubDate": "Tue, 19 Jan 2016 00:10:58 +0100",
     "description": " «Es una gran iniciativa la que desarrolla el Centro del Profesorado ante la necesidad de devolver el teatro a las aulas porque parece que no interesa a la sociedad y, sin embargo, ahora necesitamos ese apoyo más que nunca», defendió la actriz "
    },
    {
     "title": " El Hospital de Jaén se implica en la lucha contra patologías hereditarias ",
     "guid": "\n                                    http://www.ideal.es/jaen/jaen/201601/19/hospital-jaen-implica-lucha-20160119005533-v.html\n                          ",
     "link": "http://www.ideal.es/jaen/jaen/201601/19/hospital-jaen-implica-lucha-20160119005533-v.html",
     "pubDate": "Tue, 19 Jan 2016 00:09:10 +0100",
     "description": " El Complejo ha puesto en marcha una consulta genética por la que han pasado en seis meses medio millar de pacientes de la provincia "
    },
    {
     "title": " Jaén, entre las provincias con más fraude en el seguro de automóviles ",
     "guid": "\n                                    http://www.ideal.es/jaen/jaen/201601/19/jaen-entre-provincias-fraude-20160119005533-v.html\n                          ",
     "link": "http://www.ideal.es/jaen/jaen/201601/19/jaen-entre-provincias-fraude-20160119005533-v.html",
     "pubDate": "Tue, 19 Jan 2016 00:05:43 +0100",
     "description": " Según un estudio elaborado por la compañía Línea Directa, la cuantía media de cada intento de estafa en Jaén es de 1.968 euros "
    },
    {
     "title": " La vieja ",
     "guid": "\n                                    http://www.ideal.es/jaen/jaen/201601/19/vieja-20160119005533-v.html\n                          ",
     "link": "http://www.ideal.es/jaen/jaen/201601/19/vieja-20160119005533-v.html",
     "pubDate": "Tue, 19 Jan 2016 00:08:11 +0100",
     "description": " «Jaén es una vieja de toquilla y brasero picón. No le nacen hijos. Y los pocos que salen adelante se suelen marchar a otros lugares donde ser niño no sea raro» "
    },
    {
     "title": " Rajoy, a Sánchez: «Desde el sectarismo no se construye nada» ",
     "guid": "\n                                    http://www.ideal.es/nacional/201601/19/rajoy-sanchez-desde-sectarismo-20160119120930-rc.html\n                          ",
     "link": "http://www.ideal.es/nacional/201601/19/rajoy-sanchez-desde-sectarismo-20160119120930-rc.html",
     "pubDate": "Tue, 19 Jan 2016 11:21:26 +0100",
     "description": " El presidente del Gobierno subraya que no entiende la actitud de Sánchez de hablar con todos, incluidos los independentistas, menos con el PP "
    },
    {
     "title": " Rivera: «Iglesias ha estafado a sus socios» ",
     "guid": "\n                                    http://www.ideal.es/nacional/201601/19/rivera-iglesias-estafado-socios-20160119120450-rc.html\n                          ",
     "link": "http://www.ideal.es/nacional/201601/19/rivera-iglesias-estafado-socios-20160119120450-rc.html",
     "pubDate": "Tue, 19 Jan 2016 11:18:20 +0100",
     "description": " El presidente de Ciudadanos arremete contra el líder de Podemos por prometer a En Comú, Compromís y Las Mareas grupos propios en el Congreso "
    },
    {
     "title": " Los parlamentarios del PSOE tendrán dedicación exclusiva ",
     "guid": "\n                                    http://www.ideal.es/nacional/201601/19/parlamentarios-psoe-tendran-dedicacion-20160119114300-rc.html\n                          ",
     "link": "http://www.ideal.es/nacional/201601/19/parlamentarios-psoe-tendran-dedicacion-20160119114300-rc.html",
     "pubDate": "Tue, 19 Jan 2016 10:48:27 +0100",
     "description": " Diputados y senadores no podrán desarrollar actividades privadas, salvo aquellas que le sean autorizadas y por las que no cobrarán ninguna retribución "
    },
    {
     "title": " El FMI mejora la previsión de crecimiento de España para 2016 hasta el 2,7% ",
     "guid": "\n                                    http://www.ideal.es/economia/201601/19/mejora-prevision-crecimiento-espana-20160119104802-rc.html\n                          ",
     "link": "http://www.ideal.es/economia/201601/19/mejora-prevision-crecimiento-espana-20160119104802-rc.html",
     "pubDate": "Tue, 19 Jan 2016 10:02:47 +0100",
     "description": " Aumenta en dos décimas su estimación para el presente ejercicio y en una su estimación para 2017 "
    },
    {
     "title": " El Tesoro vuelve a cobrar a los inversores por comprar letras ",
     "guid": "\n                                    http://www.ideal.es/economia/mercados/201601/19/tesoro-vuelve-ofrecer-tipos-20160119105502-rc.html\n                          ",
     "link": "http://www.ideal.es/economia/mercados/201601/19/tesoro-vuelve-ofrecer-tipos-20160119105502-rc.html",
     "pubDate": "Tue, 19 Jan 2016 09:59:03 +0100",
     "description": " Coloca 4.900 millones en letras a 6 y 12 meses en la primera subasta del año "
    },
    {
     "title": " Fallece un joven en una mina de Cangas del Narcea tras una explosión ",
     "guid": "\n                                    http://www.ideal.es/nacional/201601/19/fallece-joven-mina-cangas-20160119103921-rc.html\n                          ",
     "link": "http://www.ideal.es/nacional/201601/19/fallece-joven-mina-cangas-20160119103921-rc.html",
     "pubDate": "Tue, 19 Jan 2016 09:43:21 +0100",
     "description": " Se trata de Fernando Frade González, de 27 años y natural de la misma localidad. Según las primeras investigación, el accidente se produjo al detonar dinamita y tuvo lugar en el exterior de la explotación "
    },
    {
     "title": " La CHG descarta demoler la presa de Marmolejo  ",
     "guid": "\n                                    http://www.ideal.es/jaen/provincia-jaen/201601/18/descarta-demoler-presa-marmolejo-20160118170930.html\n                          ",
     "link": "http://www.ideal.es/jaen/provincia-jaen/201601/18/descarta-demoler-presa-marmolejo-20160118170930.html",
     "pubDate": "Mon, 18 Jan 2016 16:15:04 +0100",
     "description": " Aseguran que \"no tendría repercusiones\" en las inundaciones en Andújar "
    },
    {
     "title": " Jaén en Común quiere que el Ayuntamiento gestione la tasa de basura ",
     "guid": "\n                                    http://www.ideal.es/jaen/jaen/201601/18/jaen-comun-quirere-ayuntamiento-20160118133107.html\n                          ",
     "link": "http://www.ideal.es/jaen/jaen/201601/18/jaen-comun-quirere-ayuntamiento-20160118133107.html",
     "pubDate": "Mon, 18 Jan 2016 12:34:34 +0100",
     "description": " \"Consideramos que hay razones suficientes, tanto jurídicas, como económicas y políticas para tomar medidas que defiendan los intereses del Ayuntamiento y de la ciudadanía de Jaén\", aseguran desde la formación  "
    },
    {
     "title": " 'El resplandor' de El Neveral ",
     "guid": "\n                                    http://www.ideal.es/jaen/al-dia/201601/18/resplandor-neveral-20160118164156.html\n                          ",
     "link": "http://www.ideal.es/jaen/al-dia/201601/18/resplandor-neveral-20160118164156.html",
     "pubDate": "Mon, 18 Jan 2016 15:50:51 +0100",
     "description": " Jaén dispone de varias áreas recreativas 'convertidas' en escenarios de películas de terror "
    },
    {
     "title": " Desmantelado un grupo dedicado a estafar a las compañías aseguradoras ",
     "guid": "\n                                    http://www.ideal.es/jaen/provincia-jaen/201601/18/desmantelado-grupo-dedicado-estafar-20160118115717.html\n                          ",
     "link": "http://www.ideal.es/jaen/provincia-jaen/201601/18/desmantelado-grupo-dedicado-estafar-20160118115717.html",
     "pubDate": "Mon, 18 Jan 2016 11:00:35 +0100",
     "description": " Adquirían vehículos siniestrados poniéndolos en circulación con reparaciones mínimas para posteriormente simular accidentes y robos "
    },
    {
     "title": " Los jienenses realizaron 464 comunicaciones de concentración y manifestación en la provincia ",
     "guid": "\n                                    http://www.ideal.es/jaen/provincia-jaen/201601/18/jienenses-realizaron-comunicaciones-concentracion-20160118143917.html\n                          ",
     "link": "http://www.ideal.es/jaen/provincia-jaen/201601/18/jienenses-realizaron-comunicaciones-concentracion-20160118143917.html",
     "pubDate": "Mon, 18 Jan 2016 13:41:56 +0100",
     "description": " Se ha señalado un notable descenso puesto que en 2014 fueron comunicadas 621, de las que 78 no contaron con permiso "
    },
    {
     "title": " El mensaje solidario del 'Jack Sparrow' del Congreso que triunfa en España ",
     "guid": "\n                                    http://www.ideal.es/nacional/201601/19/mensaje-solidario-jack-sparrow-20160119122651.html\n                          ",
     "link": "http://www.ideal.es/nacional/201601/19/mensaje-solidario-jack-sparrow-20160119122651.html",
     "pubDate": "Tue, 19 Jan 2016 11:27:53 +0100",
     "description": " \"Con su chándal de andar por casa y con sus rastas, fue el único de todos los que invitamos, que se dignó a traer juguetes, ropa y alimentos\" "
    },
    {
     "title": " Recibe 47 multas, las recurre, le dan 47 abogados de oficio e irá a juicio 47 veces ",
     "guid": "\n                                    http://www.ideal.es/nacional/201601/19/recibe-multas-recurre-abogados-20160118175632.html\n                          ",
     "link": "http://www.ideal.es/nacional/201601/19/recibe-multas-recurre-abogados-20160118175632.html",
     "pubDate": "Tue, 19 Jan 2016 10:15:50 +0100",
     "description": " La cifra que debe pagar el ciudadano gallego asciende a la cantidad de 4.700 euros por 47 multas, en su mayoría por excederse 10 kilómetros en los túneles de la AP-9 "
    },
    {
     "title": " A la cárcel por etiquetar a su excuñada en Facebook ",
     "guid": "\n                                    http://www.ideal.es/internacional/201601/19/carcel-etiquetar-excunada-facebook-20160118134615.html\n                          ",
     "link": "http://www.ideal.es/internacional/201601/19/carcel-etiquetar-excunada-facebook-20160118134615.html",
     "pubDate": "Tue, 19 Jan 2016 09:12:48 +0100",
     "description": " La mujer etiquetó a la otra en dos publicaciones, en las que la calificaba de \"estúpida\", por un lado, y, por otro, a su familia de \"triste\" "
    },
    {
     "title": " El hallazgo español que podría mejorar la memoria en enfermos de Alzheimer ",
     "guid": "\n                                    http://www.ideal.es/sociedad/201601/19/hallazgo-espanol-podria-mejorar-20160119094223.html\n                          ",
     "link": "http://www.ideal.es/sociedad/201601/19/hallazgo-espanol-podria-mejorar-20160119094223.html",
     "pubDate": "Tue, 19 Jan 2016 08:45:00 +0100",
     "description": " Investigadores del CSIC han descubierto un mecanismo para evitar la pérdida de memoria en esta patología, por medio de un estudio con modelos de ratón que permite orientar acerca de posibles vías de intervención terapéutica "
    },
    {
     "title": " El cáncer de mama afecta más a las mujeres obesas  ",
     "guid": "\n                                    http://www.ideal.es/miugr/201601/19/cancer-mama-afecta-mujeres-20160119103409.html\n                          ",
     "link": "http://www.ideal.es/miugr/201601/19/cancer-mama-afecta-mujeres-20160119103409.html",
     "pubDate": "Tue, 19 Jan 2016 09:36:47 +0100",
     "description": " La grasa facilita la expansión de las células madre cancerígenas | Se calcula que en la actualidad hasta un 20 por ciento de las muertes por cáncer puede ser atribuible a la obesidad "
    },
    {
     "title": " El poder sereno, según Goya ",
     "guid": "\n                                    http://www.ideal.es/jaen/culturas/201601/18/poder-sereno-segun-goya-20160118181945-rc.html\n                          ",
     "link": "http://www.ideal.es/jaen/culturas/201601/18/poder-sereno-segun-goya-20160118181945-rc.html",
     "pubDate": "Mon, 18 Jan 2016 17:26:57 +0100",
     "description": " El Prado recibe como obra invitada el excepcional retrato del Duque de Osuna pintado por el genio aragonés "
    }
   ]
  }
 }
};

function escribe(){
    for (i=0; i<tmp.query.count;i++){
        document.write("<p>"+tmp.query.results.item[i].title+"</p>");
    }
}*/ 


