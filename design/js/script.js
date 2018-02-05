window.scrollTo(0, 0);

function resetHomepagePhoto() {
	if($(window).outerWidth() <= 800) {
		$('.image').each(function() {
			$(this).attr("src", $(this).attr("src").replace("2x", ""));
		});
	} else {
		$('.image').each(function() {
			var src = $(this).attr("src");

			if (src.indexOf('2x') === -1) {
				$(this).attr("src", $(this).attr("src").replace(".jpg", "2x.jpg"));
			}
		});			
	}
}

function setSectionMarginTop(marginTop) {
	var navbarH = $('.navbar').height();
	var marginTop = $('.jumbotron').outerHeight() + navbarH;
	$('.section:nth-child(3)').css('margin-top', marginTop);	
}

function setFooterBottom() {
	var bottom = $('html').height();
	var windowH = $(window).height();

	if (windowH > bottom) {
		$('.footer').css('top', windowH - bottom);
	} else {
		$('.footer').css('top', 0);
	}
}


// navbar
if ($('.homepage').length) {
	resetHomepagePhoto();

	$(window).resize(function() {
		resetHomepagePhoto();
	});

	$(window).bind('scroll', function () {
		var top = $('.section-investments').offset().top;

	    if ($(window).scrollTop() > top) {
	        $('.navbar').addClass('fixed');
	    } else {
	        $('.navbar').removeClass('fixed');
	    }
	});

	var marginBottom = $('.member').css('margin-bottom');

	if (marginBottom === '0px') {
		var marginLeft = $('.member:nth-child(2)').css('margin-left');
		$('.member:nth-child(1)').css('margin-bottom', marginLeft);
		$('.member:nth-child(2)').css('margin-bottom', marginLeft);
	}
	

} else if (top.location.pathname.indexOf('/contact') === -1) {
	setSectionMarginTop();
	
	$(window).resize(function() {
		setSectionMarginTop();
	});

	var navbarH = $('.navbar').height();
	var marginTop = $('.jumbotron').outerHeight() + navbarH;
	var windowH = $(window).height();

	if (marginTop > windowH) {
		var dis = marginTop - windowH;
		
		$(window).bind('scroll', function () {
			
			if ($(window).scrollTop() > dis) {
				$('.jumbotron').css('position', 'fixed');
				$('.jumbotron').css('top', -dis);
			} else {
				$('.jumbotron').css('position', 'relative');
				$('.jumbotron').css('top', navbarH);
			}
		});
	}
} else {
	setFooterBottom();

	$(window).resize(function() {
		setFooterBottom();
	});
}

$('.icon-menu').click(function() {
	$('.navbar-nav').addClass('show');
	$('.icon-close').addClass('show');
});

$('.icon-close').click(function() {
	$('.navbar-nav').removeClass('show');
	$('.icon-close').removeClass('show');
});

// team
if (top.location.pathname.indexOf('/team') !== -1) {

	// team: first make pictures on screen visible
	$('.team .section .item').each(function(i){
		var top_of_object = $(this).offset().top;
		var bottom_of_window = $(window).scrollTop() + $(window).height();
		            
		if( bottom_of_window > top_of_object ){
		    $(this).animate({'opacity': '1'}, 500 + 200 * (i%4));
		}
	}); 

	$(window).bind('scroll', function () {
		$('.team .section .item').each(function(i) {
		    var top_of_object = $(this).offset().top;
		    var bottom_of_window = $(window).scrollTop() + $(window).height();
		            
		    if( bottom_of_window > top_of_object ){
		        $(this).animate({'opacity': '1'}, 500 + 200 * (i%4));
		    }
		}); 
	});

	$('.team .section .item').click(function() {
		var isManagement = $(this).parents().parents().parents().hasClass('section-management');
		var section = isManagement ? 'management' : 'advisors';
		var index = $('.team .section-' + section + ' .item').index(this);

		$('.team .section-' + section + ' .detail').css('display', 'none');
		$('.team .section-' + section + ' .detail').eq(index).show().css({'opacity': '0', 'display': 'flex'}).animate({'opacity': '1'}, 800);
		var navbarHeight = $('.navbar').height();
		$('html, body').animate({scrollTop: $('.team .section-' + section).offset().top - navbarHeight}, 1200, 'swing');
	});
}
