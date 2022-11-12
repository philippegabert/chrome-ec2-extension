var currentPage = 0;
var indexCurrentPage = 0;

var searchedWords = new Array();
var searchedLangs = new Array();


function showHideNavButtons()
{
	if((indexCurrentPage - 1) < 0)
	{
		$("#imgBack").hide();
	}
	else
	{
		$("#imgBack").show();
	}
	
	if(indexCurrentPage + 1 >= currentPage)
	{
		$("#imgForward").hide();
	}
	else
	{
		$("#imgForward").show();
	}
}


function BackPage()
{
	if(indexCurrentPage - 1 >= 0)
	{
		indexCurrentPage = indexCurrentPage - 1;
		showHideNavButtons();
		translate_function_new(searchedWords[indexCurrentPage], searchedLangs[indexCurrentPage], true);
	}
	
}

function forwardPage()
{
	if(indexCurrentPage + 1 < currentPage)
	{
		indexCurrentPage = indexCurrentPage + 1;
		showHideNavButtons();
		translate_function_new(searchedWords[indexCurrentPage], searchedLangs[indexCurrentPage], true);
	}
}

function addCurrentPage()
{
	var dict;
	if(localStorage['affDefault']=='drop' || localStorage['affDefault']== undefined)
	{
		dict = $("#dict").val();
	}
	else
	{
		dict =  $("#radioForm input[type='radio']:checked").val();
	}
	searchedWords[currentPage] = $("#wordToSearch").val();
	searchedLangs[currentPage] = dict;
	
	indexCurrentPage = currentPage;
	currentPage = currentPage + 1;
}

function addSearchHistory(wordToSearch, lang)
{
	for(i=10; i > 0; i--)
	{
		window.localStorage.setItem("histo"+i, window.localStorage.getItem("histo"+(i-1)));
		window.localStorage.setItem("histoLang"+i, window.localStorage.getItem("histoLang"+(i-1)));
	}
	localStorage["histo0"] = wordToSearch;
	window.localStorage.setItem("histoLang0",lang);
}

function deleteSearchesHistory()
{
	for(i=10; i >= 0; i--)
	{
		window.localStorage.setItem("histo"+i, null);
		window.localStorage.setItem("histoLang"+i, null);
	}
	alert(chrome.i18n.getMessage("historydeleted"));
}

function showSearchesHistory()
{
	$("#txtHisto").html("");
	
	for (i = 0; i <10; i++)
	{
		var histo = window.localStorage.getItem("histo"+(i));
		var histoLang = window.localStorage.getItem("histoLang"+(i));
		
		if(histo != null && histo != "null")
		{
			$("#txtHisto")
				.append($('<a>').attr("href","#").attr("id","histo"+i).click(function(e) {
					$("#fieldsetResults").show();
					translate_function_new(localStorage[this.id],localStorage[this.id.replace("histo","histoLang")], false);
				}).append(histo + " ("+chrome.i18n.getMessage(histoLang)+")<br>"))
				;
		}

	}
	if($("#txtHisto").html() == "")
	{
		$("#txtHisto").html("<i>No history yet</i>");
	}
		
	$('#divHisto').slideToggle('fast');
}

function translate_function_new(wordToSearch, lang, from_nav_bar) {

	chk_license_lim_search(function(under_limit){
		if(!under_limit)
		{
			display_limit_usage();
			$("#remaining_searches").hide();
			return false;
		}
		else
		{
			$("#fieldsetResults").show();
			if($("#wordToSearch").val() != wordToSearch)
			{
				$("#wordToSearch").val(decodeURIComponent(wordToSearch));
			}
			increment_number_of_calls();
			
			if(!chck_license() && (parseInt(localStorage["usage_count"]) % 5 == 0))
			{
				$("#msg_didyouknow").show();
			}
			else
			{
				$("#msg_didyouknow").hide();
			}
			localStorage["lastLanguage"] = lang;
			$('#divHisto').slideUp('fast');
			if (localStorage["showHistoryOpt"] != "false")
				addSearchHistory(wordToSearch, lang);
			$("#tmpMessageVersion").hide();
			$("#imgChargement").show();
			
			var xhr = new XMLHttpRequest();
			var url = encodeURI(returnURLLang(lang, wordToSearch));
			console.log("WORD: "+wordToSearch+" -- LANG: "+lang + " -- URL: "+url);
			$("#legend_navbar").html("...");
			xhr.open("GET", url, true);
			xhr.send();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					html = $.parseHTML( xhr.responseText );
					
					var selector = getSelectorByLang(lang);
					var result = $(selector, html);
				
					// ArticleHead
					var head = $("#articleHead", html);
					head.find("#headerTabs,h3,#footerlink,#forumNotes,#WHlinks,#strAnchors,br").remove();
					// Fin ArticleHead
					
					
					if(result.text().trim() != "")
					{
						$("#resultat").html(result);
						if(head.text().trim() != "")
						{
							head.find("audio source").each(function() {
						        $(this).attr('src', url_wordreference + $(this).attr('src'));
						    });
							$("#resultat").prepend(head);
						}
						
						$("#listen_txt").click(function(){						
					        playPrononciation();
						});
						$("#accentSelection").change(function(){						
					        playPrononciation();
						});
						
						
						$("table.WRD").prop('onclick',null).off('click');
						
						$('table.WRD').click(function (e) {
						   click_on_word(lang);
						});
						
						// In case of conjug, remove the browser message:
						if(lang.indexOf("conj") >= 0)
						{
							$("#conjtable").prevAll().remove();
							$('head').append('<link rel="stylesheet" type="text/css" href="/styles/conj.css">');
						}
						else
						{
							$("link[href*='/styles/conj.css']").remove();
						}
						
						$("#postArticle").remove();
						
						$("#legend_navbar").html("").append(
								$('<a>').attr("title", "Open in new tab").attr("href", url).attr("id", "linkLegend").append($('<img>').attr("src", "/images/chromeGO.png")));
						
						$('#resultat, #legend_navbar').find('a').click(function(){
						
							if(localStorage["openLinkInNewPage"] == "true" )
							{
								var link_url = get_correct_url($(this).attr('href'), lang);
								chrome.tabs.create({url: link_url});
							}
							else
							{
								var linkhref = $(this).attr('href');
								if (linkhref.indexOf("/suggestions.aspx") >= 0 // Suggestions link. Should always been opened in new tab
										|| linkhref.indexOf("http://forum.wordreference.com/sendmessage.php") >= 0 
										|| $(this).attr("id") == "linkLegend") 
								{
									var link_url = get_correct_url(linkhref, lang);
									chrome.tabs.create({url: link_url});
								}
								else
								{
									
									var relative_trad_link_pattern = "\/([a-zA-Z]{4,6})\/(.+)"; // Find links like "/<trad>/<word>"
									var match = linkhref.toString().match(relative_trad_link_pattern);
									
									if(match != null)
									{
										translate_function_new(match[2], match[1], false);
									}
									else
									{
										get_translation_from_specific_pattern(linkhref);
									}
								}
							}
							return false;
						   });
						
						if(!chck_license())
						{
							get_lim(function(limit){
								var remaining_searches = limit - (get_usage_count());
								$("#remaining_searches").show();
								$("#remaining_searches").html(remaining_searches+ " search"+(remaining_searches > 1?"es":"")+ " remaining");
								switch(true) {
								    case (remaining_searches >= 7):
								    	$("#remaining_searches").css("color","#00CC00");
								    	break;
								    case (remaining_searches >=4 && remaining_searches < 7):
								    	$("#remaining_searches").css("color","#ff9811").css("font-weight","bold");
								        break;
								    case (remaining_searches >=0 && remaining_searches < 4):
								    	$("#remaining_searches").css("color","#FF0000").css("font-weight","bold").css("text-decoration","underline");
								        break;
								}
							});
						}
					}
					else
					{
						$('#resultat').html("")
							.append($("<div>").css("color","red").css("text-align","center").text(chrome.i18n.getMessage("noResult")).append($("<br>"))
							.append($("<div>").css("text-align","center").append($("<a>").attr("href","#").click(function(){
								chrome.tabs.create({url: "http://forum.wordreference.com/index.php"});
								 return false;
							   }).append($("<img>").attr("src","images/forum.gif")).append("<br>Have a look to the forums !")))	
							);
					}
					$("#imgChargement").hide();
					if(!from_nav_bar)
					{
						addCurrentPage();
					}
					
					if($("#msg_didyouknow").is(':visible'))
					{
						$('html,body').animate({scrollTop: $("#msg_didyouknow").offset().top});
					}
					else
					{
						$('html,body').animate({scrollTop: $("#fieldsetResults").offset().top});
					}
					
					
					$( "em.tooltip.POS2" ).hover(function() {
						var top = $(this).find("span").offset().top ;
						var left = $(this).find("span").offset().left ;
						var width = $(this).find("span").width();
						var viewport_width = $( 'body' ).width() - 15;
						if((left + width) > viewport_width)
						{
							$(this).find("span").offset({ top: top, left: (viewport_width-width-50)  });
						}
						else if(left < 0)
						{
							$(this).find("span").offset({ top: top, left: 0  });
						}
					});
					
					if(localStorage["displayLastDefault"] == "true")
					{
						saveLastResult(wordToSearch);
					}
					showHideNavButtons();
				}
			}
		}
	});
	
}

function saveLastResult(wordToSearch)
{
	localStorage["lastResultHTML"] = $("#resultat").html();
	localStorage["lastWordForImmDisp"] = wordToSearch;
}

function playPrononciation()
{
	var prononciation = new Audio($("audio[id='aud"+$("#accentSelection").val()+"']").find("source").attr("src"));
    prononciation.play();
}

function get_translation_from_specific_pattern(linkhref)
{
	var word = null;
	var lang = null;
	for (var key in urlList) {
		var url_lng = urlList[key].replace(url_wordreference,"");
		
		if(linkhref.indexOf(url_lng) == 0)
		{
			lang = key;
			word = linkhref.replace(url_lng,"");
		}
	}
	if(word == null || lang == null)
	{
		alert("Unknown link pattern !!");
	}
	else
	{
		translate_function_new(word, lang, false);
	}
}
function get_conj_link(link)
{
	if(link.toLowerCase().indexOf("/conj/fr") >= 0)
	{
		return "conjFR";
	}
	else if(link.toLowerCase().indexOf("/conj/es") >= 0)
	{
		return "conjES";
	}
	else if(link.toLowerCase().indexOf("/conj/it") >= 0)
	{
		return "conjIT";
	}
	else
	{
		alert("Ouah ! Bad error there !");
		return ;
	}
}



function click_on_word(lang)
{
	// Following code for selection taken from http://stackoverflow.com/questions/7563169/detect-which-word-has-been-clicked-on-within-a-text
	 var selection = window.getSelection();
	    if (!selection || selection.rangeCount < 1) return true;
	    var range = selection.getRangeAt(0);
	    var node = selection.anchorNode;
	 // Latin characters, accents, cyrillic chars, greek chars, chinese chars, japanese chars, korean chars
	    var word_regexp = /^[A-Za-z\u00C0-\u017F\u0430-\u044f\u0370-\u03FF\u4e00-\u9eff\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\u3131-\uD79D\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]*$/; 

	    // Extend the range backward until it matches word beginning
	    while ((range.startOffset > 0) && range.toString().match(word_regexp)) {
	      range.setStart(node, (range.startOffset - 1));
	    }
	    // Restore the valid word match after overshooting
	    if (!range.toString().match(word_regexp)) {
	      range.setStart(node, range.startOffset + 1);
	    }

	    // Extend the range forward until it matches word ending
	    while ((range.endOffset < node.length) && range.toString().match(word_regexp)) {
	      range.setEnd(node, range.endOffset + 1);
	    }
	    // Restore the valid word match after overshooting
	    if (!range.toString().match(word_regexp)) {
	      range.setEnd(node, range.endOffset - 1);
	    }

	    var word = range.toString();
	    $("#wordToSearch").val(word);
	    $("#resultat").html("");
	    
	    if(localStorage["openLinkInNewPage"] == "true" )
		{
			var link_url = returnURLLang(lang, word);
			chrome.tabs.create({url: link_url});
		}
	    else
	    {
	    	translate_function_new(word, lang, false);	
	    }
	    
}


function prep_for_translate()
{
	
	if($("#wordToSearch").val() == "")
	{
		$("#fieldsetResults").show();
		$("#resultat").html($('<div>').attr("class","div_alert").text(chrome.i18n.getMessage("enterAWordToSearch")));
	}
	else
	{
		var dict;
		if(localStorage['affDefault']=='drop' || localStorage['affDefault']== undefined)
		{
			dict = $("#dict").val();
		}
		else
		{
			dict =  $("#radioForm input[type='radio']:checked").val();
		}
		translate_function_new($("#wordToSearch").val(), dict, false);
	}
	return true;
}

chrome.tabs.executeScript( {
    code: "window.getSelection().toString().trim();"
}, function(selection) {
	  if(selection != undefined && selection[0] != undefined)
	  {
	  if(localStorage["autoFillSelect"] != "false"){
		if(selection[0] == null || selection[0] == "")
		{
			$('#wordToSearch').val("");
		}
		else
			$('#wordToSearch').val(selection[0].toLowerCase());
			
		$('#wordToSearch').focus();	
	  }}
});


function saveLstLanguagesToShow() {
	var lstLanguagesToSh = new Array();
	for (var j = 0; j < langList.length; j++) {
		
		if (!!$('#lstLanguagesToShow option[value='+langList[j]+']').length) {
			if (($('#chooseDefault').val() == langList[j]))
			{
				lstLanguagesToSh.push("2");
			}
			else
			{
				lstLanguagesToSh.push("1");
			}
		} else {
			lstLanguagesToSh.push("0");
		}
	}
	localStorage["lstLangToShow"] = lstLanguagesToSh;
	chrome.runtime.sendMessage({type: "refresh_languages"});
}

function doNotShowVersionAnymore() {
	localStorage["msgTempVersion"] = "0";
}
