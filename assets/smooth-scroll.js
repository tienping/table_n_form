function initializeSmoothScroll(offsetValue) {
    // Select all links with @@
    $('a[href*="@@"]')
    .click(function(event) {
        var value = this.pathname.replace(/^\//, '');
        if (value[0] == '@' && value[1] == '@') {
            var target = $('#' + value.replace('@@', ''));
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top - offsetValue
                }, 1000, function() {
                    // Callback after animation
                    // Must change focus!
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) { // Checking if the target was focused
                        return false;
                    } else {
                        $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
                        $target.focus(); // Set focus again
                    };
                });
            }
        }
    });
}