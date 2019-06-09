$(document).ready(function(){
    // Validating the URL
    $('#siteurl_form').validate({
        rules:{
            site_url:{
                required: true,
                url: true
            }
        },
        messages:{
            required: "Please enter the website url",
            url: "enter the url correctly (use http:// format)"
        }
    });

    // Handle submit request
    $('#create_backup').on('click', function(e) {
        if(e.isDefaultPrevented()){
            console.log('prevented');
        } else {
          e.preventDefault();
          $.ajax({
            type: 'POST',
            url: '/site_req',
            data: {'siteurl': $('#site_url').val()},
            success: 
            function(res) {
              //console.log(res);
              if (res['data'] == 'successful') {
                console.log(res);
                }
              else {
                console.log(res);
              } 
            }
        });
    }
})    
    
});
    // show Progress bar
    // receive the JSON response
    // Error handling function
    // change url on backup generation
