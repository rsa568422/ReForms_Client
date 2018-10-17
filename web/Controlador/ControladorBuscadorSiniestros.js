$(document).ready(function() {
    
    function configurarEntradas() {
        $("#resultado").hide();
        $(".entradaUsuario").remove();
        switch ($("#busqueda").val()) {
            case "siniestro":
                $("#entradas").append("<input id='e_siniestro' name='e_siniestro' class='entradaUsuario' type='text'/>");
                break;
            case "poliza":
                $("#entradas").append("<input id='e_poliza' name='e_poliza' class='entradaUsuario' type='text'/>");
                break;
            case "nombre":
                $("#entradas").append("<input id='e_nombre' name='e_nombre' class='entradaUsuario' type='text'/>");
                $("#entradas").append("<input id='e_apellido1' name='e_apellido1' class='entradaUsuario' type='text'/>");
                $("#entradas").append("<input id='e_apellido2' name='e_apellido2' class='entradaUsuario' type='text'/>");
                break;
            case "telefono":
                $("#entradas").append("<input id='e_telefono' name='e_telefono' class='entradaUsuario' type='text'/>");
                break;
            case "direccion":
                $("#entradas").append("<input id='e_direccion' name='e_direccion' class='entradaUsuario' type='text'/>");
                $("#entradas").append("<input id='e_numero' name='e_numero' class='entradaUsuario' type='text'/>");
                $("#entradas").append("<input id='e_piso' name='e_piso' class='entradaUsuario' type='text'/>");
                $("#entradas").append("<input id='e_cp' name='e_cp' class='entradaUsuario' type='text'/>");
        }
        $("#entradas").show();
    }

    $("#resultado").hide();
    
    $.get("http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras", function(data, status) {
        if (status == "success") {
            var i;
            for (i = 0; i < data.length; i++) {
                $("#aseguradoras").append("<option value='" + data[i].id + "'>" + data[i].nombre + "</option>");
            }
        }
    }, "json");
    
    $("#busqueda").change(function() {
        configurarEntradas();
    });
    
    configurarEntradas();
    
    $("#buscar").click(function() {
        switch ($("#busqueda").val()) {
            case "siniestro":
                if ($("#aseguradoras").val() == -1) {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestro/" + $("#e_siniestro").val(), function(data, status) {
                        if (status == "success") {
                            // data me da una lista de siniestros
                        } else {
                            // informar del error
                        }
                    }, "json");
                } else {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestroA/" + $("#aseguradoras").val() + "/" + $("#e_siniestro").val(), function(data, status) {
                        if (status == "success") {
                            // data me da un siniestro
                        } else {
                            // informar del error
                        }
                    }, "json");
                }
                break;
            case "poliza":
                if ($("#aseguradoras").val() == -1) {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroPoliza/" + $("#e_poliza").val(), function(data, status) {
                        if (status == "success") {
                            alert(data.length);
                            // data me da una lista de siniestros
                        } else {
                            // informar del error
                        }
                    }, "json");
                } else {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroPolizaA/" + $("#aseguradoras").val() + "/" + $("#e_poliza").val(), function(data, status) {
                        if (status == "success") {
                            alert(data.length);
                            // data me da un siniestro
                        } else {
                            // informar del error
                        }
                    }, "json");
                }
                break;
            case "nombre":
                break;
            case "telefono":
                break;
            case "direccion":
        }
    });
});
