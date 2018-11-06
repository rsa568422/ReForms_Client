$(document).ready(function() {
    
    var color, u = JSON.parse(sessionStorage.usuario);
    if (u.gerente && u.gerente == 1) {
        $("#btn-jornadas").show();
        $("#btn-aseguradoras").show();
        $("#btn-activos").show();
    } else {
        $("#btn-jornadas").hide();
        $("#btn-aseguradoras").hide();
        $("#btn-activos").hide();
    }
    
    function paginaNoEncontrada(nombre) {
        $("#contenido").html("<h2>Error 404: no se encuentra la pagina " + nombre + "</h2>");
    }
    
    color = localStorage.colorSiniestros ? localStorage.colorSiniestros : "rgb(60, 179, 113)";
    $("#btn-siniestros").css("background-color", color);
    color = localStorage.colorJornadas ? localStorage.colorJornadas : "rgb(255, 165, 0)";
    $("#btn-jornadas").css("background-color", color);
    color = localStorage.colorAseguradoras ? localStorage.colorAseguradoras : "rgb(238, 130, 238)";
    $("#btn-aseguradoras").css("background-color", color);
    color = localStorage.colorActivos ? localStorage.colorActivos : "rgb(30, 144, 255)";
    $("#btn-activos").css("background-color", color);
    $("#btn-configuracion").css("background-color", "rgb(160, 160, 160)");
    $("#btn-logout").css("background-color", "rgb(255, 99, 71)");
    
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
    
    $("#btn-configuracion").click(function() {
        $("#contenido").load("configuracion.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                paginaNoEncontrada("configuracion.html");
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
