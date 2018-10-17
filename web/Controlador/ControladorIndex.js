$(document).ready(function() {
    $("#barra").load("barra.html", function(responseTxt, statusTxt) {
        if(statusTxt !== "success") {
            alert("Error: no se pudo cargar barra.html");
        }
    });
    $("#contenido").load("buscadorSiniestros.html", function(responseTxt, statusTxt) {
        if(statusTxt !== "success") {
            alert("Error: no se pudo cargar buscadorSiniestros.html");
        }
    });
});
