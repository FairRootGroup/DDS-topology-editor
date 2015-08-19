
var dragging = false;
var paperPointerX = 0;
var paperPointerY = 0;
$(function() {
    $('body').on('mousemove', function (event) {
        if (dragging) {
            var visDiv = $('.main-element-vis');
            visDiv[0].scrollLeft = Math.abs(paperPointerX - event.clientX);
            visDiv[0].scrollTop = Math.abs(paperPointerY - event.clientY);
        }
    });

    $('body').on('mouseup', function (e) {
        dragging = false;
    });
});
var lastScrollTop = 0;
$(document).ready(function() {
// Tooltip only Text
$('.masterTooltip').hover(function() {
        // Hover over code
        var title = $(this).attr('title');
        $(this).data('tipText', title).removeAttr('title');
        $('<p class="tooltip"></p>')
        .text(title)
        .appendTo('body')
        .fadeIn('slow');
}, function() {
        // Hover out code
        $(this).attr('title', $(this).data('tipText'));
        $('.tooltip').remove();
}).mousemove(function(e) {
        var mousex = e.pageX + 20; //Get X coordinates
        var mousey = e.pageY + 10; //Get Y coordinates
        $('.tooltip')
        .css({ top: mousey, left: mousex })
});
$('.connection-wrap').hover(function() {
        // Hover over code
        var title = $(this).attr('title');
        $(this).data('tipText', title).removeAttr('title');
        $('<p class="tooltip"></p>')
        .text(title)
        .appendTo('body')
        .fadeIn('slow');
}, function() {
        // Hover out code
        $(this).attr('title', $(this).data('tipText'));
        $('.tooltip').remove();
}).mousemove(function(e) {
        var mousex = e.pageX + 20; //Get X coordinates
        var mousey = e.pageY + 10; //Get Y coordinates
        $('.tooltip')
        .css({ top: mousey, left: mousex })
});
});

$("#size_form").submit(function (e) {
    e.preventDefault();
});