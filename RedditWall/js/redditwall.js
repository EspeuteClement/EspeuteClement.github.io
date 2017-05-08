
var after = null;
var confirm_age = false;
var col_number = 0;
var col_heigth = [];


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

var fileExtension = function( url ) {
    return url.split('.').pop().split(/\#|\?/)[0];
}

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
    // Perform age check if nsfw filter is turned off

    var nsfw_filter = getUrlParameter('nsfw');
    if (! nsfw_filter)
    {
        nsfw_filter = 'hide';
    }

    if (! confirm_age && nsfw_filter != 'hide')
    {
        if (confirm("Warning, you disabled the NSFW filter. Do you confirm that you are over 18 and willing to see adult content ?"))
        {
            confirm_age = true;
        }
        else
        {
            return;
        }
    }


    subreddit =  getUrlParameter('subreddit');
    var sort = getUrlParameter('sort');
    var date = getUrlParameter('date');

    var limit = 40;
    var count = 0;

    // Build json request url
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

    if (sort == "top" && date)
    {
        url += "t=" + date;
        url += "&";
    }

    url += 'limit=' + limit;
    url += "&";

    if (after != null)
    {
        url += 'after=' + after;
        url += "&";
    }

    url += "raw_json=1";

    // Change load more message by a loading spinner    
    $('#load_more').html('<i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>');

    $.ajax({
        url: url,
        success: function(results) {
            var data = results.data.children;

            after = results.data.after;

            var quality = getUrlParameter('quality');
            if (! quality)
            {
                quality = "hd";
            }

            for (post of data)
            {
                var title = post.data.title;
                var url = post.data.url;
                var age = post.data.over_18;

                // Skip images that are nsfw if nsfw is disabled
                if (nsfw_filter == 'hide' && age == true)
                {
                    continue;
                }

                // Skip if no preview
                if (! post.data.preview){
                    continue;
                }


                // Get image for display
                var img_url = null;

                // TODO fix image size for thumbnail
                var img_width = post.data.preview.images[0].source.width;
                var img_heigth = post.data.preview.images[0].source.height;

                if (quality == "sd")
                {
                    img_url = post.data.thumbnail;
                }
                else if (quality == 'hd')
                {
                    var max_width = 10000;
                    var min_width = 500;
                    for (preview of post.data.preview.images[0].resolutions)
                    {
                        if (preview.width > min_width && preview.width < max_width)
                        {
                            max_width = preview.width;
                            img_url = preview.url;
                        }
                    }
                }
                else
                {
                    img_url = post.data.preview.images[0].source.url;
                }

                // Get comment link
                var permalink = "https://www.reddit.com/" + post.data.permalink;
                var num_comments = post.data.num_comments;

                // Ignore images from self posts
                if (post.data.domain == "reddit.com")
                {
                    console.log("Self post, ignoring ...");
                    continue;
                }

                // Ignore no url
                if (!img_url)
                {
                    continue;
                }

                // Filter extensions
                var e = ext(img_url);
                console.log("ext:" + e + ", url :" + img_url);

                if (! (e == ".jpg" || e == ".jpeg" || e == ".png"))
                {
                    continue;
                }

                // Create the image container
                var img = $('<img></img>');
                img.attr("src", img_url);
                img.attr("alt", title);

                // Create link to image post
                var link    = $('<a></a>');
                link.attr('href', url).html(title);
                link.attr('target', '_blank');

                // Create comment link
                var comments = $('<a></a>');
                comments.attr('href',permalink).html("comments (" + num_comments +")");
                comments.attr('target', '_blank');

                // Create the on hover info with links
                var info = $('<div></div>');
                info.append(link);
                info.append('<br>');
                info.append(comments)

                // Create the whole image display
                var display = $('<div></div>');
                display.attr('class', 'display');
                display.append(img);
                display.append(info);
                

                // check if it is an imgur album, and add icon if its the case :
                reg = /\/a\//

                if (reg.exec(url))
                {
                    display.append('<i class="fa fa-picture-o album-icon" aria-hidden="true"></i>');
                }

                // Find the smallest column to put
                // our image in
                var min_height = 100000000;
                var min_index = 0;
                for (var i = 0; i < col_number; i++)
                {
                    if (col_heigth[i] < min_height)
                    {
                        min_height = col_heigth[i];
                        min_index = i;
                    }
                }

                // Put the image in the chosen column
                var col = $('#col' + (min_index));
                var w = window.innerWidth/col_number;

                // Update the column height
                var h = w * img_heigth / img_width;
                col_heigth[min_index] += h;
                col.append(display);

                count ++;
                if (count >= limit)
                {
                    console.log("Count reached, stopping");
                    break;
                }
            }

            $('#load_more').html('Click Here to load more');

            if (data.length < 1)
            {
                $('#load_more').html('Couldn\' load data, try changing your search parameters');
            }
            else if (count < 1)
            {
                $('#load_more').html('Couldn\' load images, try changing the nsfw filter or find a sub with image posts');
            }
        },
        error: function()
        {
            $('#load_more').html('Couldn\'t reach reddit servers. Click here to try again');
        }
    })
}



// MAIN FUNCTION

$(function() {
    // Create td based on width
    var w = window.innerWidth;
    w - 200;
    col_number = Math.floor(w / 400) + 1;

    for (var i = 0; i < col_number; i++ )
    {
        $('#row').append('<td id="col' + i + '"></td>');
        col_heigth.push(0);
    }

    $("#load_more").click(load_more_data);
    $('#subreddit').attr('value', getUrlParameter('subreddit'));
    if (getUrlParameter('sort'))
        $('#sort').val(getUrlParameter('sort'));
    if (getUrlParameter('nsfw'))
        $('#nsfw').val(getUrlParameter('nsfw'));

    handle_top();

    if (getUrlParameter('date'))
        $('#date').val(getUrlParameter('date'));
    if (getUrlParameter('quality'))
        $('#quality').val(getUrlParameter('quality'));

    load_more_data();
});
