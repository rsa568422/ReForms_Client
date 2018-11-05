$(document).ready(function() {
    var color = $("#btn-aseguradoras").css("background-color");
    $("#ventana").css("border-color", color);
    $("#aseguradoras").css("border-color", color);
    $("#peritos").css("border-color", color);
    $("#trabajos").css("border-color", color);
    color = color.substring(0, color.length - 1) + ", 0.3)";
    $("#ventana").css("background-color", color);
    
});
