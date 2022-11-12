window.addEventListener("load", initialize);

function initialize()
{
	//getLicenses();
	displayNewVersionOrNot();
	displayHistoLogo();
	loadTranslations();
	firstLaunch();
	setEvents();
	$('#wordToSearch').focus(); 
	$('#butSearch').val(chrome.i18n.getMessage("buttonSearchText"));
	$('#legendHistory').html(chrome.i18n.getMessage("history"));
	
	usage_count = get_usage_count();
	

	if(localStorage["displayLastDefault"] == "true" && localStorage["lastWordForImmDisp"] != undefined)
	{
		
		$("#resultat").html(localStorage["lastResultHTML"]);
		translate_function_new(localStorage["lastWordForImmDisp"], localStorage["lastLanguage"], false);
		$("#fieldsetResults").show();
	}
	
	if($('#wordToSearch').val() != "" && localStorage["autoTriggerSearch"] == "true" && chck_license())
	{
		prep_for_translate();
	}
}

function displayNewVersionOrNot()
{
	if(localStorage["newVersion"+currentVersion] != "0")
	{
		localStorage["msgTempVersion"] = 1;
		localStorage["newVersion"+currentVersion] = 0;
	}
	if(localStorage["msgTempVersion"] == "0") 
	{
		$("#tmpMessageVersion").hide();
	}
}

function displayHistoLogo()
{
	if(localStorage["showHistoryOpt"] != "false")
	{
		$("#histoICO").show();
	}
}

function loadTranslations()
{
	if(localStorage["lstLangToShow"] == undefined || (localStorage["lstLangToShow"].indexOf("1") == -1 && localStorage["lstLangToShow"].indexOf("2") == -1)) // No selected languages to be shown
	{
		if(localStorage["affDefault"] == undefined || localStorage["affDefault"] == "drop")
		{
			for(var i = 0; i < langList.length; i ++)
			{
				$('#dict').append($('<option>', {
				    value:  langList[i],
				    text: chrome.i18n.getMessage(langList[i])
				}));
			}
			if(localStorage["restoreLastLanguage"] == "true")
			{
				$('#dict option[value='+localStorage["lastLanguage"]+']').attr('selected', 'selected');
			}
			$('#dropList').show();
			$('#listRadio').hide();
		}
		else
		{
			var line = true;
			$("#listRadio").html("").append(
					$('<table>').attr("id","table_translations")
			);
			var idx_col = 0;
			
			for(var i = 0; i < langList.length; i ++)
			{
				if(idx_col % 2 == 0)
				{
					$('#table_translations').append($('<tr>'));
				}
				$('#table_translations tr:last').append(
						$('<td>')
								.append(
								$('<input>')
									.attr("type","radio").attr("name","dict").attr("id", "id-"+langList[i])
									.attr("value",langList[i])
								)
								.append($('<label>').attr("for","id-"+langList[i]).html(chrome.i18n.getMessage(langList[i]))
								)
					);
				idx_col++;
			}
			if(localStorage["restoreLastLanguage"] == "true")
			{
				$('#id-'+localStorage["lastLanguage"]).attr('checked',true);
			}
			$('#dropList').hide();
			$('#listRadio').show();
		}
		
	}
	else // Some translations have been selected
	{
		var str = localStorage["lstLangToShow"];
		var lstVisibleLanguages = new Array();
		lstVisibleLanguages = str.split(",");
		
		
		if(localStorage["affDefault"] == undefined || localStorage["affDefault"] == "drop")
		{
			for(var i = 0; i < lstVisibleLanguages.length; i ++)
			{
				if(lstVisibleLanguages[i] == "1" || lstVisibleLanguages[i] == "2")
				{
					$('#dict').append($('<option>', {
					    value:  langList[i],
					    text: chrome.i18n.getMessage(langList[i])
					}));
					if(lstVisibleLanguages[i] == "2")
					{
						$('#dict option[value='+langList[i]+']').attr('selected', 'selected');
					}
				}
			}
			if(localStorage["restoreLastLanguage"] == "true")
			{
				$('#dict option[value='+localStorage["lastLanguage"]+']').attr('selected', 'selected');
			}
			$('#dropList').show();
			$('#listRadio').hide();
		}
		else
		{
			var line = true;
			$("#listRadio").html("").append(
					$('<table>').attr("id","table_translations")
			);
			var idx_col = 0;
			
			for(var i = 0; i < lstVisibleLanguages.length; i ++)
			{
				if(lstVisibleLanguages[i] == "1" || lstVisibleLanguages[i] == "2")
				{
					if(idx_col % 2 == 0)
					{
						$('#table_translations').append($('<tr>'));
					}
					$('#table_translations tr:last').append(
							$('<td>')
									.append(
									$('<input>')
										.attr("type","radio").attr("name","dict").attr("id", "id-"+langList[i])
										.attr("value",langList[i])
									)
									.append($('<label>').attr("for","id-"+langList[i]).html(chrome.i18n.getMessage(langList[i]))
									)
						);
					idx_col++;
					if(lstVisibleLanguages[i] == "2")
					{
						$('#id-'+langList[i]).attr('checked',true);
					}
						
				}
			}
			if(localStorage["restoreLastLanguage"] == "true")
			{
				$('#id-'+localStorage["lastLanguage"]).attr('checked',true);
			}
			$('#dropList').hide();
			$('#listRadio').show();
		}
		
	}
}

function firstLaunch()
{
	if(localStorage["autoFillSelect"] != "false" && localStorage["autoFillSelect"] != "true")
	{
		localStorage["autoFillSelect"] = "true"
	}
}


function setEvents()
{
	$("#wordToSearch").keypress(function(e) {
		if ( event.which == 13 ) {
		     event.preventDefault();
		     prep_for_translate();
		  }
	});
	$("#butSearch").click(function(e) {
		prep_for_translate();
	});
	$("#seeRelease").click(function(e) {
		chrome.tabs.create({url: "release.html"});
	});
	$("#seeHowTo").click(function(e) {
		chrome.tabs.create({url: "howto.html"});
	});
	$("#dontShowAgain").click(function(e) {
		$("#tmpMessageVersion").hide();
		doNotShowVersionAnymore();
	});
	$("#aBackPage").click(function(e) {
		BackPage();
	});
	$("#aForwardPage").click(function(e) {
		forwardPage();
	});
	$("#histoICO").click(function(e) {
		showSearchesHistory();
	});
	$("#optionsICO").click(function(e) {
		chrome.tabs.create({url: "options.html"});
	});
	$("#divOptionsICO").hover(
	  function() {
		    $( this ).prepend( $( "<span>Options </span>" ) );
		  }, function() {
		    $( this ).find( "span:first" ).remove();
		  }
		);
	$("#divHelpICO").hover(
			  function() {
				    $( this ).prepend( $( "<span>Help </span>" ) );
				  }, function() {
				    $( this ).find( "span:first" ).remove();
				  }
				);
	$("#divReleaseICO").hover(
			  function() {
				    $( this ).prepend( $( "<span>What's new </span>" ) );
				  }, function() {
				    $( this ).find( "span:first" ).remove();
				  }
				);
	$("#helpICO").click(function(e) {
		chrome.tabs.create({url: "howto.html"});
	});
	$("#releaseICO").click(function(e) {
		chrome.tabs.create({url: "release.html"});
	});
	
}
