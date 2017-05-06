
var after = null;

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function ext(url) {
    return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split('#')[0].substr(url.lastIndexOf("."))
}

$(function() {
    handle_top();
    load_more_data();

});

$("#sort").change(function()
{
    handle_top();
});

function handle_top()
{
    if ($("#sort").val() == "top")
      {
        $('\
          <select class="form-control" id="date" name="date">\
            <option value="hour">last hour</option>\
            <option value="day">last day</option>\
            <option value="week">last week</option>\
            <option value="month">last month</option>\
            <option value="year">last year</option>\
            <option value="all">all time</option>\
          </select>\
          ').insertAfter('#sort');
      }
      else
      {
        $("#date").remove();
      }
}

function load_more_data()
{
    $('#subreddit').attr('value', getUrlParameter('subreddit'));
    subreddit =  getUrlParameter('subreddit');
    var sort = getUrlParameter('sort');
    var top = getUrlParameter('top');

    var limit = 40;
    var count = 0;

    var url = "https://www.reddit.com/";

    if (subreddit != "undefined" && subreddit)
    {
        url += "r/" + subreddit;
    }

    if (sort && sort != "popular")
    {
        url += "/" + sort
    }

    url += '/.json';
    url += '?';

    if (sort == "top" && top)
    {
        url += "t=" + top;
        url += "&";
    }

    url += 'limit=' + limit;
    url += "&";

    if (after != null)
    {
        url += 'after=' + after;
    }


    /*$.get("https://www.reddit.com/r/ImaginaryLandscapes/", 
        function(page) {
            var imgs = $(page).get("*.jpg");
            console.log(imgs);
        });*/

    $.ajax({
        url: url,
        success: function(results) {
            var data = results.data.children;

            after = results.data.after;

            for (post of data)
            {
                var title = post.data.title;
                var url = post.data.url;
                var img_url = post.data.preview.images[0].source.url;
                /*var img_url = 'img/hd1080.png';*/
                // Limit images if too big (todo : find a workaround)
                var max_width = 3000;
                if (post.data.preview.images[0].source.width > max_width)
                {
                    continue;
                }

                // Ignore images from self posts
                if (post.data.domain == "reddit.com")
                {
                    continue;
                }


                var img = $('<img></img>');
                img.attr("src", img_url);



                var link    = $('<a></a>');
                link.attr('href', url).html(title);

                var info = $('<div></div>');
                info.append(link);


                var display = $('<div></div>');
                display.attr('class', 'display');
                display.append(img);
                display.append(info);

                // check if it is an imgur album :
                reg = /\/a\//

                if (reg.exec(url))
                {
                    display.append('<i class="fa fa-picture-o album-icon" aria-hidden="true"></i>');
                }

                $('#data').append(display);

                count ++;
                if (count >= limit)
                {
                    break;
                }
            }
        }
    })
}