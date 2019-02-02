$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-siniestros').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        contenedor = $('.marco-poliza'),
        poliza = sessionStorage.poliza ? JSON.parse(sessionStorage.poliza) : null,
        vuelta = sessionStorage.vuelta ? JSON.parse(sessionStorage.vuelta) : null;

    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-header').children('.modal-title').html(titulo);
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function generarLogo(aseguradora) {
        return i = '<img class="logo" src="data:image/gif;base64,' + aseguradora.logo + '" width="480" height="360" alt="' + aseguradora.nombre + '"/>';
    }
    
    function generarMapa(lat, long) {
        var funcion = '<script>function cargarMapa() { var propiedades = { center: new google.maps.LatLng(' + lat + ', ' + long + '), zoom: 18 }, mapa = new google.maps.Map(document.getElementById("googleMap"), propiedades), marcador = new google.maps.Marker({position: propiedades.center}); marcador.setMap(mapa); }</script>',
            script = '<script src="https://maps.googleapis.com/maps/api/js?key=' + googleKey + '&callback=cargarMapa"></script>',
            mapa  = '<div id="googleMap" style="width:100%;height:400px;"></div>';
        return '<div class="mapaGoogle">' + funcion + script + mapa + '</div>';
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function historial_click() {
        sessionStorage.setItem('poliza', JSON.stringify(poliza));
        sessionStorage.setItem('vuelta', JSON.stringify(vuelta));
        $('#contenido').load('Html/historial.html', cargar_historial);
    }
    
    function edicion_click() {
        sessionStorage.setItem('poliza', JSON.stringify(poliza));
        sessionStorage.setItem('vuelta', JSON.stringify(vuelta));
        $('#contenido').load('Html/editarPoliza.html', cargar_editar_poliza);
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_historial(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar historial.html');
            sessionStorage.removeItem('poliza');
            sessionStorage.removeItem('vuelta');
        }
    }
    
    function cargar_editar_poliza(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar editarPoliza.html');
            sessionStorage.removeItem('poliza');
            sessionStorage.removeItem('vuelta');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    if (poliza != null) {
        var strAux;
        sessionStorage.removeItem('poliza');
        sessionStorage.removeItem('vuelta');
        contenedor.find('button[name="historial"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(historial_click);
        contenedor.find('button[name="edicion"]').click(edicion_click);
        contenedor.find('div.aseguradora').append(generarLogo(poliza.cliente.aseguradora));
        contenedor.find('input[name="poliza_numero"]').val(poliza.numero);
        switch (poliza.cliente.tipo) {
            case 0: strAux = 'normal'; break;
            case 1: strAux = 'preferente'; break;
            case 2: strAux = 'VIP'; break;
            default: strAux = '';
        }
        contenedor.find('input[name="poliza_cliente_tipo"]').val(strAux);
        strAux = poliza.cliente.nombre + ' ' + poliza.cliente.apellido1;
        if (poliza.cliente.apellido2 && poliza.cliente.apellido2 != null && poliza.cliente.apellido2 != '') {
            strAux += ' ' + poliza.cliente.apellido2;
        }
        contenedor.find('input[name="poliza_cliente_nombre"]').val(strAux);
        strAux = poliza.cliente.telefono1;
        if (poliza.cliente.telefono2 && poliza.cliente.telefono2 != null && poliza.cliente.telefono2 != '') {
            strAux += ' / ' + poliza.cliente.telefono2;
        }
        contenedor.find('input[name="poliza_cliente_telefono"]').val(strAux);
        if (poliza.cliente.observaciones && poliza.cliente.observaciones != null && poliza.cliente.observaciones != '') {
            contenedor.find('textarea[name="poliza_cliente_observaciones"]').val(poliza.cliente.observaciones);
        } else {
            contenedor.find('textarea[name="poliza_cliente_observaciones"]').parent('div.form-group').parent('div.col-12').parent('div.row').hide();
        }
        strAux = poliza.propiedad.localidad.nombre + ' [' + poliza.propiedad.localidad.cp + ']';
        contenedor.find('input[name="poliza_propiedad_localidad"]').val(strAux);
        strAux = poliza.propiedad.direccion + ', ' + poliza.propiedad.numero;
        contenedor.find('input[name="poliza_propiedad_direccion"]').val(strAux);
        if (poliza.propiedad.piso && poliza.propiedad.piso != null && poliza.propiedad.piso != '') {
            contenedor.find('input[name="poliza_propiedad_piso"]').val(poliza.propiedad.piso);
        } else {
            contenedor.find('input[name="poliza_propiedad_piso"]').parent('div.form-group').parent('div.col-12').parent('div.row').hide();
        }
        if (poliza.propiedad.observaciones && poliza.propiedad.observaciones != null && poliza.propiedad.observaciones != '') {
            contenedor.find('textarea[name="poliza_propiedad_observaciones"]').val(poliza.propiedad.observaciones);
        } else {
            contenedor.find('textarea[name="poliza_propiedad_observaciones"]').parent('div.form-group').parent('div.col-12').parent('div.row').hide();
        }
        contenedor.children('div.row:last-child').children('div.mapa').append(generarMapa(poliza.propiedad.geolat, poliza.propiedad.geolong));
    }
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    contenedor.css('border-color', colorBorde);
    contenedor.find('div.aseguradora').children('.logo').css("border-color", colorBorde);
});
