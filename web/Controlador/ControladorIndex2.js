$(document).ready(function() {
    $("#barra").load("barra2.html", function(responseTxt, statusTxt) {
        if(statusTxt !== "success") {
            alert("Error: no se pudo cargar barra2.html");
        }
    });
    $("#contenido").load("buscadorSiniestros2.html", function(responseTxt, statusTxt) {
        if(statusTxt !== "success") {
            alert("Error: no se pudo cargar buscadorSiniestros2.html");
        }
    });
});
