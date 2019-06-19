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
          var submitval = $('#site_url').val();
          if(submitval.length >= 7){
            $('#modal-center').addClass( "uk-flex uk-open" );
            $.ajax({
              type: 'POST',
              url: '/site_req',
              cache: false,
              data: {'siteurl': submitval},
              success: 
                function(res) {
                  console.log(res);
                  $('#final-dl-btn').attr("onclick", `window.location.href='${res}'`);
                  $('#dl-icon').attr("onclick", `window.location.href='${res}'`);
                  $('#dl-link').html(`If the download hasn't automatically started yet click on : <a href=${res}>${res}</a>`);
                  $('#modal-center').removeClass( "uk-flex uk-open" );
                  $('#modal-final-dl').addClass("uk-flex uk-open" );
                }
            });
          }
        }
    })    
});