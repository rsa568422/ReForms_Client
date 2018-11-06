$(document).ready(function() {
    
    var peritos,
        la, aseguradora = null,
        color = $("#btn-aseguradoras").css("background-color");
    
    function generarLogo(aseguradora) {
        return i = "<img class='logo' src='data:image/gif;base64," + aseguradora.logo + "' width='480' height='360' alt='" + aseguradora.nombre + "'/>";
    }
    
    function cargarPeritosTareas() {
        $.get("http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoPorAseguradora/" + aseguradora.id, function(data, status) {
            if (status == "success") {
                var i, tbody = $("#peritos").find("table").children("tbody");
                peritos = data;
                tbody.children("tr").remove();
                for (i = 0; i < peritos.length; i++) {
                    var apellidos = peritos[i].apellido1,
                        telefono1 = "", telefono2 = "", telefonos,
                        fax = "",
                        email = "";
                    if (peritos[i].apellido2 && peritos[i].apellido2 != "") {
                        apellidos += " " + peritos[i].apellido2;
                    }
                    if (peritos[i].telefono1 && peritos[i].telefono1 != "") {
                        telefono1 = peritos[i].telefono1;
                        if (peritos[i].telefono2 && peritos[i].telefono2 != "") {
                            telefono2 = peritos[i].telefono2;
                        }
                    } else if (peritos[i].telefono2 && peritos[i].telefono2 != "") {
                        telefono1 = peritos[i].telefono2;
                    }
                    telefonos = telefono2 == "" ? telefono1 : (telefono1 + "/" + telefono2);
                    if (peritos[i].fax) {
                        fax = peritos[i].fax;
                    }
                    if (peritos[i].email) {
                        email = peritos[i].email;
                    }
                    tbody.append("<tr><td>" + peritos[i].nombre + "</td><td>" + apellidos + "</td><td>" + telefonos + "</td><td>" + fax + "</td><td>" + email + "</td></tr>");
                }
                tbody.children("tr").click(function() {
                    alert($(this).index());
                });
            }
        }, "json");
        $("#peritos").show();
        $("#trabajos").show();
    }
        
    $("#ventana").css("border-color", color);
    $("#aseguradoras").css("border-color", color);
    $("#logos").css("border-color", color);
    $("#peritos").css("border-color", color);
    $("#peritos").find("thead").children("tr").css("background-color", color);
    $("#btnNuevoPerito").css("border-color", $("#btn-aseguradoras").css("background-color"));
    $("#btnNuevoPerito").css("color", $("h2").css("color"));
    $("#btnNuevoPerito").css("background-color", "rgb(0, 0, 0, 0)");
    $("#trabajos").css("border-color", color);
    color = color.substring(0, color.length - 1) + ", 0.1)";
    $("#ventana").css("background-color", color);
    
    $("#peritos").hide();
    $("#trabajos").hide();
    
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
                    logo = logo.replace("logo", "logo seleccionada");
                    aseguradora = la[i];
                    cargarPeritosTareas();
                }
                $("#logos").append(logo);
            }
            $("#logos").append("<button id='btnNuevaAseguradora' type='button' class='btn'><i class='material-icons md-48'>add_circle</i></button>");
            $(".logo").css("border-color", $("#btn-aseguradoras").css("background-color"));
            $("#btnNuevaAseguradora").css("border-color", $("#btn-aseguradoras").css("background-color"));
            $("#btnNuevaAseguradora").css("color", $("#btn-aseguradoras").css("background-color"));
            $("#btnNuevaAseguradora").css("background-color", "rgb(0, 0, 0, 0)");
            $(".logo").click(function() {
                aseguradora = la[$(this).index()];
                $(this).siblings(".seleccionada").removeClass("seleccionada");
                $(this).addClass("seleccionada");
                cargarPeritosTareas();
            });
            $("#btnNuevaAseguradora").click(function() {
                aseguradora = null;
                $(".seleccionada").removeClass("seleccionada");
                $("#peritos").hide();
                $("#trabajos").hide();
            });
        }
    }, "json");
});
