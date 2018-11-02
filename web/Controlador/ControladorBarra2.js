$(document).ready(function() {
    $("#barra_buscador").click(function() {
        $(this).addClass("active");
        $("#barra_nuevoSiniestro").removeClass("active");
        $("#contenido").load("buscadorSiniestros2.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                alert("Error: no se pudo cargar buscadorSiniestros2.html");
            }
        });
    });
    $("#barra_nuevoSiniestro").click(function() {
        $(this).addClass("active");
        $("#barra_buscador").removeClass("active");
        $("#contenido").load("nuevoSiniestro2.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                alert("Error: no se pudo cargar nuevoSiniestro2.html");
            }
        });
    });
});