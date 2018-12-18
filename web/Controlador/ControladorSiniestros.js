$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var colorBorde = $('#btn-siniestros').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        contenedor = $('#ventana').children('div[class="container-fluid"]'),
        aseguradoras = {
            'listaAseguradoras': [],
            'aseguradoraSeleccionada': localStorage.aseguradoraPredeterminada ? JSON.parse(localStorage.aseguradoraPredeterminada) : null,
            'siniestroSeleccionado': null
        },
        buscador = {
            'listaSiniestros': [],
            'totalSiniestros': 0,
            'siniestroSeleccionado': null,
            'parametros': {
                'estadoSeleccionado': '-1',
                'subestados': '0000',
                'informacionSeleccionada': '-1',
                'informacion': null
            }
        };
    
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').find('.modal-title').html(titulo);
        $('#alerta').find('.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function generarLogo(aseguradora) {
        return i = '<img class="logo" src="data:image/gif;base64,' + aseguradora.logo + '" width="480" height="360" alt="' + aseguradora.nombre + '"/>';
    }
    
    function telefono_valido(telefonoStr) {
        return /^\d{9}$/.test(telefonoStr);
    }
    
    function cp_valido(cpStr) {
        var patron = /^\d{5}$/;
        return patron.test(cpStr);
    }
    
    function establecer_ruta(pagina) {
        var recurso = 'http://localhost:8080/ReForms_Provider/wr/siniestro/',
            cuenta = 'http://localhost:8080/ReForms_Provider/wr/siniestro/',
            parametros = aseguradoras.aseguradoraSeleccionada != null ? aseguradoras.aseguradoraSeleccionada.id + '/' : '/';
        // establecer parametros comunes
        switch (buscador.parametros.estadoSeleccionado) {
            case '-1': // todos los estados
                parametros += '/';
                break;
            case '0': // abiertos
                parametros += '0/' + buscador.parametros.subestados;
                break;
            case '4': // cerrados
            case '5': // devuletos
            case '6': // facturados
            case '7': // cobrados
                parametros += buscador.parametros.estadoSeleccionado + '/';
                break;
        }
        // establecer recurso y parametros especificos
        switch (buscador.parametros.informacionSeleccionada) {
            case '-1': // sin filtro
                recurso += 'obtenerSiniestros/';
                cuenta += 'contarSiniestros/';
                break;
            case '0': // por numero de siniestro
                recurso += 'buscarSiniestroPorNumeroSiniestro/';
                cuenta += 'contarSiniestroPorNumeroSiniestro/';
                parametros += '/' + buscador.parametros.informacion;
                break;
            case '1': // por numero de poliza
                recurso += 'buscarSiniestroPorNumeroPoliza/';
                cuenta += 'contarSiniestroPorNumeroPoliza/';
                parametros += '/' + buscador.parametros.informacion;
                break;
            case '2': // por nombre
                recurso += 'buscarSiniestroPorNombre/';
                cuenta += 'contarSiniestroPorNombre/';
                parametros += '/' + buscador.parametros.informacion.nombre + '/' + buscador.parametros.informacion.apellido1 + '/' + buscador.parametros.informacion.apellido2;
                break;
            case '3': // por telefono
                recurso += 'buscarSiniestroPorTelefono/';
                cuenta += 'contarSiniestroPorTelefono/';
                parametros += '/' + buscador.parametros.informacion;
                break;
            case '4': // por direccion
                recurso += 'buscarSiniestroPorDireccion/';
                cuenta += 'contarSiniestroPorDireccion/';
                parametros += '/' + buscador.parametros.informacion.cp + '/' + buscador.parametros.informacion.direccion + '/' + buscador.parametros.informacion.numero + '/' + buscador.parametros.informacion.piso;
                break;
        }
        return {'recurso': recurso + pagina + '/' + parametros, 'cuenta': cuenta + parametros};
    }
    
    function mostrar_aseguradoras(div) {
        var i, logo;
        for (i = 0; i < aseguradoras.listaAseguradoras.length; i++) {
            logo = generarLogo(aseguradoras.listaAseguradoras[i]);
            if (aseguradoras.aseguradoraSeleccionada != null && aseguradoras.aseguradoraSeleccionada.id == aseguradoras.listaAseguradoras[i].id) {
                div.children('.seleccionada').removeClass('seleccionada');
                logo = logo.replace('logo', "logo seleccionada");
            }
            div.append(logo);
        }
        div.children('.logo').css("border-color", colorBorde).click(logo_click);
    }
    
    function actualizar_tabla_siniestros(tbody, pagina) {
        $.get(establecer_ruta(pagina).recurso, function(data, status) {
            if (status == "success") {
                buscador.listaSiniestros = data;
                mostrar_tabla_siniestros(tbody, buscador.listaSiniestros);
            } else {
                alert('fallo en proveedor');
            }
        }, 'json');
    }
    
    function mostrar_tabla_siniestros(tbody, siniestros) {
        var i, aseguradora, siniestro, poliza, registro, estado;
        tbody.children('.siniestro').remove();
        if (siniestros.length > 0) {
            for (i = 0; i < siniestros.length; i++) {
                aseguradora = '<td>' + siniestros[i].poliza.cliente.aseguradora.nombre + '</td>';
                siniestro = '<td>' + siniestros[i].numero + '</td>';
                poliza = '<td>' + siniestros[i].poliza.numero + '</td>';
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
                tbody.append('<tr class="siniestro">' + aseguradora + siniestro + poliza + registro + estado + '</tr>');
            }
        } else {
            tbody.append('<tr class="siniestro"><td colspan="5"><h3>Sin resultados</h3></td></tr>');
        }
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
            tfoot.find('a.pagina').css('background-color', sinColor).click(siniestros_pagina_click);
            tfoot.find('a.pagina').eq(1).css('background-color', colorBorde);
            tfoot.find('span').css('color', 'black');
        }
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function logo_click() {
        if ($(this).index() == 0) {
            aseguradoras.aseguradoraSeleccionada = null;
        } else {
            aseguradoras.aseguradoraSeleccionada = aseguradoras.listaAseguradoras[$(this).index() - 1];
        }
        buscador.parametros.estadoSeleccionado = '-1';
        buscador.parametros.subestados = '0000';
        buscador.parametros.informacionSeleccionada = '-1';
        buscador.parametros.informacion = null;
        $(this).siblings(".seleccionada").removeClass("seleccionada");
        $(this).addClass("seleccionada");
        contenedor.children('.buscador').load('Html/buscador.html', cargar_buscador);
    }
    
    function btn_buscar_click() {
        var principal = $(this).parent('.buscar').parent('.principal'),
            estado = principal.find('select[name="estado"]'),
            informacion = principal.find('select[name="informacion"]'),
            entradas = principal.siblings('.entradas'),
            entradas_informacion = entradas.children('.entradas-informacion'),
            table = principal.parent('div').parent('.busqueda').siblings('.resultados').children('div.col-12').children('.tabla').children('table'),
            ruta;
        buscador.parametros.estadoSeleccionado = estado.val();
        if (buscador.parametros.estadoSeleccionado == '0') {
            buscador.parametros.subestados = (entradas.find('#check-pendientes').prop('checked') ? '1' : '0') +
                                             (entradas.find('#check-en-proceso').prop('checked') ? '1' : '0') +
                                             (entradas.find('#check-finalizados').prop('checked') ? '1' : '0') +
                                             (entradas.find('#check-parcialmente-finalizados').prop('checked') ? '1' : '0');
        } else {
            buscador.parametros.subestados = '0000';
        }
        buscador.parametros.informacionSeleccionada = informacion.val();
        switch (buscador.parametros.informacionSeleccionada) {
            case '0':
                buscador.parametros.informacion = entradas_informacion.find('input[name="siniestro"]').val();
                break;
            case '1':
                buscador.parametros.informacion = entradas_informacion.find('input[name="poliza"]').val();
                break;
            case '2':
                buscador.parametros.informacion = {
                    'nombre': entradas_informacion.find('input[name="nombre"]').val(),
                    'apellido1': entradas_informacion.find('input[name="apellido1"]').val(),
                    'apellido2': entradas_informacion.find('input[name="apellido2"]').val()
                }
                break;
            case '3':
                buscador.parametros.informacion = entradas_informacion.find('input[name="telefono"]').val();
                break;
            case '4':
                buscador.parametros.informacion = {
                    'direccion': entradas_informacion.find('input[name="direccion"]').val(),
                    'numero': entradas_informacion.find('input[name="numero"]').val(),
                    'piso': entradas_informacion.find('input[name="piso"]').val(),
                    'cp': entradas_informacion.find('input[name="cp"]').val()
                }
                break;
            default:
                buscador.parametros.informacion = null;
        }
        ruta = establecer_ruta(0);
        $.get(ruta.cuenta, function(data, status) {
            if (status == "success") {
                buscador.totalSiniestros = new Number(data);
                $.get(ruta.recurso, function(data, status) {
                    if (status == "success") {
                        buscador.listaSiniestros = data;
                    } else {
                        buscador.listaSiniestros = [];
                    }
                    mostrar_siniestros(table, buscador.listaSiniestros, buscador.totalSiniestros);
                }, 'json');
            } else {
                alert('fallo en proveedor');
            }
        }, 'json');
        alert('btn_buscar_click()\nrecurso:\n' + ruta.recurso + '\ncuenta:\n' + ruta.cuenta);
    }
    
    function siniestros_pagina_click() {
        var li = $(this).parent('li'),
            lis = li.parent('ul').children('li'),
            tbody = li.parent('ul').parent('td').parent('tr').parent('tfoot').siblings('tbody');
        li.siblings('li').children('a').css('background-color', sinColor);
        $(this).css('background-color', colorBorde);
        if (li.index() == 0) {
            lis.eq(1).children('a').click();
        } else if (li.index() == lis.length - 1) {
            lis.eq(lis.length - 2).children('a').click();
        } else {
            actualizar_tabla_siniestros(tbody, li.index() - 1);
        }  
    }
    
    function buscador_estado_change() {
        var entradas_estado = $(this).parent('div').parent('.principal').siblings('.entradas').children('.entradas-estado');
        switch ($(this).val()) {
            case '0':
                entradas_estado.find('input[type="checkbox"]').prop('checked', true);
                entradas_estado.children('.row').show();
                break;
            default:
                entradas_estado.children('.row').hide();
        }
    }
    
    function buscador_informacion_change() {
        var entrada, entradas_informacion = $(this).parent('div').parent('.principal').siblings('.entradas').children('.entradas-informacion');
        entradas_informacion.children('.entrada').remove();
        entradas_informacion.show();
        switch ($(this).val()) {
            case '0':
                entrada =   '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">nº siniestro</span></div>' +
                                '<input name="siniestro" class="form-control" type="text" maxlength="16" required placeholder="nº siniestro *"/>' +
                            '</div>';
                entradas_informacion.append(entrada);
                break;
            case '1':
                entrada =   '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">nº poliza</span></div>' +
                                '<input name="poliza" class="form-control" type="text" maxlength="10" required placeholder="nº poliza *"/>' +
                            '</div>';
                entradas_informacion.append(entrada);
                break;
            case '2':
                entrada =   '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">nombre</span></div>' +
                                '<input name="nombre" class="form-control" type="text" maxlength="50" required placeholder="nombre *"/>' +
                            '</div>' +
                            '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">apellidos</span></div>' +
                                '<input name="apellido1" class="form-control" type="text" maxlength="50" required placeholder="primer apellido *"/>' +
                                '<input name="apellido2" class="form-control" type="text" maxlength="50" placeholder="segundo apellido"/>' +
                            '</div>';
                entradas_informacion.append(entrada);
                break;
            case '3':
                entrada =   '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">telefono</span></div>' +
                                '<input name="telefono" class="form-control" type="text" maxlength="9" required placeholder="telefono *"/>' +
                            '</div>';
                entradas_informacion.append(entrada);
                break;
            case '4':
                entrada =   '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">direccion</span></div>' +
                                '<input name="direccion" class="form-control" type="text" maxlength="250" required placeholder="direccion *"/>' +
                                '<input name="numero" class="form-control" type="number" step=1 min=1 required placeholder="numero *"/>' +
                            '</div>' +
                            '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">piso</span></div>' +
                                '<input name="piso" class="form-control" type="text" maxlength="20" placeholder="piso"/>' +
                            '</div>' +
                            '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">c.p.</span></div>' +
                                '<input name="cp" class="form-control" type="text" maxlength="5" placeholder="c.p. *"/>' +
                            '</div>';
                entradas_informacion.append(entrada);
                break;
            default:
                entradas_informacion.hide();
        }
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_buscador(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var contenedor = $(this).children('.container-fluid'),
                busqueda = contenedor.children('.busqueda').children('.col-12'),
                principal = busqueda.children('.principal'),
                entradas = busqueda.children('.entradas'),
                tabla = contenedor.children('.resultados').children('.col-12').children('.tabla').children('table'),
                ruta = establecer_ruta(0);
            $.get(ruta.cuenta, function(data, status) {
                if (status == "success") {
                    buscador.totalSiniestros = new Number(data);
                    $.get(ruta.recurso, function(data, status) {
                        if (status == "success") {
                            buscador.listaSiniestros = data;
                        } else {
                            buscador.listaSiniestros = [];
                        }
                        mostrar_siniestros(tabla, buscador.listaSiniestros, buscador.totalSiniestros);
                    }, 'json');
                } else {
                    alert('fallo en proveedor');
                }
            }, 'json');     
            principal.find('select[name="estado"]').change(buscador_estado_change);
            principal.find('select[name="informacion"]').change(buscador_informacion_change);
            principal.find('.btn-buscar').click(btn_buscar_click);
            entradas.find('input[type="checkbox"]').prop('checked', true);
            tabla.children('thead').css('background-color', colorBorde);
            entradas.children('.entradas-estado').children('.row').hide();
            entradas.children('.entradas-informacion').hide();
        } else {
            alerta('Error 404', 'no se pudo cargar buscador.html');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    $.get('http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras', function(data, status) {
        if (status == "success") {
            aseguradoras.listaAseguradoras = data;
            mostrar_aseguradoras(contenedor.children('.aseguradoras'));
        }
    }, 'json');
    contenedor.children('.buscador').load('Html/buscador.html', cargar_buscador);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $('#ventana').css('border-color', colorBorde);
    $('#ventana').css('background-color', colorFondo);
    contenedor.children('.aseguradoras').css('border-color', colorBorde);
    contenedor.children('.buscador').css('border-color', colorBorde);
});