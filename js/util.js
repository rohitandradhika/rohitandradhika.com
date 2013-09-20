$("<select />").appendTo("#t-links");

$("<option />", {
    "selected": "selected",
    "value": "",
    "text": "Menu"
}).appendTo("#t-links select");


$("#t-links a").each(function () {
    var el = $(this);
    $("<option />", {
        "value": el.attr("href"),
        "text": el.text()
    }).appendTo("#t-links select");
});
$("#t-links select").change(function () {
    window.location = $(this).find("option:selected").val();
});
$('#t-links select').css({"display": "none"});


// this part was added to center the boxes in registry pages in one column in narrow and old pages
$('#t-content').each(function () {
    $self = $(this).width();

    if ($self < 680) {
        var RegWidth = ($self / 2) - 60;
        $('#c-registries-container > .c-odd ,#c-registries-container .c-even').width(RegWidth);
        // anchor width fix needed for IE8
        $('#c-registries-container .c-subtitle a,#c-registries-container .c-subtitle img').css('max-width', (RegWidth - 20) + 'px');
    }
});


// this part was added to allow the new expedia widget to be styled by FWW style sheets

var NewHeader = $(pageNav).children();
NewHeader.replaceWith('<h3>Book your hotel</h3>');

//oldbutton.replaceWith('<input type="button" id="search-btn" class="" value="Search" onClick="_gaq.push(['_trackEvent', 'Expedia', '{$trackingPage}', 'Form Submission']);" >Search</button>');