$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var colorBorde = $('#btn-siniestros').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        contenedor = $('#ventana').children('div[class="container-fluid"]'),
        tabla = contenedor.find('.tabla').children('table.table'),
        poliza = JSON.parse(sessionStorage.poliza), strAux,
        vuelta = sessionStorage.vuelta ? JSON.parse(sessionStorage.vuelta) : null,
        siniestros = {
            'totalSiniestros': 0,
            'listaSiniestros': []
        };

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
    
    function mostrar_tabla_siniestros(tbody, siniestros) {
        var i, aseguradora, siniestro, poliza, registro, estado;
        tbody.children('.siniestro').remove();
        tbody.children('.siniestro-detalles').remove();
        if (siniestros.length > 0) {
            for (i = 0; i < siniestros.length; i++) {
                siniestro = '<td>' + siniestros[i].numero + '</td>';
                registro = '<td>' + siniestros[i].fechaRegistro.slice(0, siniestros[i].fechaRegistro.indexOf('T')) + '</td>';
                switch (siniestros[i].estado) {
                    case 0: estado = '<td>pendiente</td>'; break;
                    case 1: estado = '<td>en proceso</td>'; break;
                    case 2: estado = '<td>finalizado</td>'; break;
                    case 3: estado = '<td>parcialmente finalizado</td>'; break;
                    case 4: estado = '<td>cerrado</td>'; break;
                    case 5: estado = '<td>devuleto</td>'; break;
                    case 6: estado = '<td>facturado</td>'; break;
                    case 7: estado = '<td>cobrado</td>'; break;
                    default: estado = '<td></td>';
                }
                tbody.append('<tr class="siniestro">' + siniestro + registro + estado + '</tr>');
            }
            tbody.children('.siniestro').dblclick(siniestro_dblclick);
        } else {
            tbody.append('<tr class="siniestro"><td colspan="5"><h3>Sin resultados</h3></td></tr>');
        }
    }
    
    function actualizar_tabla_siniestros(tbody, pagina) {
        $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroPoliza/' + pagina + '/' + poliza.cliente.aseguradora.id + '///' + poliza.numero, function(data, status) {
            if (status == 'success') {
                siniestros.listaSiniestros = data;
                mostrar_tabla_siniestros(tbody, siniestros.listaSiniestros);
            } else {
                alert('fallo en proveedor');
            }
        }, 'json');
    }
    
    function mostrar_siniestros(table, siniestros, total) {
        var tbody = table.children('tbody'),
            tfoot = table.children('tfoot');
        mostrar_tabla_siniestros(tbody, siniestros);
        tfoot.children('tr').remove();
        if (total > 10) {
            var i, paginas = ((total - (total%10)) / 10) + 1,
                pie = '<tr><td colspan="5"><ul class="pagination"><li class="page-item"><a class="pagina page-link" href="#"><span><</span></a></li>';
            pie += '<li class="page-item"><a class="pagina page-link" href="#"><span>' + 1 + '</span></a></li>';
            for (i = 2; i <= paginas; i++) {
                
                pie += '<li class="page-item"><a class="pagina page-link" href="#"><span>' + i + '</span></a></li>';
            }
            pie += '<li class="page-item"><a class="pagina page-link" href="#"><span>></span></a></li></ul></td></tr>';
            tfoot.append(pie);
            tfoot.find('a.pagina').css({'border-color':colorBorde, 'background-color':colorFondo}).click(siniestros_pagina_click);
            tfoot.find('a.pagina').eq(1).css('background-color', colorBorde);
            tfoot.find('span').css('color', 'black');
        }
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function volver_click() {
        if (vuelta != null) {
            sessionStorage.setItem('siniestro', JSON.stringify(vuelta));
            $('#contenido').load('Html/siniestro.html', cargar_siniestro);
        } else {
            $('#btn-siniestros').click();
        }
    }
    
    function siniestro_dblclick() {
        sessionStorage.setItem('siniestro', JSON.stringify(siniestros.listaSiniestros[$(this).index()]));
        $('#contenido').load('Html/siniestro.html', cargar_siniestro);
    }
    
    function siniestros_pagina_click() {
        var li = $(this).parent('li'),
            lis = li.parent('ul').children('li'),
            tbody = li.parent('ul').parent('td').parent('tr').parent('tfoot').siblings('tbody');
        li.siblings('li').children('a').css('background-color', colorFondo);
        $(this).css('background-color', colorBorde);
        if (li.index() == 0) {
            lis.eq(1).children('a').click();
        } else if (li.index() == lis.length - 1) {
            lis.eq(lis.length - 2).children('a').click();
        } else {
            actualizar_tabla_siniestros(tbody, li.index() - 1);
        }  
    }
    
    // Funciones para cargar paginas y controlar respuestas del proveedor
    // ====================================================================== //
    function cargar_siniestro(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar algo.html');
            sessionStorage.removeItem('siniestro');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/contarSiniestroPorNumeroPoliza/' + poliza.cliente.aseguradora.id + '///' + poliza.numero, function(data, status) {
        if (status == 'success') {
            siniestros.totalSiniestros = new Number(data);
            $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroPoliza/0/' + poliza.cliente.aseguradora.id + '///' + poliza.numero, function(data, status) {
                if (status == 'success') {
                    siniestros.listaSiniestros = data;
                }
                mostrar_siniestros(tabla, siniestros.listaSiniestros, siniestros.totalSiniestros);
            }, 'json');
        } else {
            alert('fallo en el proveedor');
        }
    }, 'text');
    sessionStorage.removeItem('poliza');
    sessionStorage.removeItem('vuelta');
    contenedor.find('button[name="volver"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(volver_click);
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
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $('#ventana').css('border-color', colorBorde);
    $('#ventana').css('background-color', colorFondo);
    contenedor.find('div.aseguradora').children('.logo').css("border-color", colorBorde);
    tabla.children('thead').css('background-color', colorBorde);
});