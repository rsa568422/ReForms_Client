$(document).ready(function() {
    $("#barra_buscador").click(function() {
        $("#contenido").load("buscadorSiniestros.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                alert("Error: no se pudo cargar buscadorSiniestros.html");
            }
        });
    });
    $("#barra_nuevoSiniestro").click(function() {
        $("#contenido").load("nuevoSiniestro.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                alert("Error: no se pudo cargar nuevoSiniestro.html");
            }
        });
    });
});