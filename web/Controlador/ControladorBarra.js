$(document).ready(function() {
    
    function paginaNoEncontrada(nombre) {
        $("#contenido").html("<h2>Error 404: no se encuentra la pagina " + nombre + "</h2>");
    }
    
    $("#barra").addClass("bg-dark");
    $("#barra").show();
    
    $("#btn-siniestros").click(function() {
        $("#contenido").load("siniestros.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                paginaNoEncontrada("siniestros.html");
            }
        });
    });
    
    $("#btn-jornadas").click(function() {
        $("#contenido").load("jornadas.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                paginaNoEncontrada("jornadas.html");
            }
        });
    });
    
    $("#btn-aseguradoras").click(function() {
        $("#contenido").load("aseguradoras.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                paginaNoEncontrada("aseguradoras.html");
            }
        });
    });
    
    $("#btn-activos").click(function() {
        $("#contenido").load("activos.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                paginaNoEncontrada("activos.html");
            }
        });
    });
    
    $("#btn-logout").click(function() {
        localStorage.removeItem("usuario");
        $("#barra").html("");
        $("#contenido").load("login.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                paginaNoEncontrada("login.html");
            }
        });
    });
});
