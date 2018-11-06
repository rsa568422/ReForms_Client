$(document).ready(function() {
    
    var la, u = JSON.parse(sessionStorage.usuario), 
        color = $("#btn-configuracion").css("background-color");
    
    function rgb2hex(rgb) {
        var aux = rgb.slice(4, rgb.length), r, g, b;
        r = new Number(aux.slice(0, aux.indexOf(",")));
        aux = aux.slice(aux.indexOf(",") + 2, aux.length);
        g = new Number (aux.slice(0, aux.indexOf(",")));
        b = new Number (aux.slice(aux.indexOf(",") + 2, aux.length - 1));
        r = r > 15 ? r.toString(16) : ("0" + r.toString(16));
        g = g > 15 ? g.toString(16) : ("0" + g.toString(16));
        b = b > 15 ? b.toString(16) : ("0" + b.toString(16));
        return "#" + r + g + b;
    }

    function generarLogo(aseguradora) {
        return i = "<img class='logo' src='data:image/gif;base64," + aseguradora.logo + "' width='480' height='360' alt='" + aseguradora.nombre + "'/>";
    }
    
    if (u.gerente && u.gerente == 1) {
        $("#cJornadas").parent().show();
        $("#cAseguradoras").parent().show();
        $("#cActivos").parent().show();
    } else {
        $("#cJornadas").parent().hide();
        $("#cAseguradoras").parent().hide();
        $("#cActivos").parent().hide();
    }
    
    $("#ventana").css("border-color", color);
    $("#perfil").css("border-color", color);
    $("#aseguradora").css("border-color", color);
    $("#apariencia").css("border-color", color);
    color = color.substring(0, color.length - 1) + ", 0.1)";
    $("#ventana").css("background-color", color);
    
    $("#cSiniestros").val(rgb2hex($("#btn-siniestros").css("background-color")));
    $("#cJornadas").val(rgb2hex($("#btn-jornadas").css("background-color")));
    $("#cAseguradoras").val(rgb2hex($("#btn-aseguradoras").css("background-color")));
    $("#cActivos").val(rgb2hex($("#btn-activos").css("background-color")));
    
    $("#cSiniestros").change(function() {
        var c = $("#cSiniestros").val();
        c = "rgb(" + parseInt(c.slice(1, 3), 16) + ", " + parseInt(c.slice(3, 5), 16) + ", " + parseInt(c.slice(5, 7), 16) + ")";
        $("#btn-siniestros").css("background-color", c);
        localStorage.setItem("colorSiniestros", c);
    });
    
    $("#cJornadas").change(function() {
        var c = $("#cJornadas").val();
        c = "rgb(" + parseInt(c.slice(1, 3), 16) + ", " + parseInt(c.slice(3, 5), 16) + ", " + parseInt(c.slice(5, 7), 16) + ")";
        $("#btn-jornadas").css("background-color", c);
        localStorage.setItem("colorJornadas", c);
    });
    
    $("#cAseguradoras").change(function() {
        var c = $("#cAseguradoras").val();
        c = "rgb(" + parseInt(c.slice(1, 3), 16) + ", " + parseInt(c.slice(3, 5), 16) + ", " + parseInt(c.slice(5, 7), 16) + ")";
        $("#btn-aseguradoras").css("background-color", c);
        localStorage.setItem("colorAseguradoras", c);
        $(".predeterminada").css("border-color", c);
    });
    
    $("#cActivos").change(function() {
        var c = $("#cActivos").val();
        c = "rgb(" + parseInt(c.slice(1, 3), 16) + ", " + parseInt(c.slice(3, 5), 16) + ", " + parseInt(c.slice(5, 7), 16) + ")";
        $("#btn-activos").css("background-color", c);
        localStorage.setItem("colorActivos", c);
    });
    
    $("#resetearColores").click(function() {
        localStorage.removeItem("colorSiniestros");
        localStorage.removeItem("colorJornadas");
        localStorage.removeItem("colorAseguradoras");
        localStorage.removeItem("colorActivos");
        $("#btn-siniestros").css("background-color", "rgb(60, 179, 113)");
        $("#btn-jornadas").css("background-color", "rgb(255, 165, 0)");
        $("#btn-aseguradoras").css("background-color", "rgb(238, 130, 238)");
        $("#btn-activos").css("background-color", "rgb(30, 144, 255)");
        $("#cSiniestros").val(rgb2hex("rgb(60, 179, 113)"));
        $("#cJornadas").val(rgb2hex("rgb(255, 165, 0)"));
        $("#cAseguradoras").val(rgb2hex("rgb(238, 130, 238)"));
        $("#cActivos").val(rgb2hex("rgb(30, 144, 255)"));
        $(".predeterminada").css("border-color", "rgb(238, 130, 238)");
    });
    
    $.get("http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras", function(data, status) {
        if (status == "success") {
            var i, a = null;
            la = data;
            if (localStorage.aseguradoraPredeterminada) {
                a = JSON.parse(localStorage.aseguradoraPredeterminada);
            }
            for (i = 0; i < la.length; i++) {
                var logo = generarLogo(la[i]);
                if (a != null && a.id == la[i].id) {
                    logo = logo.replace("logo", "logo predeterminada");
                }
                $("#logos").append(logo);
            }
            $(".logo").css("border-color", $("#btn-configuracion").css("background-color"));
            $(".predeterminada").css("border-color", $("#btn-aseguradoras").css("background-color"));
            $(".logo").click(function() {
                var a = null;
                if (localStorage.aseguradoraPredeterminada) {
                    a = JSON.parse(localStorage.aseguradoraPredeterminada);
                }
                if (a != null && a.nombre == $(this).prop("alt")) {
                    localStorage.removeItem("aseguradoraPredeterminada");
                    $(this).removeClass("predeterminada");
                    $(this).css("border-color", $("#btn-configuracion").css("background-color"));
                } else {
                    $(this).siblings(".predeterminada").css("border-color", $("#btn-configuracion").css("background-color"));
                    $(this).siblings(".predeterminada").removeClass("predeterminada");
                    $(this).addClass("predeterminada");
                    $(this).css("border-color", $("#btn-aseguradoras").css("background-color"));
                    localStorage.setItem("aseguradoraPredeterminada", JSON.stringify(la[$(this).index()]));
                }
            });
        }
    }, "json");
});
