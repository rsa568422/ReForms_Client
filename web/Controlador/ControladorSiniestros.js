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
                'subestados': null,
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
    
    function dni_valido(dniStr) {
        var patronN = /^\d{8}[a-zA-Z]$/,
            patronE = /^[a-zA-Z]\d{7}[a-zA-Z]$/;
        return patronN.test(dniStr) || patronE.test(dniStr);
    }
    
    function cp_valido(cpStr) {
        var patron = /^\d{5}$/;
        return patron.test(cpStr);
    }
    
    function testValidacion(v) {
        var x, test = true;
        for (x in v) {
            if (typeof v[x] == 'object') {
                test &= testValidacion(v[x]);
            } else {
                test &= v[x];
            }
        }
        return test;
    }
    
    function establecer_ruta(pagina) {
        var recurso, parametros;
        switch (buscador.parametros.informacionSeleccionada) {
            // establecer recurso
            case '-1': // sin filtro
                break;
            case '0': // por numero de siniestro
                break;
            case '1': // por numero de poliza
                break;
            case '2': // por nombre
                break;
            case '3': // por telefono
                break;
            case '4': // por direccion
                break;
        }
        switch (buscador.parametros.estadoSeleccionado) {
            // establecer parametros
            case '-1': // todos los estados
                break;
            case '0': // abiertos
                break;
            case '1': // cerrados
                break;
            case '2': // devuletos
                break;
            case '3': // facturados
                break;
            case '4': // cobrados
                break;
        }
        recurso = 'http://localhost:8080/ReForms_Provider/wr/siniestro/obtenerSiniestrosAbiertos/';
        parametros = pagina + '/' + (aseguradoras.aseguradoraSeleccionada != null ? aseguradoras.aseguradoraSeleccionada.id : '');
        return recurso + parametros;
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
        var ruta = establecer_ruta(pagina);
        $.get(ruta, function(data, status) {
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
        for (i = 0; i < siniestros.length; i++) {
            aseguradora = '<td>' + siniestros[i].poliza.cliente.aseguradora.nombre + '</td>';
            siniestro = '<td>' + siniestros[i].numero + '</td>';
            poliza = '<td>' + siniestros[i].poliza.numero + '</td>';
            registro = '<td>' + siniestros[i].fechaRegistro.slice(0, siniestros[i].fechaRegistro.indexOf('T')) + '</td>';
            switch (siniestros[i].estado) {
                case 0: estado = '<td>abierto</td>'; break;
                case 1: estado = '<td>cerrado</td>'; break;
                case 2: estado = '<td>devuleto</td>'; break;
                case 3: estado = '<td>facturado</td>'; break;
                case 3: estado = '<td>cobrado</td>'; break;
                default: estado = '<td></td>';
            }
            tbody.append('<tr class="siniestro">' + aseguradora + siniestro + poliza + registro + estado + '</tr>');
        }
    }
    
    function mostrar_siniestros(table, siniestros, total) {
        var tbody = table.children('tbody'),
            tfoot = table.children('tfoot');
        mostrar_tabla_siniestros(tbody, siniestros);
        tfoot.remove('.pagination');
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
        $(this).siblings(".seleccionada").removeClass("seleccionada");
        $(this).addClass("seleccionada");
        contenedor.children('.buscador').load('Html/buscador.html', cargar_buscador);
    }
    
    function btn_buscar_click() {
        alert(JSON.stringify(buscador.parametros));
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
        buscador.parametros.estadoSeleccionado = $(this).val();
        switch (buscador.parametros.estadoSeleccionado) {
            case '0':
                buscador.parametros.subestados = [true, true, true, true];
                entradas_estado.find('input[type="checkbox"]').prop('checked', true);
                entradas_estado.children('.row').show();
                break;
            default:
                buscador.parametros.subestados = null;
                entradas_estado.children('.row').hide();
        }
    }
    
    function buscador_informacion_change() {
        var entrada, entradas_informacion = $(this).parent('div').parent('.principal').siblings('.entradas').children('.entradas-informacion');
        buscador.parametros.informacionSeleccionada = $(this).val();
        entradas_informacion.children('.entrada').remove();
        entradas_informacion.show();
        switch (buscador.parametros.informacionSeleccionada) {
            case '0':
                buscador.parametros.informacion = {'siniestro': null};
                entrada =   '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">nº siniestro</span></div>' +
                                '<input name="siniestro" class="form-control" type="text" maxlength="16" required placeholder="nº siniestro *"/>' +
                            '</div>';
                entradas_informacion.append(entrada);
                break;
            case '1':
                buscador.parametros.informacion = {'poliza': null};
                entrada =   '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">nº poliza</span></div>' +
                                '<input name="poliza" class="form-control" type="text" maxlength="10" required placeholder="nº poliza *"/>' +
                            '</div>';
                entradas_informacion.append(entrada);
                break;
            case '2':
                buscador.parametros.informacion = {'nombre': null, 'apellido1': null, 'apellido2': null};
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
                buscador.parametros.informacion = {'telefono': null};
                entrada =   '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">telefono</span></div>' +
                                '<input name="telefono" class="form-control" type="text" maxlength="9" required placeholder="telefono *"/>' +
                            '</div>';
                entradas_informacion.append(entrada);
                break;
            case '4':
                buscador.parametros.informacion = {'direccion': null, 'numero': null, 'piso': null, 'cp': null};
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
                buscador.parametros.informacion = null;
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
                parametros = aseguradoras.aseguradoraSeleccionada != null ? aseguradoras.aseguradoraSeleccionada.id : '';
            $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/contarSiniestrosAbiertos/' + parametros, function(data, status) {
                if (status == "success") {
                    buscador.totalSiniestros = new Number(data);
                    if (buscador.totalSiniestros > 0) {
                        $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/obtenerSiniestrosAbiertos/' + '0/' + parametros, function(data, status) {
                            if (status == "success") {
                                buscador.listaSiniestros = data;
                            } else {
                                alert('fallo en proveedor');
                            }
                            mostrar_siniestros(tabla, buscador.listaSiniestros, buscador.totalSiniestros);
                        }, 'json');
                    } else {
                        buscador.listaSiniestros = [];
                    }
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