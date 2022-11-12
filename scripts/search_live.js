//Simple JQuery Draggable Plugin
//https://plus.google.com/108949996304093815163/about
(function($) {
 $.fn.drags = function(opt) {

     opt = $.extend({
         handle: "",
         cursor: "move",
         draggableClass: "draggable",
         activeHandleClass: "active-handle",
         cancel: 'a,input,textarea,button,select,option'
     }, opt);

     var $selected = null;
     var $elements = (opt.handle === "") ? this : this.find(opt.handle);

     $elements.css('cursor', opt.cursor).on("mousedown", function(e) {
         var elIsCancel = e.target.nodeName ? $(e.target).closest(opt.cancel).length : false;

         if(opt.handle === "") {
             $selected = $(this);
             $selected.addClass(opt.draggableClass);
         } else {
             $selected = $(this).parent();
             $selected.addClass(opt.draggableClass).find(opt.handle).addClass(opt.activeHandleClass);
         }

         if (elIsCancel){
             // cancel drag if user started on a cancel element
             return true;
         }

         var drg_h = $selected.outerHeight(),
             drg_w = $selected.outerWidth(),
             pos_y = $selected.offset().top + drg_h - e.pageY,
             pos_x = $selected.offset().left + drg_w - e.pageX;
         $(document).on("mousemove", function(e) {
             $selected.offset({
                 top: e.pageY + pos_y - drg_h,
                 left: e.pageX + pos_x - drg_w
             });
         }).on("mouseup", function() {
             $(this).off("mousemove"); // Unbind events from document
             if ($selected !== null && $selected != undefined) {
                 $selected.removeClass(opt.draggableClass);
                 $selected = null;
             }
         });
         e.preventDefault(); // disable selection
     }).on("mouseup", function() {
         if(opt.handle === "") {
        	 if(($selected !== null && $selected != undefined))
             {
        		 $selected.removeClass(opt.draggableClass);
             }
         } else {
        	 if($selected !== null && $selected != undefined)
    		 {
        		 $selected.removeClass(opt.draggableClass).find(opt.handle).removeClass(opt.activeHandleClass);
    		 }
            
         }
         $selected = null;
     });

     return this;

 };
})(jQuery);

var elem_triggered = ["input","textarea"];

$('body').dblclick(function(evt) {
	
		
	chrome.runtime.sendMessage({method: "trigger_insearch"}, function(response) {
		
		var trigger_or_not = response.trigger_or_not;
		var ctrl_key_or_not = response.ctrl_key_or_not;
		if(trigger_or_not == "true")
		{
			if(ctrl_key_or_not != "true" || (ctrl_key_or_not == "true" && (evt.ctrlKey || evt.metaKey) ))
			{
				if ( ! $(evt.target).parents("#tooltipwr_1ngedcGVWIMxCCR").length )
				{
					if(elem_triggered.indexOf(evt.target.nodeName.toLowerCase()) == -1)
					{
						chrome.runtime.sendMessage({method: "chck_license"}, function(resp_license) {
							if(resp_license.license)
							{
							//	chrome.runtime.sendMessage({method: "detect_language"}, function(response) {
									//console.log("[WRExt] Detected language: "+response.lang);
									trigger_search_dbl_click(evt);
							//	});
							}
						});
					}
				}
			}
		}
	});
});


function trigger_search_dbl_click(evt)
{
	var lang;
	chrome.runtime.sendMessage({method: "get_fav_lang"}, function(response) {
		var searchWord = getSelectionText();
		console.log("searchWord: "+searchWord);
		if(searchWord != "")
		{
			createTooltip(evt, getSelectionText(), response.data);
		}
	});
}

function getSelectionText() {
	
    var text = "";
    if(window.location.hostname == "docs.google.com")
	{
    	var googleDocument = googleDocsUtil.getGoogleDocument();
    	text = googleDocument.selectedText;
	}
    else
    {
    	if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        } 
    }
    
    return text.trim();
}


function createTooltip(event, word, lang){         
    $('<div id="tooltipwr_1ngedcGVWIMxCCR">Loading...</div>').appendTo('body');
    search_light(word, lang);
    positionTooltip(event);       
};
function positionTooltip(event){
    var tPosX = event.pageX;
    var tPosY = event.pageY;


    if ((window.innerWidth-20) > 600)
	{
    	if((tPosX+600) > (window.innerWidth-20))
    	{
        	tPosX = event.pageX - 600;
    	}
    	if(tPosX < 0)
		{
    		tPosX = 0;
		}
	}
    else
	{
    	tPosX = 0;
	}
    if((event.clientY + 300) > window.innerHeight)
    {
    	tPosY = event.pageY - 300;
    	if(tPosY < 0)
		{
    		tPosY = 0;
		}
    }
    $('div#tooltipwr_1ngedcGVWIMxCCR').css({'top': tPosY, 'left': tPosX});
    $('div#tooltipwr_1ngedcGVWIMxCCR').show();
    $(document).keydown(function(e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
        	 $('div#tooltipwr_1ngedcGVWIMxCCR').remove();
        }
    });
   
    $(document).on('click', function (e) {
    	if ( !($(e.target).parents("#tooltipwr_1ngedcGVWIMxCCR").length) ) {
            $("div#tooltipwr_1ngedcGVWIMxCCR").remove();
        }
    });
    
    $('div#tooltipwr_1ngedcGVWIMxCCR').drags();
  
};


function search_light(wordToSearch, lang)
{
	var url =  encodeURI(returnURLLang(lang, wordToSearch));
	
	chrome.runtime.sendMessage({method: "save_last_language", lang: lang}, function(response) {
		console.log("[WRExt] Saving last language used ("+lang+")");
	});
	chrome.runtime.sendMessage({method: "get_page", url: url}, function(response) { // Mandatory to use sendmessage to get the data to avoid HTTP/HTTPS different domains
		var html = $.parseHTML(response.html_received); 
			
		var result = $(getSelectorByLang(lang), html);
		if(result.text().trim() != "")
		{
			$('div#tooltipwr_1ngedcGVWIMxCCR').html(result);
			$("div#tooltipwr_1ngedcGVWIMxCCR > table.WRD").prop('onclick',null).off('click');
			
			 // In case of conjug, remove the browser message:
			if(lang.indexOf("conj") >= 0)
			{
				$("div#tooltipwr_1ngedcGVWIMxCCR").find("#browserInfo").prev().remove();
				$("div#tooltipwr_1ngedcGVWIMxCCR").find("#browserInfo").remove();
			}
			
			$('div#tooltipwr_1ngedcGVWIMxCCR').find('a').click(function(){
				var link_url = get_correct_url($(this).attr('href'), lang);
				 $(this).attr('href', link_url);
				 $(this).attr('target', "_blank");
				//chrome.tabs.create({url: link_url});
			});
			$("div#tooltipwr_1ngedcGVWIMxCCR > #postArticle").remove();
		}
		else
		{
			$('div#tooltipwr_1ngedcGVWIMxCCR').html("")
				.append($("<div>").css("color","red").css("text-align","center").text(chrome.i18n.getMessage("noResult")).append($("<br>"))
				.append($("<div>").css("text-align","center").append($("<a>").attr("href","#").click(function(){
					chrome.tabs.create({url: "http://forum.wordreference.com/index.php"});
					 return false;
				   }).append($("<img>").attr("src",chrome.extension.getURL("/images/forum.gif"))).append("<br>Have a look to the forums !")))	
				);
		}
	    $('div#tooltipwr_1ngedcGVWIMxCCR').prepend('<a id="close_wr_popup" class="close-thik"></a>');
	    
	    // Build up select for fav languages
	    
	    var select_languages = $('<select>').attr("id", "select_lang_1ngedcGVWIMxCCR");

	    chrome.runtime.sendMessage({method: "get_langs_to_show"}, function(response) {
	    	var lstVisibleLanguages = response.data;
			for(var i = 0; i < lstVisibleLanguages.length; i ++)
			{
				if(lstVisibleLanguages[i] == "1" || lstVisibleLanguages[i] == "2")
				{
					select_languages.append($('<option>', {
					    value:  langList[i],
					    text: chrome.i18n.getMessage(langList[i])
					}));
					if(langList[i] == lang)
					{
						$('#select_lang_1ngedcGVWIMxCCR option[value='+langList[i]+']').attr('selected', 'selected');
					}
				}
			}	
	    });
	    
	    // End of build up
	    var header = $('<div>').attr("id","header_light_search_wr")
	    					 .html("Word: <b>"+wordToSearch+"</b> - Translation: ")
	    					 .append(select_languages)
	    					 .append(" - ")
	    					 .append($("<a>")
	    						.attr("href", url)
	    						.attr("target", "_blank")
	    						.text("Open in a new tab"));
	    $('div#tooltipwr_1ngedcGVWIMxCCR').prepend(header);
	    $('div#tooltipwr_1ngedcGVWIMxCCR .tooltip').removeClass( "tooltip" ).addClass( "tooltip_wrext_oPZagJS0GdO4mY3" ); //Let's give it a random name 
	   
	    if(lang.indexOf("conj") >= 0)
		{
			$("div#tooltipwr_1ngedcGVWIMxCCR table").css("width","initial");	
		}

	    $("#close_wr_popup").click(function(){
	    	$('div#tooltipwr_1ngedcGVWIMxCCR').remove();
	    });
	    $("#select_lang_1ngedcGVWIMxCCR" ).change(function() {
	    	$("#tooltipwr_1ngedcGVWIMxCCR").html("Loading...");
	    	search_light(wordToSearch, $(this).val());
    	});
	});
}