$(document).ready(function() {
    var color = $("#btn-siniestros").css("background-color");
    $("#ventana").css("border-color", color);
    color = color.substring(0, color.length - 1) + ", 0.1)";
    $("#ventana").css("background-color", color);
    $("#ventana").load("buscadorSiniestros2.html", function(responseTxt, statusTxt) {
        if(statusTxt !== "success") {
            alert("Error: no se pudo cargar buscadorSiniestros2.html");
        }
    });
});