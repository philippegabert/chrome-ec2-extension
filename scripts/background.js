
var context_of_menus = [ "editable", "selection", "page" ];
// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function() {
	console.log("[WRExt] Extension installed. Adding contextual menus on context ["+context_of_menus+"] ...");
	create_context_menu();
});

chrome.runtime.onStartup.addListener(function() {
	console.log("[WRExt] Extension installed. Adding contextual menus on context ["+context_of_menus+"] ...");
	create_context_menu();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	
    if (request.method == "get_fav_lang")
    {
    	 sendResponse({data: get_fav_lang()});
    }
    else if (request.method == "detect_language")
    {
    	chrome.tabs.detectLanguage(function(lang){
    		console.log(lang);
    		sendResponse({lang: lang});
    	});
    	return true;
    }
    else if (request.method == "get_langs_to_show")
    {
   	 	sendResponse({data: get_langs_to_show()});
    }
    else if (request.method == "trigger_insearch")
    {
    	var trigger_or_not = (localStorage['inSiteSearch'] != undefined ? localStorage['inSiteSearch']: "false");
    	var ctrl_key_or_not = (localStorage['inSiteSearchCtrlKey'] != undefined ? localStorage['inSiteSearchCtrlKey']: "false");
    	sendResponse({trigger_or_not: trigger_or_not, ctrl_key_or_not: ctrl_key_or_not});
    	return true;
    }
    else if(request.method == "chck_license")
	{
    	var license_chk = chck_license();
    	sendResponse({license: license_chk});
    	return true;
	}
    else if(request.method == "save_last_language")
	{
    	localStorage["lastLanguage"] = request.lang;
    	return true;
	}
    else if(request.method == "get_page")
    {
    	var xhr = new XMLHttpRequest();
    	var html;
    	xhr.open("GET", request.url, true);
    	xhr.send();
    	xhr.onreadystatechange = function() {
    		if (xhr.readyState == 4) {
    			html =  xhr.responseText;
    			sendResponse({html_received: html});
    		}
    	}
    	return true;
    }
   
});


// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
	if(info.menuItemId == "link_to_options" || (info.selectionText != undefined && info.selectionText.trim() != ""))
	{
		chrome.tabs.create({
			'url' : (info.menuItemId != "link_to_options" ? returnURLLang(info.menuItemId, info.selectionText): "options.html")
		}, function(tab) {
			// Tab opened.
		});
	}
	else
	{
		alert("Please select a word to be translated.");
	}
};

chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse) {
        if(request.type == "refresh_languages") {
        	create_context_menu();
        }
});


function create_context_menu()
{
	if(chck_license())
	{
		var cpt = 0;
		var context = "selection";
		var title = "Translate";
		var languesMenu;
		console.log("[WRExt] Removing menus (if any)...");
		chrome.contextMenus.removeAll(
			function(){
				console.log("[WRExt] Menus removed. Creating new ones...");
				var parent = chrome.contextMenus.create({
					"title" : "Translate with WordReference.com...",
					contexts : context_of_menus,
					"id" : "context_wr"
				});
				console.log("[WRExt] Parent menu",parent);
				var langsToShow = localStorage["lstLangToShow"];
				
				if(langsToShow != undefined && (langsToShow.indexOf("1") >= 0 || langsToShow.indexOf("2") >= 0))
				{
					console.log("[WRExt] Some translations have been selected");
					var lstLanguesVisibles = new Array();
					lstLanguesVisibles = langsToShow.split(",");

					var cpt = 1;
					var tmp;
					languesMenu = new Array(lstLanguesVisibles.length + 1);

					for (var i = 0; i < lstLanguesVisibles.length; i++) {
						if (lstLanguesVisibles[i] == "1" || lstLanguesVisibles[i] == "2") {
							cpt++;
							languesMenu[cpt] = langList[i];
							console.log("[WRExt] Adding menu "+langList[i]+" with parent id = "+parent);
							chrome.contextMenus.create({
								"id": langList[i],
								"title" : chrome.i18n.getMessage(langList[i]) + "...",
								"parentId" : parent,
								contexts : context_of_menus
							});
						}
					}
				} 
				else
				{	
					console.log("[WRExt] No translation selected. Showing default menu");
					chrome.contextMenus.create({
						"id": "link_to_options",
						"title" : chrome.i18n.getMessage("optionsPage"),
						"parentId" : parent,
						contexts : context_of_menus
					});
				}
			}
		);
	}
	else
	{
		console.log("[WRExt] No license found. Contextual menu not activated.");
	}
	
}
