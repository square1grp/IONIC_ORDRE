jQuery(document).ready(function($) {
	var slider = document.getElementsByClassName('my-slider');
	if(slider.length > 0){
		$('.my-slider').unslider({
			animation: 'vertical',
			autoplay: false,
			infinite: true
		});
	}
	if(slider.length > 0){
		setTimeout(function() {
	 		$('.my-slider').css('min-height',$(window).height()-55)
		}, 500);
	}

	var fe_content = $('#fe_section');
	if(fe_content.length > 0){
			fe_content.css('min-height',$(window).height()-($('.ordre_header')[0].clientHeight + $('.ordre_subheader')[0].clientHeight + 5))
	}

	var ord_sidebar = $('.orders_sidebar');
	if(ord_sidebar.length > 0){
			ord_sidebar.css('min-height',$(window).height()-($('.ordre_header')[0].clientHeight + $('.ordre_subheader')[0].clientHeight + 6))
	}
	var set_sidebar = $('.settings_sidebar');
	if(set_sidebar.length > 0){
			set_sidebar.css('min-height',$(window).height()-($('.ordre_header')[0].clientHeight + $('.ordre_subheader')[0].clientHeight + 6))
	}
	$(document).on('click','.draft_requested_list > p',function(){
		var bl = $(this).attr('block');
		$('.draft_requested_list > p').removeClass('active');
		$(this).addClass('active');
		$('.ordres_list').hide();
		$('.ordres_list.'+bl).show();
	});

	$(document).on('click','.settings_list ul > li',function(){
		var bl = $(this).attr('block');
		$('.settings_list > .downloaded').removeClass('active');
		$(this).closest( "div" ).addClass('active');
		$(this).parent().find('.li_active').removeClass('li_active');
		$(this).addClass('li_active');
		$('.settings_item').hide();
		$('.settings_item.'+bl).show();
	});
	$(document).on('click','.settings_list > .downloaded',function(){
		var bl = $(this).attr('block');
		$('.settings_list > .syncing').removeClass('active');
		$(this).addClass('active');
		$('.settings_list > .syncing').find('.li_active').removeClass('li_active');
		$('.settings_item').hide();
		$('.settings_item.'+bl).show();
	});

});