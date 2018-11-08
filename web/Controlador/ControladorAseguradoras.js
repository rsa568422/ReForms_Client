$(document).ready(function() {
    
    var peritos, gremios, trabajos,
        la, aseguradora = null,
        color = $("#btn-aseguradoras").css("background-color");
    
    function generarLogo(aseguradora) {
        return i = "<img class='logo' src='data:image/gif;base64," + aseguradora.logo + "' width='480' height='360' alt='" + aseguradora.nombre + "'/>";
    }
    
    function cargarTrabajos(gremio) {
        $("#btnNuevoTrabajoAceptar").hide();
        $("#btnNuevoTrabajoCancelar").hide();
        $(".trabajo").remove();
        $.get("http://localhost:8080/ReForms_Provider/wr/trabajo/buscarTrabajoPorAseguradoraGremio/" + aseguradora.id + "/" + gremio.id, function(data, status) {
            if (status == "success") {
                var i;
                trabajos = data;
                for (i = 0; i < trabajos.length; i++) {
                    var codigo = "<td>" + trabajos[i].codigo + "</td>",
                        descripcion = "<td>" + trabajos[i].descripcion + "</td>",
                        dificultad = "<td>";
                    switch (trabajos[i].dificultad) {
                        case 0: dificultad += "facil</td>"; break;
                        case 1: dificultad += "ayudante</td>"; break;
                        case 2: dificultad += "profesional</td>"; break;
                        case 3: dificultad += "experto</td>"; break;
                        default: dificultad += "desconocida</td>"; break;
                    }
                    $("#trabajos").find("tbody").append("<tr class='trabajo'>" + codigo + descripcion + dificultad + "</tr>");
                }
                $(".trabajo").dblclick(function() {
                    alert("editar trabajo");
                });
            }
        }, "json");
    }
    
    function cargarPeritosTrabajos() {
        $.get("http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoPorAseguradora/" + aseguradora.id, function(data, status) {
            if (status == "success") {
                var i, tbody = $("#peritos").find("table").children("tbody");
                peritos = data;
                tbody.children("tr").remove();
                for (i = 0; i < peritos.length; i++) {
                    var nombre = "<td>" + peritos[i].nombre + "</td>",
                        apellidos = "<td>" + peritos[i].apellido1,
                        telefonos = "<td>" + peritos[i].telefono1,
                        fax = "<td>",
                        email = "<td>";
                    if (peritos[i].apellido2 && peritos[i].apellido2 != "") {
                        apellidos += " " + peritos[i].apellido2 + "</td>";
                    } else {
                        apellidos += "</td>";
                    }
                    if (peritos[i].telefono2 && peritos[i].telefono1 != peritos[i].telefono2) {
                        telefonos += " " + peritos[i].telefono2 + "</td>";
                    } else {
                        telefonos += "</td>";
                    }
                    if (peritos[i].fax) {
                        fax += peritos[i].fax + "</td>";
                    } else {
                        fax += "</td>";
                    }
                    if (peritos[i].email) {
                        email += peritos[i].email + "</td>";
                    } else {
                        email += "</td>";
                    }
                    tbody.append("<tr>" + nombre + apellidos + telefonos + fax + email + "</tr>");
                }
                tbody.children("tr").not("#trNuevoPerito").dblclick(function() {
                    alert($(this).index());
                    $("#btnNuevoPerito").prop("disabled", false);
                    $("#btnNuevoPeritoAceptar").hide();
                    $("#btnNuevoPeritoCancelar").hide();
                    $(this).siblings("#trNuevoPerito").remove();
                });
            }
        }, "json");
        $.get("http://localhost:8080/ReForms_Provider/wr/gremio/obtenerGremios", function(data, status) {
            if (status == "success") {
                var i;
                gremios = data;
                $(".gremio").remove();
                for (i = 0; i < gremios.length; i++) {
                    $("#gremios").append("<button type='button' class='btn gremio'>" + gremios[i].nombre + "</button>");
                }
                $("#gremios").append("<button id='btnNuevoGremio' type='button' class='btn gremio'><i class='material-icons'>add_circle</i></button>");
                $("#btnNuevoGremio").css("color", $("#btn-aseguradoras").css("background-color"));
                $(".gremio").css("border-color", $("#btn-aseguradoras").css("background-color")).css("background-color", "rgb(0, 0, 0, 0)");
                $(".gremio").eq(0).css("background-color", $("#btn-aseguradoras").css("background-color"));
                $(".gremio").not("#btnNuevoGremio").click(function() {
                    $(this).css("background-color", $("#btn-aseguradoras").css("background-color"));
                    $(this).siblings(".gremio").css("background-color", "rgb(0, 0, 0, 0)");
                    cargarTrabajos(gremios[$(this).index()]);
                });
                $("#btnNuevoGremio").click(function() {
                    var nombreGremio = "<input id='nombreGremio' type='text' class='form-control' maxlength='20' required>",
                        btnNuevoGremioAceptar = "<button id='btnNuevoGremioAceptar' type='button' class='btn'>aceptar</button>",
                        btnNuevoGremioCancelar = "<button id='btnNuevoGremioCancelar' type='button' class='btn'>cancelar</button>";
                    $(".gremio").prop("disabled", true);
                    $(this).css("background-color", $("#btn-aseguradoras").css("background-color"));
                    $(this).siblings(".gremio").css("background-color", "rgb(0, 0, 0, 0)");
                    $("#btnNuevoTrabajo").prop("disabled", true);
                    $(".trabajo").remove();
                    $("#gremios").append("<div class='form-inline'>" + nombreGremio + "</div>" + btnNuevoGremioAceptar + btnNuevoGremioCancelar);
                    $("#btnNuevoGremioAceptar").css("border-color", "green");
                    $("#btnNuevoGremioAceptar").css("color", "green");
                    $("#btnNuevoGremioAceptar").css("background-color", "rgb(0, 0, 0, 0)");
                    $("#btnNuevoGremioCancelar").css("border-color", "red");
                    $("#btnNuevoGremioCancelar").css("color", "red");
                    $("#btnNuevoGremioCancelar").css("background-color", "rgb(0, 0, 0, 0)");
                    $("#nombreGremio").focus();
                    $("#btnNuevoGremioAceptar").click(function() {
                        var g = new Gremio(),
                            nombre = $("#nombreGremio");
                        if (nombre.prop("validity").valid) {
                            g.nombre = nombre.val();
                            $.ajax({
                                url: 'http://localhost:8080/ReForms_Provider/wr/gremio/registrarGremio',
                                dataType: 'json',
                                type: 'post',
                                contentType: 'application/json',
                                data: JSON.stringify(g),
                                processData: false,
                                success: function(data, textStatus, jQxhr){
                                    $("#btn-aseguradoras").click();
                                },
                                error: function(jQxhr, textStatus, errorThrown){
                                    alert("Error: no se ha creado el gremio");
                                    $("#btnNuevoGremioCancelar").click();
                                }
                            });
                        } else {
                            alert("Error: revise el nombre del gremio");
                            $("#nombreGremio").focus();
                        }
                    });
                    $("#btnNuevoGremioCancelar").click(function() {
                        $(this).remove();
                        $("#nombreGremio").remove();
                        $("#btnNuevoGremioAceptar").remove();
                        $(".gremio").prop("disabled", false);
                        $("#btnNuevoPerito").prop("disabled", false);
                        $("#btnNuevoTrabajo").prop("disabled", false);
                        $("#btnNuevoGremio").css("background-color", "rgb(0, 0, 0, 0)");
                        $(".gremio").eq(0).css("background-color", $("#btn-aseguradoras").css("background-color"));
                        cargarTrabajos(gremios[0]);
                    });
                });
                cargarTrabajos(gremios[0]);
            }
        }, "json");
        $("#peritos").show();
        $("#trabajos").show();
        $("#btnNuevoPeritoAceptar").hide();
        $("#btnNuevoPeritoCancelar").hide();
    }
        
    $("#ventana").css("border-color", color);
    $("#aseguradoras").css("border-color", color);
    $("#logos").css("border-color", color);
    $("#peritos").css("border-color", color);
    $("#peritos").find("thead").children("tr").css("background-color", color);
    $("#btnNuevoPerito").css("border-color", $("#btn-aseguradoras").css("background-color"));
    $("#btnNuevoPerito").css("color", $("h2").css("color"));
    $("#btnNuevoPerito").css("background-color", "rgb(0, 0, 0, 0)");
    $("#btnNuevoPeritoAceptar").css("border-color", "green");
    $("#btnNuevoPeritoAceptar").css("color", "green");
    $("#btnNuevoPeritoAceptar").css("background-color", "rgb(0, 0, 0, 0)");
    $("#btnNuevoPeritoCancelar").css("border-color", "red");
    $("#btnNuevoPeritoCancelar").css("color", "red");
    $("#btnNuevoPeritoCancelar").css("background-color", "rgb(0, 0, 0, 0)");
    $("#trabajos").css("border-color", color);
    $("#trabajos").find("thead").children("tr").css("background-color", color);
    $("#btnNuevoTrabajo").css("border-color", $("#btn-aseguradoras").css("background-color"));
    $("#btnNuevoTrabajo").css("color", $("h2").css("color"));
    $("#btnNuevoTrabajo").css("background-color", "rgb(0, 0, 0, 0)");
    $("#btnNuevoTrabajoAceptar").css("border-color", "green");
    $("#btnNuevoTrabajoAceptar").css("color", "green");
    $("#btnNuevoTrabajoAceptar").css("background-color", "rgb(0, 0, 0, 0)");
    $("#btnNuevoTrabajoCancelar").css("border-color", "red");
    $("#btnNuevoTrabajoCancelar").css("color", "red");
    $("#btnNuevoTrabajoCancelar").css("background-color", "rgb(0, 0, 0, 0)");
    color = color.substring(0, color.length - 1) + ", 0.1)";
    $("#ventana").css("background-color", color);
    
    $("#peritos").hide();
    $("#trabajos").hide();
    
    $.get("http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras", function(data, status) {
        if (status == "success") {
            var i, a = null;
            la = data;
            if (localStorage.aseguradoraPredeterminada) {
                a = JSON.parse(localStorage.aseguradoraPredeterminada);
            }
            for (i = 0; i < la.length; i++) {
                var logo = generarLogo(la[i]);
                if (a != null && a.id == la[i].id) {
                    logo = logo.replace("logo", "logo seleccionada");
                    aseguradora = la[i];
                    cargarPeritosTrabajos();
                }
                $("#logos").append(logo);
            }
            $("#logos").append("<button id='btnNuevaAseguradora' type='button' class='btn'><i class='material-icons md-48'>add_circle</i></button>");
            $(".logo").css("border-color", $("#btn-aseguradoras").css("background-color"));
            $("#btnNuevaAseguradora").css("border-color", $("#btn-aseguradoras").css("background-color"));
            $("#btnNuevaAseguradora").css("color", $("#btn-aseguradoras").css("background-color"));
            $("#btnNuevaAseguradora").css("background-color", "rgb(0, 0, 0, 0)");
            $(".logo").click(function() {
                aseguradora = la[$(this).index()];
                $(this).siblings(".seleccionada").removeClass("seleccionada");
                $(this).addClass("seleccionada");
                cargarPeritosTrabajos();
            });
            $("#btnNuevaAseguradora").click(function() {
                aseguradora = null;
                $(".seleccionada").removeClass("seleccionada");
                $("#peritos").hide();
                $("#trabajos").hide();
            });
        }
    }, "json");
    
    $("#btnNuevoPerito").click(function() {
        var tbody = $("#peritos").find("table").children("tbody");
        $(this).prop("disabled", true);
        $("#btnNuevoGremio").prop("disabled", true);
        $("#btnNuevoTrabajo").prop("disabled", true);
        $("#btnNuevoPeritoAceptar").show();
        $("#btnNuevoPeritoCancelar").show();
        var nombre = "<td><input type='text' class='form-control' maxlength='50' required/></td>",
            apellidos = "<td><input type='text' class='form-control' maxlength='50' required/><input type='text' class='form-control' maxlength='50'/></td>",
            telefonos = "<td><input type='tel' class='form-control' maxlength='9' required/><input type='tel' class='form-control' maxlength='9'/></td>",
            fax = "<td><input type='tel' class='form-control' maxlength='9'/></td>",
            email = "<td><input type='email' class='form-control' maxlength='100'/></td>";
        tbody.append("<tr id='trNuevoPerito'>" + nombre + apellidos + telefonos + fax + email + "</tr>");
        tbody.children("#trNuevoPerito").children("td").eq(0).children("input").focus();
    });
    
    $("#btnNuevoPeritoAceptar").click(function() {
        var p = new Perito(), error = false,
            tr = $(this).siblings("table").children("tbody").children("#trNuevoPerito"),
            nombre = tr.children("td").eq(0).children("input"),
            apellido1 = tr.children("td").eq(1).children("input").eq(0),
            apellido2 = tr.children("td").eq(1).children("input").eq(1),
            telefono1 = tr.children("td").eq(2).children("input").eq(0),
            telefono2 = tr.children("td").eq(2).children("input").eq(1),
            fax = tr.children("td").eq(3).children("input"),
            email = tr.children("td").eq(4).children("input");
        if (nombre.prop("validity").valid) {
            p.nombre = nombre.val();
        } else {
            error = true;
        }
        if (apellido1.prop("validity").valid) {
            p.apellido1 = apellido1.val();
        } else {
            error = true;
        }
        if (apellido2.prop("validity").valid) {
            p.apellido2 = apellido2.val() != "" ? apellido2.val() : null;
        } else {
            error = true;
        }
        if (telefono1.prop("validity").valid) {
            p.telefono1 = telefono1.val();
        } else {
            error = true;
        }
        if (telefono2.prop("validity").valid) {
            p.telefono2 = telefono2.val() != "" ? telefono2.val() : null;
        } else {
            error = true;
        }
        if (fax.prop("validity").valid) {
            p.fax = fax.val() != "" ? fax.val() : null;
        } else {
            error = true;
        }
        if (email.prop("validity").valid) {
            p.email = email.val() != "" ? email.val() : null;
        } else {
            error = true;
        }
        if (!error) {
            p.aseguradora = aseguradora;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/perito/agregarPerito',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json',
                data: JSON.stringify(p),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $("#btnNuevoPeritoCancelar").click();
                    cargarPeritosTrabajos();
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alert("Error: no se ha creado el perito");
                }
            });
        } else {
            alert("Error: revise los datos del perito");
            nombre.focus();
        }
    });
    
    $("#btnNuevoPeritoCancelar").click(function() {
        $(this).hide();
        $("#btnNuevoPerito").prop("disabled", false);
        $("#btnNuevoGremio").prop("disabled", false);
        $("#btnNuevoTrabajo").prop("disabled", false);
        $("#btnNuevoPeritoAceptar").hide();
        $("#peritos").find("table").children("tbody").children("#trNuevoPerito").remove();
    });
});
