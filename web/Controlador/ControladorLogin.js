$(document).ready(function() {
    
    var operadores, googleKey = '';
    
    function acceder() {
        $('#barra').load('Html/barra.html', function(responseTxt, statusTxt) {
            if(statusTxt === 'success') {
                sessionStorage.setItem('googleKey', googleKey);
                $('#contenido').load('Html/siniestros.html', function(responseTxt, statusTxt) {
                    if(statusTxt !== 'success') {
                        alert('Error: no se pudo cargar siniestros.html');
                    }
                });
            } else {
                alert('Error: no se pudo cargar barra.html');
            }
        });
    }

    $.get("http://localhost:8080/ReForms_Provider/wr/operador/prueba/", function(data, status) {
        if (data != null) {
            operadores = data;
            var i;
            for (i = 0; i < operadores.length; i++) {
                var nombre = operadores[i].trabajador.nombre + ' ' + operadores[i].trabajador.apellido1 + ' ' + (operadores[i].trabajador.apellido2 ? operadores[i].trabajador.apellido2 : '');
                $('#operadores').children('table').children('tbody').append('<tr class="operador"><td><h4>' + nombre + '</h4></td></tr>');
            }
            $('.operador').dblclick(function() {
                var rolStr, rol = $(this).parent('tbody').parent('table').siblings('select[name="rol"]').val(),
                    operador = operadores[$(this).index()];
                switch (rol) {
                    case '0': rolStr = '"operador"';
                            break;
                    case '1': rolStr = '"operador"';
                            operador.gerente = 0;
                            break;
                    case '2': rolStr = '"operario"';
                            operador = operador.trabajador;
                            break;
                    default: rolStr = '"desconocido"';
                             operador = operador.trabajador;
                }
                sessionStorage.setItem('usuario', '[' + JSON.stringify(operador) + ',' + rolStr + ']');
                acceder();
            });
        }
    }, 'json');
    
    $('#barra').hide();
});