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
    
    function cargarLista(datos) {
        if (datos != null) {
            $(".filaResultado").remove();
            var i;
            for (i = 0; i < datos.length; i++) {
                $("#resultado").append("<tr class='filaResultado'><td class='resultado_aseguradora'>" + datos[i].poliza.cliente.aseguradora.id + "</td><td class='resultado_numero_siniestro'>" + datos[i].numero + "</td><td>" + datos[i].fechaRegistro + "</td><td>" + datos[i].poliza.propiedad.direccion + "</td><td>" + datos[i].poliza.propiedad.numero + "</td><td>" + (datos[i].poliza.propiedad.piso ? datos[i].poliza.propiedad.piso : "") + "</td><td>" + datos[i].poliza.propiedad.localidad.nombre + "</td></tr>");
            }
            $(".filaResultado").dblclick(function() {
                sessionStorage.setItem("idaseguradora", $(this).find(".resultado_aseguradora").text());
                sessionStorage.setItem("nsiniestro", $(this).find(".resultado_numero_siniestro").text());
                $("#contenido").load("edicionSiniestro.html", function(responseTxt, statusTxt) {
                    if(statusTxt !== "success") {
                        alert("Error: no se pudo cargar edicionSiniestro.html");
                    }
                });
            });
            $("#resultado").show();
        } else {
            alert("siniestro no encontrado");
        }
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
    
    $("#aseguradoras").change(function() {
        configurarEntradas();
    });
    
    $("#busqueda").change(function() {
        configurarEntradas();
    });
    
    configurarEntradas();
    
    $("#buscar").click(function() {
        $("#resultado").hide();
        switch ($("#busqueda").val()) {
            case "siniestro":
                if ($("#aseguradoras").val() == -1) {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestro/" + $("#e_siniestro").val(), function(data, status) {
                        cargarLista(data);
                    }, "json");
                } else {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestroA/" + $("#aseguradoras").val() + "/" + $("#e_siniestro").val(), function(data, status) {
                        cargarLista(data);
                    }, "json");
                }
                break;
            case "poliza":
                if ($("#aseguradoras").val() == -1) {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroPoliza/" + $("#e_poliza").val(), function(data, status) {
                        cargarLista(data);
                    }, "json");
                } else {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroPolizaA/" + $("#aseguradoras").val() + "/" + $("#e_poliza").val(), function(data, status) {
                        cargarLista(data);
                    }, "json");
                }
                break;
            case "nombre":
                if ($("#aseguradoras").val() == -1) {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNombre/" + $("#e_nombre").val() + "/" + $("#e_apellido1").val() + "/"  + $("#e_apellido2").val(), function(data, status) {
                        cargarLista(data);
                    }, "json");
                } else {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNombreA/" + $("#aseguradoras").val() + "/" + $("#e_nombre").val() + "/" + $("#e_apellido1").val() + "/"  + $("#e_apellido2").val(), function(data, status) {
                        cargarLista(data);
                    }, "json");
                }
                break;
            case "telefono":
                if ($("#aseguradoras").val() == -1) {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorTelefono/" + $("#e_telefono").val(), function(data, status) {
                        cargarLista(data);
                    }, "json");
                } else {
                    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorTelefonoA/" + $("#aseguradoras").val() + "/" + $("#e_telefono").val(), function(data, status) {
                        cargarLista(data);
                    }, "json");
                }
                break;
            case "direccion":
                if ($("#aseguradoras").val() == -1) {
                    $.get("http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/" + $("#e_cp").val(), function(localidad, status) {
                        if (localidad != null) {
                            $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorDireccion/" + localidad.id + "/" + $("#e_direccion").val() + "/" + $("#e_numero").val() + "/"  + $("#e_piso").val(), function(data, status) {
                                cargarLista(data);
                            }, "json");
                        } else {
                            cargarLista(null);
                        }
                    }, "json");
                } else {
                    $.get("http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/" + $("#e_cp").val(), function(localidad, status) {
                        if (localidad != null) {
                            $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorDireccionA/" + $("#aseguradoras").val() + "/" + localidad.id + "/" + $("#e_direccion").val() + "/" + $("#e_numero").val() + "/"  + $("#e_piso").val(), function(data, status) {
                                cargarLista(data);
                            }, "json");
                        } else {
                            cargarLista(null);
                        }
                    }, "json");
                }
        }
    });
});
