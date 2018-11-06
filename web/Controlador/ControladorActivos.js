$(document).ready(function() {
    var color = $("#btn-activos").css("background-color");
    $("#ventana").css("border-color", color);
    $("#trabajadores").css("border-color", color);
    $("#vehiculos").css("border-color", color);
    $("#materiales").css("border-color", color);
    color = color.substring(0, color.length - 1) + ", 0.1)";
    $("#ventana").css("background-color", color);
    
});
