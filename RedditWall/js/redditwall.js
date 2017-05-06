
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
    load_more_data();
})

function load_more_data()
{
    $('#subreddit').attr('value', getUrlParameter('subreddit'));
    subreddit =  getUrlParameter('subreddit');

    var limit = 40;
    var count = 0;

    var url = "https://www.reddit.com/";

    if (subreddit != "undefined" && subreddit)
    {
        url += "r/" + subreddit;
    }

    url += '/.json';
    url += '?';
    url += 'limit=' + limit;

    if (after != null)
    {
        url += '&after=' + after;
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

                if (ext.url)

                console.log(img_url);


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