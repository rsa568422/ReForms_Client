$(document).ready(function() {
    $("body").addClass("bg-light");
    $("#contenido").load("login.html", function(responseTxt, statusTxt) {
        if(statusTxt !== "success") {
            alert("Error: no se pudo cargar login.html");
        }
    });
});
