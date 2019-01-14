$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-siniestros').css('background-color'),
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
            'parametros': {
                'estadoSeleccionado': '-1',
                'subestados': '0000',
                'informacionSeleccionada': '-1',
                'informacion': null
            },
            'coincidencias': {
                'listaCoincidencias': [],
                'coincidenciaSeleccionada': null,
                'coincidenciaFijada': null
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
    
    function generarMapa(lat, long) {
        var funcion = '<script>function cargarMapa() { var propiedades = { center: new google.maps.LatLng(' + lat + ', ' + long + '), zoom: 18 }, mapa = new google.maps.Map(document.getElementById("googleMap"), propiedades), marcador = new google.maps.Marker({position: propiedades.center}); marcador.setMap(mapa); }</script>',
            script = '<script src="https://maps.googleapis.com/maps/api/js?key=' + googleKey + '&callback=cargarMapa"></script>',
            mapa  = '<div id="googleMap" style="width:100%;height:400px;"></div>';
        return '<div class="mapaGoogle">' + funcion + script + mapa + '</div>';
    }
    
    function generarDetalles(siniestro, listaTareas) {
        var poliza, cliente, propiedad, tareas,
            nombre = '<strong>Nombre: </strong>' + siniestro.poliza.cliente.nombre + ' ' + siniestro.poliza.cliente.apellido1,
            telefono = '<strong>Telefono: </strong>' + siniestro.poliza.cliente.telefono1, tipo,
            direccion = '<strong>Direccion: </strong>' + siniestro.poliza.propiedad.direccion + ', ' + siniestro.poliza.propiedad.numero, piso = '',
            localidad = '<strong>Localidad: </strong>' + siniestro.poliza.propiedad.localidad.nombre + ' [' + siniestro.poliza.propiedad.localidad.cp + ']',
            i, gremio, codigo, descripcion, estado;
        if (siniestro.poliza.cliente.apellido2 && siniestro.poliza.cliente.apellido2 != null && siniestro.poliza.cliente.apellido2 != '') {
            nombre += ' ' + siniestro.poliza.cliente.apellido2;
        }
        if (siniestro.poliza.cliente.telefono2 && siniestro.poliza.cliente.telefono2 != null && siniestro.poliza.cliente.telefono2 != '') {
            telefono += ' / ' + siniestro.poliza.cliente.telefono2;
        }
        switch (siniestro.poliza.cliente.tipo) {
            case 0: tipo = '<strong>Tipo de cliente: </strong>normal'; break;
            case 1: tipo = '<strong>Tipo de cliente: </strong>preferente'; break;
            case 2: tipo = '<strong>Tipo de cliente: </strong>VIP'; break;
            default:  tipo = '';
        }
        if (siniestro.poliza.propiedad.piso && siniestro.poliza.propiedad.piso != null && siniestro.poliza.propiedad.piso != '') {
            piso = '<strong>Piso: </strong>' + siniestro.poliza.propiedad.piso;
        }
        cliente = '<div class="col-xl-6 col-12"><h4>Datos del asegurado</h4><p>' + nombre + '</p><p>' + telefono + '</p><p>' + tipo + '</p></div>';
        propiedad = '<div class="col-xl-6 col-12"><h4>Propiedad asegurada</h4><p>' + direccion + '</p><p>' + piso + '</p><p>' + localidad + '</p></div>';
        poliza = '<div class="row">' + cliente + propiedad + '</div>';
        tareas = '<div class="row"><div class="col-12"><h4>Tareas del siniestro</h4><div class="container-fuild">';
        tareas += '<div class="row cabecera"><div class="col-3"><strong>gremio</strong></div><div class="col-3"><strong>codigo</strong></div><div class="col-3"><strong>descripcion</strong></div><div class="col-3"><strong>estado</strong></div></div>';
        if (listaTareas.length == 0) {
            tareas += '<div class="row"><div class="col-12">Sin tareas registradas</div></div>';
        } else {
            for (i = 0; i < listaTareas.length; i++) {
                gremio = '<div class="col-3">' + listaTareas[i].trabajo.gremio.nombre + '</div>';
                codigo = '<div class="col-3">' + listaTareas[i].trabajo.codigo + '</div>';
                descripcion = '<div class="col-3">' + listaTareas[i].trabajo.descripcion + '</div>';
                switch (listaTareas[i].estado) {
                    case 0: estado = '<div class="col-3">pendiente</div>'; break;
                    case 0: estado = '<div class="col-3">en proceso</div>'; break;
                    case 0: estado = '<div class="col-3">finalizada</div>'; break;
                    case 0: estado = '<div class="col-3">anulada</div>'; break;
                    default: estado = '<div class="col-3"></div>';
                }
                tareas += '<div class="row">' + gremio + codigo + descripcion + estado + '</div>';
            }
        }
        tareas += '</div></div></div>';
        return '<tr class="siniestro-detalles"><td colspan="5"><div class="container-fuild">' + poliza + tareas + '</div></td></tr>';
    }
    
    function telefono_valido(telefonoStr) {
        return /^\d{9}$/.test(telefonoStr);
    }
    
    function mostrar_sugerencias(listaCoincidencias, sugerencias) {
        var tbody = sugerencias.children('div.tabla').find('tbody'),
            i, direccion;
        tbody.children('tr.sugerencia').remove();
        for (i = 0; i < listaCoincidencias.length; i++) {
            direccion = listaCoincidencias[i].direccion + ' ' + listaCoincidencias[i].numero + ', ' + listaCoincidencias[i].localidad.nombre + ' [' + listaCoincidencias[i].localidad.cp + ']';
            tbody.append('<tr class="sugerencia"><td>' + direccion + '</td></tr>');
        }
        tbody.children('tr.sugerencia').click(sugerencia_click);
        sugerencias.children('div.detalles').hide();
    }
    
    function comprobar_direccion() {
        var entradas = $(this).parent('div.entrada').parent('div.entradas-informacion'),
            cp = entradas.find('input[name="cp"]'),
            direccion = entradas.find('input[name="direccion"]'),
            numero = entradas.find('input[name="numero"]'),
            sugerencias = entradas.parent('div.entradas').siblings('div.sugerencias');
        buscador.coincidencias.coincidenciaSeleccionada = null;
        buscador.coincidencias.coincidenciaFijada = null;
        if (direccion.val() != '' && numero.val() != '') {
            var direccion_completa = direccion.val() + ' ' + numero.val();
            if (cp.val() != '') {
                direccion_completa += ', ' + cp.val();
            }
            $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + direccion_completa + '&key=' + googleKey, function(data) {
                if (data.results.length > 0) {
                    var i, j, k, p;
                    buscador.coincidencias.listaCoincidencias = [];
                    for (i = 0; i < data.results.length; i++) {
                        p = new Propiedad();
                        p.id = i;
                        p.localidad = new Localidad();
                        for (j = 0; j < data.results[i].address_components.length; j++) {
                            for (k = 0; k < data.results[i].address_components[j].types.length; k++) {
                                switch (data.results[i].address_components[j].types[k]) {
                                    case 'route': p.direccion = data.results[i].address_components[j].short_name; break;
                                    case 'street_number': p.numero = data.results[i].address_components[j].short_name; break;
                                    case 'locality': p.localidad.nombre = data.results[i].address_components[j].short_name; break;
                                    case 'postal_code': p.localidad.cp = data.results[i].address_components[j].short_name; break;
                                }
                            }
                        }
                        p.geolat = data.results[i].geometry.location.lat;
                        p.geolong = data.results[i].geometry.location.lng;
                        if (p.direccion != null && p.direccion != '' && p.numero != null && p.numero != '' && p.localidad.nombre != null && p.localidad.nombre != '' && p.localidad.cp != null && p.localidad.cp != '') {
                            buscador.coincidencias.listaCoincidencias.push(p); 
                        }
                    }
                    if (buscador.coincidencias.listaCoincidencias.length > 0) {
                        mostrar_sugerencias(buscador.coincidencias.listaCoincidencias, sugerencias);
                        sugerencias.show();
                    } else {
                        sugerencias.hide();
                    }
                } else {
                    alerta('Direccion no encontrada', 'no se encuentra esta direccion en google maps');
                    sugerencias.hide();
                }
            }, 'json');
        }
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
    
    function mostrar_tabla_siniestros(tbody, siniestros) {
        var i, aseguradora, siniestro, poliza, registro, estado;
        aseguradoras.siniestroSeleccionado = null;
        tbody.children('.siniestro').remove();
        tbody.children('.siniestro-detalles').remove();
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
            tbody.children('.siniestro').click(siniestro_click);
        } else {
            tbody.append('<tr class="siniestro"><td colspan="5"><h3>Sin resultados</h3></td></tr>');
        }
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
        buscador.coincidencias.listaCoincidencias = [];
        buscador.coincidencias.coincidenciaSeleccionada = null;
        buscador.coincidencias.coincidenciaFijada = null;
        $(this).siblings(".seleccionada").removeClass("seleccionada");
        $(this).addClass("seleccionada");
        contenedor.children('.buscador').load('Html/buscador.html', cargar_buscador);
    }
    
    function sugerencia_click() {
        var detalles = $(this).parent('tbody').parent('table').parent('div.table-responsive-md').parent('div.tabla').siblings('div.detalles');
        if (buscador.coincidencias.coincidenciaSeleccionada == null || buscador.coincidencias.coincidenciaSeleccionada.id != buscador.coincidencias.listaCoincidencias[$(this).index()].id) {
            buscador.coincidencias.coincidenciaSeleccionada = buscador.coincidencias.listaCoincidencias[$(this).index()];
            $(this).css('background-color', colorFondo);
            $(this).siblings('tr.sugerencia').css('background-color', sinColor);
            detalles.find('div.marco').load('Html/sugerencia.html', cargar_sugerencia);
            detalles.show();
        } else {
            buscador.coincidencias.coincidenciaSeleccionada = null;
            $(this).css('background-color', sinColor);
            $(this).siblings('tr.sugerencia').css('background-color', sinColor);
            detalles.hide();
        }
    }
    
    function fijar_click() {
        var detalle = $(this).parent('div.col-12').parent('div.row').parent('div.detalle'),
            sugerencias = detalle.parent('div.marco').parent('div.col-12').parent('div.row').parent('div.detalles').parent('div.sugerencias'),
            informacion = sugerencias.siblings('div.entradas').children('div.entradas-informacion'),
            sugerencia_cp = detalle.find('input[name="sugerencia_cp"]'),
            sugerencia_direccion = detalle.find('input[name="sugerencia_direccion"]'),
            sugerencia_numero = detalle.find('input[name="sugerencia_numero"]'),
            cp = informacion.find('input[name="cp"]'),
            direccion = informacion.find('input[name="direccion"]'),
            numero = informacion.find('input[name="numero"]');
        buscador.coincidencias.coincidenciaFijada = buscador.coincidencias.coincidenciaSeleccionada;
        buscador.coincidencias.coincidenciaSeleccionada = null;
        cp.val(sugerencia_cp.val());
        direccion.val(sugerencia_direccion.val());
        numero.val(sugerencia_numero.val());
        sugerencias.hide();
        sugerencias.siblings('div.principal').children('div.buscar').children('a.btn-buscar').click();
    }
    
    function btn_buscar_click() {
        var principal = $(this).parent('.buscar').parent('.principal'),
            estado = principal.find('select[name="estado"]'),
            informacion = principal.find('select[name="informacion"]'),
            entradas = principal.siblings('.entradas'),
            entradas_informacion = entradas.children('.entradas-informacion'),
            table = principal.parent('div').parent('.busqueda').siblings('.resultados').children('div.col-12').children('.tabla').children('table'),
            ruta, telefono = true, direccion = true;
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
                telefono = telefono_valido(buscador.parametros.informacion);
                break;
            case '4':
                buscador.parametros.informacion = {
                    'direccion': entradas_informacion.find('input[name="direccion"]').val(),
                    'numero': entradas_informacion.find('input[name="numero"]').val(),
                    'piso': entradas_informacion.find('input[name="piso"]').val(),
                    'cp': entradas_informacion.find('input[name="cp"]').val()
                }
                direccion = buscador.coincidencias.coincidenciaFijada != null;
                break;
            default:
                buscador.parametros.informacion = null;
        }
        if (telefono && direccion) {
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
            }, 'text');
        } else if (!telefono) {
            alerta('Telefono no valido', 'introduzca un numero de telefono valido');
        } else {
            alerta('Sugerencia seleccionada', 'seleccione una sugerencia para realizar la busqueda');
        }
    }
    
    function btn_siniestro_nuevo_click() {
        if (aseguradoras.listaAseguradoras.length == 0) {
            alerta('Sin aseguradoras', 'no es posible registrar un nuevo siniestro sin aseguradora asociada');
        } else {
            $('#contenido').load('Html/nuevosiniestro.html', cargar_nuevosiniestro);
        }
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
    
    function siniestro_click() {
        var actual = $(this), tareas = [], detalles;
        actual.siblings('.siniestro-detalles').remove();
        if (aseguradoras.siniestroSeleccionado != null && aseguradoras.siniestroSeleccionado.id == buscador.listaSiniestros[actual.index()].id) {
            aseguradoras.siniestroSeleccionado = null;
            actual.removeClass('seleccionado').css({'border-color':sinColor, 'background-color':sinColor});
        } else {
            aseguradoras.siniestroSeleccionado = buscador.listaSiniestros[actual.index()];
            $.get('http://localhost:8080/ReForms_Provider/wr/tarea/buscarTareaPorSiniestro/' + aseguradoras.siniestroSeleccionado.id, function(data, status) {
                if (status == "success") {
                    tareas = data;
                }
                actual.siblings('.siniestro').removeClass('seleccionado').css({'border-color':sinColor, 'background-color':sinColor});
                actual.addClass('seleccionado').css({'border-color':colorBorde, 'background-color':colorFondo});
                actual.after(generarDetalles(aseguradoras.siniestroSeleccionado, tareas));
                detalles = actual.siblings('.siniestro-detalles');
                detalles.find('div.cabecera').css('background-color', colorFondo);
                detalles.css('border-color', colorBorde).dblclick(siniestro_detalles_dblclick);
            }, 'json');
        }
    }
    
    function siniestro_detalles_dblclick() {
        sessionStorage.setItem('siniestro', JSON.stringify(aseguradoras.siniestroSeleccionado));
        $('#contenido').load('Html/siniestro.html', cargar_siniestro);
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
        var entrada, principal = $(this).parent('div').parent('div.principal'),
            entradas_informacion = principal.siblings('div.entradas').children('div.entradas-informacion'),
            sugerencias = principal.siblings('div.sugerencias');
        entradas_informacion.children('div.entrada').remove();
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
                                '<div class="input-group-prepend"><span class="input-group-text">localidad</span></div>' +
                                '<input name="cp" class="form-control" type="text" maxlength="100" placeholder="localidad o c.p. *"/>' +
                            '</div>' +
                            '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">direccion</span></div>' +
                                '<input name="direccion" class="form-control" type="text" maxlength="250" required placeholder="direccion *"/>' +
                                '<input name="numero" class="form-control" type="number" step=1 min=1 required placeholder="numero *"/>' +
                            '</div>' +
                            '<div class="entrada input-group mb-3">' +
                                '<div class="input-group-prepend"><span class="input-group-text">piso</span></div>' +
                                '<input name="piso" class="form-control" type="text" maxlength="20" placeholder="piso"/>' +
                            '</div>';
                entradas_informacion.append(entrada);
                entradas_informacion.find('input[name="cp"]').change(comprobar_direccion);
                entradas_informacion.find('input[name="direccion"]').change(comprobar_direccion);
                entradas_informacion.find('input[name="numero"]').change(comprobar_direccion);
                break;
            default:
                entradas_informacion.hide();
        }
        if ($(this).val() != '4') {
            buscador.coincidencias.listaCoincidencias = [];
            buscador.coincidencias.coincidenciaSeleccionada = null;
            buscador.coincidencias.coincidenciaFijada = null;
            sugerencias.hide();
        }
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_buscador(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var contenedor = $(this).children('div.container-fluid'),
                busqueda = contenedor.children('div.busqueda').children('div.container-fluid'),
                principal = busqueda.children('div.principal'),
                entradas = busqueda.children('div.entradas'),
                sugerencias = busqueda.children('div.sugerencias'),
                tabla = contenedor.children('div.resultados').children('div.col-12').children('div.tabla').children('table'),
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
            }, 'text');
            principal.find('select[name="estado"]').change(buscador_estado_change);
            principal.find('select[name="informacion"]').change(buscador_informacion_change);
            principal.find('.btn-buscar').click(btn_buscar_click);
            principal.find('button[name="siniestro-nuevo"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(btn_siniestro_nuevo_click);
            entradas.find('input[type="checkbox"]').prop('checked', true);
            tabla.children('thead').css('background-color', colorBorde);
            sugerencias.find('thead').css('background-color', colorBorde);
            sugerencias.children('div.detalles').find('div.marco').css('border-color', colorBorde);
            entradas.children('.entradas-estado').children('.row').hide();
            entradas.children('.entradas-informacion').hide();
            sugerencias.hide();
        } else {
            alerta('Error 404', 'no se pudo cargar buscador.html');
        }
    }
    
    function cargar_sugerencia(responseTxt, statusTxt) {
        var detalle = $(this).children('div.detalle'),
            mapa = detalle.find('div.mapa');
        if (statusTxt == 'success') {
            detalle.find('input[name="sugerencia_cp"]').val(buscador.coincidencias.coincidenciaSeleccionada.localidad.cp);
            detalle.find('input[name="sugerencia_direccion"]').val(buscador.coincidencias.coincidenciaSeleccionada.direccion);
            detalle.find('input[name="sugerencia_numero"]').val(buscador.coincidencias.coincidenciaSeleccionada.numero);
            detalle.find('button[name="fijar"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(fijar_click);
            mapa.children('div.mapaGoogle').remove();
            mapa.append(generarMapa(buscador.coincidencias.coincidenciaSeleccionada.geolat, buscador.coincidencias.coincidenciaSeleccionada.geolong));
            mapa.children('div.mapaGoogle').append('<span>(' + buscador.coincidencias.coincidenciaSeleccionada.geolat + ', ' + buscador.coincidencias.coincidenciaSeleccionada.geolong + ')</span>');
        } else {
            alerta('Error 404', 'no se pudo cargar sugerencia.html');
        }
    }
    
    function cargar_nuevosiniestro(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar nuevosiniestro.html');
        }
    }
    
    function cargar_siniestro(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar siniestro.html');
            sessionStorage.removeItem('siniestro');
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
