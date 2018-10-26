$(document).ready(function() {
    
    var siniestro;
    
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
        if (siniestro.afectado) {
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
    }
    
    $.get("http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestroA/" + sessionStorage.idaseguradora + "/" + sessionStorage.nsiniestro, function(data, status) {
        siniestro = data[0];
        mostrarDatosSiniestro();
    }, "json");
    
    $(".pulsable").click(function() {
        $(this).parent().find(".ocultable").toggle();
        if (!siniestro.afectado) {
            $("#info_afectado").hide();
        }
    });
});