$(document).ready(function() {
    var color = $("#btn-jornadas").css("background-color");
    $("#ventana").css("border-color", color);
    color = color.substring(0, color.length - 1) + ", 0.1)";
    $("#ventana").css("background-color", color);
    
});
