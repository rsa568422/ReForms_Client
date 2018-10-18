$(document).ready(function() {
    
    $("#n_panel_poliza").hide();
    
    $.get("http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras", function(data, status) {
        if (status == "success") {
            var i;
            for (i = 0; i < data.length; i++) {
                $("#aseguradoras").append("<option value='" + data[i].id + "'>" + data[i].nombre + "</option>");
            }
        }
    }, "json");
    
    $("#n_paso1_ok").click(function() {
        $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestroA/" + $("#aseguradoras").val() + "/" + $("#n_numero_siniestro").val(), function(data, status) {
            if (data != null) {
                alert("existe: " + data);
            } else {
                $("#n_paso1_ok").hide();
                $("#n_panel_poliza").show();
                $(".n_poliza_detalles").hide();
                $("#n_numero_siniestro").prop("readonly", true);
            }
        }, "json");
    });
    
    $("#n_paso2_buscar").click(function() {
        $(".n_poliza_detalles").show();
        $("#n_paso2_buscar").hide();
        $("#n_numero_poliza").prop("readonly", true);
        $.get("http://localhost:8080/ReForms_Provider/wr/poliza/buscarPolizaPorNumeroPolizaA/" + $("#aseguradoras").val() + "/" + $("#n_numero_poliza").val(), function(data, status) {
            if (data != null) {
                $("#n_cliente_nombre").val(data.cliente.nombre);
                $("#n_cliente_apellido1").val(data.cliente.apellido1);
                $("#n_cliente_apellido2").val(data.cliente.apellido2);
                $("#n_cliente_telefono1").val(data.cliente.telefono1);
                $("#n_cliente_telefono2").val(data.cliente.telefono2);
                $("#n_cliente_tipo").val(data.cliente.tipo);
                $("#n_cliente_nombre").prop("readonly", true);
                $("#n_cliente_apellido1").prop("readonly", true);
                $("#n_cliente_apellido2").prop("readonly", true);
                $("#n_cliente_telefono1").prop("readonly", true);
                $("#n_cliente_telefono2").prop("readonly", true);
                $("#n_cliente_tipo").prop("disabled", true);
            } else {
                alert("continuar...");
            }
        }, "json");
    });
    
});
