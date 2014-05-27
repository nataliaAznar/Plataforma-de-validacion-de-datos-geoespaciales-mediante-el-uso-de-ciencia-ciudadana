$('#inputFile').on('change', function() {
    var delimeter = ': ';
    var file = $('#inputFile').get(0).files[0];
    
    //muestra el nombre, el tamaño y el tipo del archivo 
    $('#fileName').text(['Name', file.name].join(delimeter));
    $('#fileSize').text(['Size', file.size].join(delimeter));
    $('#fileType').text(['Type', file.type].join(delimeter));
});
 
$('#inputSubmit').on('click', function() {
  //crea una variable formulario y le añade datos, que deberían aparecer en el body del req.
    var fd = new FormData();
    //muestra los datos que se envían en la consola del servidor
    fd.append('uploadingFile', $('#inputFile').get(0).files[0]);
    fd.append('date', (new Date()).toString()); // req.body.date
    fd.append('comment', 'This is a test.'); // req.body.comment
    
    //Crea la variable ajax para enviar el archivo 
    var xhr = $.ajax({
        url: 'http://energia.deusto.es:3001/upload',
        data: fd,
        contentType: false,
        processData: false,
        type: 'POST',
    });
    
});
 

 