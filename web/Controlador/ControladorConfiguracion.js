$(document).ready(function() {
    
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
    
    var color = $("#btn-configuracion").css("background-color");
    $("#ventana").css("border-color", color);
    $("#perfil").css("border-color", color);
    $("#apariencia").css("border-color", color);
    color = color.substring(0, color.length - 1) + ", 0.3)";
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
    });
});
