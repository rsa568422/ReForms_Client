$(document).ready(function() {
    
    var aseguradora, poliza, cliente, propiedad, cok, pok;
    
    function reiniciar() {
        $("#contenido").load("buscadorSiniestros.html", function(responseTxt, statusTxt) {
            if(statusTxt !== "success") {
                alert("Error: no se pudo cargar buscadorSiniestros.html");
            }
        });
    }
    
    function siguientePaso() {
        if (poliza.id == null) {
            poliza.cliente = cliente;
            poliza.propiedad = propiedad;
        }
        $.get("http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoPorAseguradora/" + aseguradora.id, function(data, status) {
            if (status == "success") {
                var i;
                for (i = 0; i < data.length; i++) {
                    $("#peritos").append("<option value='" + JSON.stringify(data[i]) + "'>" + data[i].nombre + " " + data[i].apellido1 + "</option>");
                }
            }
            $("#divDetalles").show();
        }, "json");
    }
    
    function siguientePasoPropiedad() {
        $("#n_propiedad_direccion").prop("readonly", true);
        $("#n_propiedad_numero").prop("readonly", true);
        $("#n_propiedad_piso").prop("readonly", true);
        $("#n_propiedad_cp").prop("readonly", true);
        $("#n_propiedad_buscar").hide();
        pok = true;
        if (cok) {
            siguientePaso();
        }
    }
    
    function concidenciasCliente(lc) {
        if (lc.length > 0) {
            alert(lc.length + " coincidencias, mostrar lista");
            cliente = lc[0];
            $("#n_cliente_nombre").prop("readonly", true);
            $("#n_cliente_apellido1").prop("readonly", true);
            $("#n_cliente_apellido2").prop("readonly", true);
            $("#n_cliente_telefono1").prop("readonly", true);
            $("#n_cliente_telefono2").prop("readonly", true);
            $("#n_cliente_tipo").prop("disabled", true);
            $("#n_cliente_buscar").hide();
            cok = true;
            if (pok) {
                siguientePaso();
            }
        } else if (confirm("No existen coincidencias, desea crear un nuevo cliente?")) {
            cliente = new Cliente();
            cliente.nombre = $("#n_cliente_nombre").val();
            cliente.apellido1 = $("#n_cliente_apellido1").val();
            if ($("#n_cliente_apellido2").val() != "") {
                cliente.apellido2 = $("#n_cliente_apellido2").val();
            }
            var telefono1 = $("#n_cliente_telefono1").val();
            var telefono2 = $("#n_cliente_telefono2").val();
            if (telefono1 == "" && telefono2 != "") {
                telefono1 = telefono2;
                telefono2 = null;
            }
            if (telefono1 == telefono2) {
                telefono2 = null;
            }
            cliente.telefono1 = telefono1;
            cliente.telefono2 = telefono2;
            cliente.tipo = $("#n_cliente_tipo").val();
            cliente.aseguradora = JSON.parse($("#aseguradoras").val());
            $("#n_cliente_nombre").prop("readonly", true);
            $("#n_cliente_apellido1").prop("readonly", true);
            $("#n_cliente_apellido2").prop("readonly", true);
            $("#n_cliente_telefono1").prop("readonly", true);
            $("#n_cliente_telefono2").prop("readonly", true);
            $("#n_cliente_tipo").prop("disabled", true);
            $("#n_cliente_buscar").hide();
            cok = true;
            if (pok) {
                siguientePaso();
            }
        } else {
            reiniciar();
        }
    }
    
    function concidenciasPropiedad(lp) {
        if (lp.length > 0) {
            alert(lp.length + " coincidencias, mostrar lista");
            propiedad = lp[0];
            siguientePasoPropiedad();
        } else if (confirm("No existen coincidencias, desea crear una nueva propiedad?")) {
            propiedad = new Propiedad();
            propiedad.direccion = $("#n_propiedad_direccion").val();
            propiedad.numero = $("#n_propiedad_numero").val();
            propiedad.piso = $("#n_propiedad_piso").val();
            var cp = $("#n_propiedad_cp").val();
            $.get("http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/" + cp, function(data, status) {
                if (data != null) {
                    propiedad.localidad = data;
                    siguientePasoPropiedad();
                } else {
                    $("#n_propiedad_buscar").hide();
                    $("#n_localidad_nombre").show();
                    $("#n_localidad_nombre_continuar").show();
                }
            }, "json");
        } else {
            reiniciar();
        }
    }
    
    $("#divPoliza").hide();
    $("#divDetalles").hide();
    
    $.get("http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras", function(data, status) {
        if (status == "success") {
            var i;
            for (i = 0; i < data.length; i++) {
                $("#aseguradoras").append("<option value='" + JSON.stringify(data[i]) + "'>" + data[i].nombre + "</option>");
            }
        }
    }, "json");
    
    $("#n_numero_siniestro_continuar").click(function() {
        aseguradora = JSON.parse($("#aseguradoras").val());
        $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestroA/" + aseguradora.id + "/" + $("#n_numero_siniestro").val(), function(data, status) {
            if (data != null) {
                alert("existe: " + data);
            } else {
                $("#n_numero_siniestro_continuar").hide();
                $("#aseguradoras").prop("disabled", true);
                $("#n_numero_siniestro").prop("readonly", true);
                $("#divPoliza").show();
                $("#divCliente").hide();
                $("#divPropiedad").hide();
            }
        }, "json");
    });
    
    $("#n_numero_poliza_continuar").click(function() {
        aseguradora = JSON.parse($("#aseguradoras").val());
        $("#n_numero_poliza_continuar").hide();
        $("#divCliente").show();
        $("#divPropiedad").show();
        $("#n_localidad_nombre").hide();
        $("#n_localidad_nombre_continuar").hide();
        $("#n_numero_poliza").prop("readonly", true);
        $.get("http://localhost:8080/ReForms_Provider/wr/poliza/buscarPolizaPorNumeroPolizaA/" + aseguradora.id + "/" + $("#n_numero_poliza").val(), function(data, status) {
            if (data != null) {
                poliza = data;
                cliente = data.cliente;
                propiedad = data.propiedad;
                $("#n_cliente_nombre").val(cliente.nombre);
                $("#n_cliente_apellido1").val(cliente.apellido1);
                $("#n_cliente_apellido2").val(cliente.apellido2);
                $("#n_cliente_telefono1").val(cliente.telefono1);
                $("#n_cliente_telefono2").val(cliente.telefono2);
                $("#n_cliente_tipo").val(cliente.tipo);
                $("#n_cliente_nombre").prop("readonly", true);
                $("#n_cliente_apellido1").prop("readonly", true);
                $("#n_cliente_apellido2").prop("readonly", true);
                $("#n_cliente_telefono1").prop("readonly", true);
                $("#n_cliente_telefono2").prop("readonly", true);
                $("#n_cliente_tipo").prop("disabled", true);
                $("#n_propiedad_direccion").val(propiedad.direccion);
                $("#n_propiedad_numero").val(propiedad.numero);
                $("#n_propiedad_piso").val(propiedad.piso);
                $("#n_propiedad_cp").val(propiedad.localidad.cp);
                $("#n_propiedad_direccion").prop("readonly", true);
                $("#n_propiedad_numero").prop("readonly", true);
                $("#n_propiedad_piso").prop("readonly", true);
                $("#n_propiedad_cp").prop("readonly", true);
                $("#n_cliente_buscar").hide();
                $("#n_propiedad_buscar").hide();
                cok = true;
                pok = true;
                siguientePaso();
            } else {
                poliza = new Poliza();
                poliza.numero = $("#n_numero_poliza").val();
            }
        }, "json");
    });
    
    $("#n_cliente_buscar").click(function() {
        aseguradora = JSON.parse($("#aseguradoras").val());
        var telefono1 = $("#n_cliente_telefono1").val();
        var telefono2 = $("#n_cliente_telefono2").val();
        if (telefono1 == "" && telefono2 != "") {
            telefono1 = telefono2;
            telefono2 = null;
        }
        if (telefono1 == telefono2) {
            telefono2 = null;
        }
        var parametros, lc;
        if (telefono1 != "") {
            parametros = aseguradora.id + "/" + telefono1 + "/" + $("#n_cliente_nombre").val()+ "/" + $("#n_cliente_apellido1").val()+ "/" + $("#n_cliente_apellido2").val();
            $.get("http://localhost:8080/ReForms_Provider/wr/cliente/buscarClientePorNombreMasTelefonoA/" + parametros, function(data1, status) {
                lc = data1 != null ? data1 : [];
                if (telefono2 != "") {
                    parametros = aseguradora.id + "/" + telefono2 + "/" + $("#n_cliente_nombre").val()+ "/" + $("#n_cliente_apellido1").val()+ "/" + $("#n_cliente_apellido2").val();
                    $.get("http://localhost:8080/ReForms_Provider/wr/cliente/buscarClientePorNombreMasTelefonoA/" + parametros, function(data2, status) {
                        if (data2 != null) {
                            var i;
                            for (i = 0; i < data2.length; i++) {
                                lc.push(data2[i]);
                            }
                        }
                        concidenciasCliente(lc);
                    }, "json");
                } else {
                    concidenciasCliente(lc);
                }
            }, "json");
        }
    });
    
    $("#n_propiedad_buscar").click(function() {
        aseguradora = JSON.parse($("#aseguradoras").val());
        var parametros;
        parametros = aseguradora.id + "/" + $("#n_propiedad_cp").val() + "/" + $("#n_propiedad_direccion").val()+ "/" + $("#n_propiedad_numero").val()+ "/" + $("#n_propiedad_piso").val();
        $.get("http://localhost:8080/ReForms_Provider/wr/propiedad/buscarPropiedadPorDireccionCompletaA/" + parametros, function(data1, status) {
            if (data1 != null) {
                concidenciasPropiedad(data1);
            } else {
                parametros = $("#n_propiedad_cp").val() + "/" + $("#n_propiedad_direccion").val()+ "/" + $("#n_propiedad_numero").val()+ "/" + $("#n_propiedad_piso").val();
                $.get("http://localhost:8080/ReForms_Provider/wr/propiedad/buscarPropiedadPorDireccionCompleta/" + parametros, function(data2, status) {
                    if (data2 != null) {
                        concidenciasPropiedad(data2);
                    } else {
                        concidenciasPropiedad([]);
                    }
                }, "json");
            }
        }, "json");
    });
    
    $("#n_localidad_nombre_continuar").click(function() {
        $("#n_localidad_nombre").hide();
        $("#n_localidad_nombre_continuar").hide();
        var l = new Localidad();
        l.cp = $("#n_propiedad_cp").val();
        l.nombre = $("#n_localidad_nombre").val();
        propiedad.localidad = l;
        siguientePasoPropiedad();
    });
    
    $("#n_siniestro_finalizar").click(function() {
        var o = new Recurso();
        o.nombre = $("#n_original_nombre").val();
        var s = new Siniestro();
        s.poliza = poliza;
        s.peritoOriginal = JSON.parse($("#peritos").val());
        s.original = o;
        s.numero = $("#n_numero_siniestro").val();
        s.fechaRegistro = "2018-09-17T00:00:00+02:00";
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/siniestro/registrarSiniestro',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(s),
            processData: false,
            success: function(data, textStatus, jQxhr){
                alert("creado");
                reiniciar();
            },
            error: function(jQxhr, textStatus, errorThrown){
                alert("Error: no se ha creado el siniestro");
                reiniciar();
            }
        });
    });
});
