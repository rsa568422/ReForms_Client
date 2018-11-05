$(document).ready(function() {
    
    function mostrarLogo(aseguradora) {
        var i = "<img src='data:image/gif;base64," + aseguradora.logo + "' width='72' height='54' alt='" + aseguradora.nombre + "'/>";
        $("#listaAseguradoras").append(i);
        $("#listaAseguradoras").children("img").css("margin-right", "1%");
    }
        
    var aseguradoras, color = $("#btn-aseguradoras").css("background-color");
    $("#ventana").css("border-color", color);
    $("#aseguradoras").css("border-color", color);
    $("#listaAseguradoras").css("border-color", color);
    $("#peritos").css("border-color", color);
    $("#trabajos").css("border-color", color);
    color = color.substring(0, color.length - 1) + ", 0.3)";
    $("#ventana").css("background-color", color);
    
    $.get("http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras", function(data, status) {
        if (status == "success") {
            aseguradoras = data;
            var i;
            for (i = 0; i < aseguradoras.length; i++) {
                mostrarLogo(aseguradoras[i]);
            }
        }
    }, "json");
});
