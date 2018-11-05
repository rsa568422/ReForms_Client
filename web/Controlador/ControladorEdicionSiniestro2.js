$(document).ready(function() {
    
    var siniestro, tareas, gremios, trabajos, multiservicios, participantes;
    
    function mostrarDatosSiniestro() {
        //siniestro
        $("#e_siniestro_aseguradora").val(siniestro.peritoOriginal.aseguradora.nombre);
        $("#e_siniestro_siniestro").val(siniestro.numero);
        $("#e_siniestro_poliza").val(siniestro.poliza.numero);
        $("#e_siniestro_albaran").val(siniestro.albaran);
        $("#e_siniestro_perito").val(siniestro.peritoOriginal.nombre + " " + siniestro.peritoOriginal.apellido1);
        $("#e_siniestro_original").val(siniestro.original.nombre);
        $("#e_siniestro_fechaRegistro").val(siniestro.fechaRegistro);
        $("#e_siniestro_observaciones").val(siniestro.observaciones);
        //afectado
        if (siniestro.afectado && siniestro.afectado != null) {
            $("#e_afectado_direccion").val(siniestro.afectado.direccion);
            $("#e_afectado_numero").val(siniestro.afectado.numero);
            $("#e_afectado_piso").val(siniestro.afectado.piso);
            $("#e_afectado_observaciones").val(siniestro.afectado.observaciones);
        } else {
            $("#info_afectado").hide();
        }
        //cliente
        $("#e_cliente_nombre").val(siniestro.poliza.cliente.nombre);
        $("#e_cliente_apellido1").val(siniestro.poliza.cliente.apellido1);
        $("#e_cliente_apellido2").val(siniestro.poliza.cliente.apellido2);
        $("#e_cliente_telefono1").val(siniestro.poliza.cliente.telefono1);
        $("#e_cliente_telefono2").val(siniestro.poliza.cliente.telefono2);
        switch (siniestro.poliza.cliente.tipo) {
            case 0:
                $("#e_cliente_tipo").val("Normal");
                break;
            case 1:
                $("#e_cliente_tipo").val("Preferente");
                break;
            case 2:
                $("#e_cliente_tipo").val("VIP");
        }
        $("#e_cliente_observaciones").val(siniestro.poliza.cliente.observaciones);
        //propiedad
        $("#e_propiedad_direccion").val(siniestro.poliza.propiedad.direccion);
        $("#e_propiedad_numero").val(siniestro.poliza.propiedad.numero);
        $("#e_propiedad_piso").val(siniestro.poliza.propiedad.piso);
        $("#e_propiedad_localidad").val(siniestro.poliza.propiedad.localidad.nombre);
        $("#e_propiedad_cp").val(siniestro.poliza.propiedad.localidad.cp);
        $("#e_propiedad_observaciones").val(siniestro.poliza.propiedad.observaciones);
        //tareas
        if (tareas != null && tareas.length > 0) {
            var i;
            for (i = 0; i < tareas.length; i++) {
                var m, e;
                switch (tareas[i].trabajo.medida) {
                    case 0: m = "uds"; break;
                    case 1: m = "m"; break;
                    case 2: m = "m2"; break;
                    case 3: m = "m3"; break;
                }
                switch (tareas[i].estado) {
                    case 0: e = "pendiente"; break;
                    case 1: e = "en proceso"; break;
                    case 2: e = "finalizada"; break;
                    case 3: e = "anulada"; break;
                }
                $("#e_tabla_tareas").append("<tr class='filaTareas'><td>" + tareas[i].trabajo.gremio.nombre + "</td><td>" + tareas[i].trabajo.codigo + "</td><td>" + tareas[i].trabajo.descripcion + "</td><td>" + e + "</td><td>" + tareas[i].cantidad + "</td><td>" + m + "</td><td>" + tareas[i].trabajo.dificultad + "</td></tr>");
            }
        }
        //contraer detalles
        $(".ocultable").hide();
    }
    
    function cargarTrabajos() {
        $(".opcion_trabajo").remove();
        $.get("http://localhost:8080/ReForms_Provider/wr/trabajo/buscarTrabajoPorAseguradoraGremio/" + siniestro.peritoOriginal.aseguradora.id + "/" + $("#e_tarea_gremio").val(), function(data, status) {
            trabajos = data;
            var i;
            for (i = 0; i < trabajos.length; i++) {
                $("#e_tarea_trabajo").append("<option class='opcion_trabajo' value=" + trabajos[i].id + ">" + trabajos[i].codigo + " - " + trabajos[i].descripcion + "</option>");
            }
        }, "json");
    }
    
    $(".pulsable").click(function() {
        $(this).parent().children(".ocultable").toggle();
    });
    
    $("#e_descargar").click(function() {
        $(this).prop("download", siniestro.original.nombre);
        $(this).prop("href", "data:text/plain;base64," + siniestro.original.fichero);
    });
    
    $("#e_tabla_tareas_nueva").click(function() {
        $(this).hide();
        $("#e_nueva_tarea").show();
    });
    
    $("#e_tarea_gremio").change(function() {
       cargarTrabajos();
    });
    
    $("#e_tabla_tareas_aceptar").click(function() {
        var t = new Tarea();
        t.siniestro = siniestro;
        var i;
        for (i = 0; i < trabajos.length; i++) {
            if ($("#e_tarea_trabajo").val() == trabajos[i].id) {
                t.trabajo = trabajos[i];
            }
        }
        t.cantidad = $("#e_tarea_cantidad").val() == "" ? 0 : $("#e_tarea_cantidad").val();
        t.observaciones = $("#e_tarea_observaciones").val() == "" ? null : $("#e_tarea_observaciones").val();
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/tarea/agregarTarea',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(t),
            processData: false,
            success: function(data, textStatus, jQxhr){
                alert("creada");
                if (tareas != null) {
                    tareas.push(t);
                } else {
                    tareas = [t];
                }
                var m, e;
                switch (t.trabajo.medida) {
                    case 0: m = "uds"; break;
                    case 1: m = "m"; break;
                    case 2: m = "m2"; break;
                    case 3: m = "m3"; break;
                }
                switch (t.estado) {
                    case 0: e = "pendiente"; break;
                    case 1: e = "en proceso"; break;
                    case 2: e = "finalizada"; break;
                    case 3: e = "anulada"; break;
                }
                $("#e_tabla_tareas").append("<tr class='filaTareas'><td>" + t.trabajo.gremio.nombre + "</td><td>" + t.trabajo.codigo + "</td><td>" + t.trabajo.descripcion + "</td><td>" + e + "</td><td>" + t.cantidad + "</td><td>" + m + "</td><td>" + t.trabajo.dificultad + "</td></tr>");
                $("#e_tabla_tareas_cancelar").click();
            },
            error: function(jQxhr, textStatus, errorThrown){
                alert("Error: no se ha creado la tarea");
            }
        });
    });
    
    $("#e_tabla_tareas_cancelar").click(function() {
        $("#e_nueva_tarea").hide();
        $("#e_tabla_tareas_nueva").show();
    });
    
    $("#e_tabla_participantes_nuevo").click(function() {
        $(this).hide();
        $("#e_nuevo_participante").show();
    });
    
    $("#e_tabla_participantes_aceptar").click(function() {
        var p = new Participante();
        p.siniestro = siniestro;
        p.multiservicios = JSON.parse($("#e_multiservicios").val());
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/participante/agregarParticipante',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(p),
            processData: false,
            success: function(data, textStatus, jQxhr){
                alert("creado");
                $("#e_tabla_participantes").append("<tr class='filaParticipantes'><td>" + p.multiservicios.nombre + "</td></tr>");
                $("#e_tabla_participantes_cancelar").click();
            },
            error: function(jQxhr, textStatus, errorThrown){
                alert("Error: no se ha creado el participante");
            }
        });
    });
    
    $("#e_tabla_participantes_cancelar").click(function() {
        $("#e_nuevo_participante").hide();
        $("#e_tabla_participantes_nuevo").show();
    });
    
    $("#e_nueva_tarea").hide();
    $("#e_nuevo_participante").hide();
    
    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestroA/" + sessionStorage.idaseguradora + "/" + sessionStorage.nsiniestro, function(data1, status) {
        siniestro = data1[0];
        siniestro.fechaRegistro = siniestro.fechaRegistro.slice(0, siniestro.fechaRegistro.indexOf("T"));
        $.get("http://localhost:8080/ReForms_Provider/wr/tarea/buscarTareaPorSiniestro/" + siniestro.id, function(data2, status) {
            tareas = data2;
            mostrarDatosSiniestro();
        }, "json");
        $.get("http://localhost:8080/ReForms_Provider/wr/gremio/obtenerGremios/", function(data3, status) {
            gremios = data3;
            if (gremios != null && gremios.length > 0) {
                var i;
                for (i = 0; i < gremios.length; i++) {
                    $("#e_tarea_gremio").append("<option value=" + gremios[i].id + ">" + gremios[i].nombre + "</option>");
                }
                cargarTrabajos();
            }
        }, "json");
        $.get("http://localhost:8080/ReForms_Provider/wr/participante/buscarParticipantePorSiniestro/" + siniestro.id, function(data4, status) {
            participantes = data4;
            if (participantes != null && participantes.length > 0) {
                var i;
                for (i = 0; i < participantes.length; i++) {
                    $("#e_tabla_participantes").append("<tr class='filaParticipantes'><td>" + participantes[i].multiservicios.nombre + "</td></tr>");
                }
            }
        }, "json");
    }, "json");
    
    $.get("http://localhost:8080/ReForms_Provider/wr/multiservicios/obtenerMultiservicios/", function(data, status) {
        multiservicios = data != null ? data : [];
        var i;
        for (i = 0; i < multiservicios.length; i++) {
            var m = multiservicios[i];
            $("#e_multiservicios").append("<option class='opcion_multiservicios' value=" + JSON.stringify(m) + ">" + m.nombre + "</option>");
        }
    }, "json");
});