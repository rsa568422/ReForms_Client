$(document).ready(function() {
    
    var operadores;
    
    function acceder() {
        $("#barra").load("barra.html", function(responseTxt, statusTxt) {
            if(statusTxt === "success") {
                $("#contenido").load("siniestros.html", function(responseTxt, statusTxt) {
                    if(statusTxt !== "success") {
                        alert("Error: no se pudo cargar siniestros.html");
                    }
                });
            } else {
                alert("Error: no se pudo cargar barra.html");
            }
        });
    }

    $.get("http://localhost:8080/ReForms_Provider/wr/operador/prueba/", function(data, status) {
        if (data != null) {
            operadores = data;
            var i;
            for (i = 0; i < operadores.length; i++) {
                var nombre = operadores[i].trabajador.nombre + " " + operadores[i].trabajador.apellido1 + " " + (operadores[i].trabajador.apellido2 ? operadores[i].trabajador.apellido2 : "");
                $("#operadores").children("table").children("tbody").append("<tr class='operador'><td><h4>" + nombre + "</h4></td></tr>");
            }
            $(".operador").dblclick(function() {
                sessionStorage.setItem("usuario", JSON.stringify(operadores[$(this).index()]));
                acceder();
            });
        }
    }, "json");
    
    $("#barra").hide();
});