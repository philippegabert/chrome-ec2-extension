window.addEventListener("load", initialize);

$.fn.extend({
    sortSelect() {
        let options = this.find("option"),
            arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value }; }).get();

        arr.sort((o1, o2) => { // sort select
            let t1 = o1.t.toLowerCase(), 
                t2 = o2.t.toLowerCase();
            return t1 > t2 ? 1 : t1 < t2 ? -1 : 0;
        });

        options.each((i, o) => {
            o.value = arr[i].v;
            $(o).text(arr[i].t);
        });
    }
});

function initialize()
{

	localizeHtmlPage();
	if(localStorage["affDefault"] == undefined || localStorage["affDefault"] == "drop")
		$('#affDefaultDrop').attr('checked',true);
	else
		$('#affDefaultRadio').attr('checked',true);

	$('#autoFillSelect').attr('checked',(localStorage["autoFillSelect"] == "true" || localStorage["autoFillSelect"] == undefined));
	$('#openLinkInNewPage').attr('checked',!(localStorage["openLinkInNewPage"] == "false" || localStorage["openLinkInNewPage"] == undefined));
	
	$('#autoTriggerSearch').attr('checked',!(localStorage["autoTriggerSearch"] == "false" || localStorage["autoTriggerSearch"] == undefined));
	$('#inSiteSearch').attr('checked',!(localStorage["inSiteSearch"] == "false" || localStorage["inSiteSearch"] == undefined));
	$('#inSiteSearchCtrlKey').attr('checked',!(localStorage["inSiteSearchCtrlKey"] == "false" || localStorage["inSiteSearchCtrlKey"] == undefined));
		
	if(!chck_license())
	{
		$('#autoTriggerSearch').attr('checked',false);
		$('#inSiteSearch').attr('checked',false);
		$('#inSiteSearchCtrlKey').attr('checked',false);
	}
	
	if(!$('#inSiteSearch').is( ":checked" ))
	{
		$('#inSiteSearchCtrlKey').attr("disabled", true);
	}
	
	$('#displayLastDefault').attr('checked',!(localStorage["displayLastDefault"] == "false"));
	$('#showHistoryOpt').attr('checked',!(localStorage["showHistoryOpt"] == "false"));
	$('#restoreLastLanguage').attr('checked',(localStorage["restoreLastLanguage"] == "true"));

	if(localStorage["restoreLastLanguage"] == "true")
	{
		$("#chooseDefault").attr("disabled","disabled");
	}
	$('#lstAllLanguages').dblclick(function() {
		var default_language = $("#chooseDefault").val();
		$("#lstAllLanguages option:selected").remove().appendTo($("#chooseDefault,#lstLanguagesToShow"));
		if(default_language != undefined && default_language != "")
		{
			$("#chooseDefault").val(default_language);
		}
		saveLstLanguagesToShow();
	});
	$('#lstLanguagesToShow').dblclick(function() {
		var opt = $("#lstLanguagesToShow option:selected").val();
		$("#lstLanguagesToShow option[value='"+opt+"']").remove().appendTo($("#lstAllLanguages"));
		$("#chooseDefault option[value='"+opt+"']").remove();
		$("#lstAllLanguages").sortSelect();
		check_in_search_prereq();
		saveLstLanguagesToShow();
	});
	$('#buttonToRight').click(function() {
		var default_language = $("#chooseDefault").val();
		$("#lstAllLanguages option:selected").remove().appendTo($("#chooseDefault,#lstLanguagesToShow"));
		if(default_language != undefined && default_language != "")
		{
			$("#chooseDefault").val(default_language);
		}
		saveLstLanguagesToShow();
	});
	$('#buttonToLeft').click(function() {
		var opt = $("#lstLanguagesToShow option:selected").val();
		$("#lstLanguagesToShow option[value='"+opt+"']").remove().appendTo($("#lstAllLanguages"));
		$("#chooseDefault option[value='"+opt+"']").remove();
		$("#lstAllLanguages").sortSelect();
		check_in_search_prereq();
		saveLstLanguagesToShow();
	});
	
	$('#restoreLastLanguage').click(function(event) {
		if($('#restoreLastLanguage').is( ":checked" ))
		{
			var r = confirm("By selecting this option, the translation that was used last will be used, not the default translation anymore.\rAre you sure you want to select this option ?");
			if (r != true) {
				event.preventDefault();
				$("#chooseDefault").removeAttr("disabled");
			}
			else
			{
				$("#chooseDefault").attr("disabled","disabled");
			}
		}
		else
		{
			$("#chooseDefault").removeAttr("disabled");
		}
		localStorage['restoreLastLanguage']= $('#restoreLastLanguage').is( ":checked" );
	});
	$('#affDefaultDrop').click(function() {
		localStorage['affDefault']='drop';
	});
	$('#affDefaultRadio').click(function() {
		localStorage['affDefault']='radio';
	});
	$('#autoFillSelect').click(function() {
		localStorage['autoFillSelect']=$('#autoFillSelect').is( ":checked" );
	});
	
	$('#openLinkInNewPage').click(function() {
		localStorage['openLinkInNewPage']=$('#openLinkInNewPage').is( ":checked" );
	});
	
	$('#autoTriggerSearch').click(function(event) {
		if(chck_license())
		{
			localStorage['autoTriggerSearch']=$('#autoTriggerSearch').is( ":checked" );
		}
		else
		{
			event.preventDefault();
			localStorage['autoTriggerSearch'] = "false";
			display_only_premium();
		}
	});
	$('#inSiteSearch').click(function(event) {
		if(chck_license())
		{
			if(lang_prereq_set())
			{
				localStorage['inSiteSearch']=$('#inSiteSearch').is( ":checked" );
				$('#inSiteSearchCtrlKey').attr("disabled", !$('#inSiteSearch').is( ":checked" ));
			}
			else
			{
				display_lang_prereq();
				event.preventDefault();
				$('#inSiteSearch').attr('checked',false);
				localStorage['inSiteSearch'] = false;
			}
		}
		else
		{
			event.preventDefault();
			localStorage['inSiteSearch'] = "false";
			display_only_premium();
		}
	});
	$('#inSiteSearchCtrlKey').click(function(event) {
		if(chck_license())
		{
			localStorage['inSiteSearchCtrlKey']=$('#inSiteSearchCtrlKey').is( ":checked" );
		}
	});
	
	$('#effacerHisto').click(function() {
		deleteSearchesHistory();
	});

	$('#showHistoryOpt').click(function() {
		 localStorage['showHistoryOpt']=$('#showHistoryOpt').is( ":checked" );
	});
	$('#displayLastDefault').click(function() {
		 localStorage['displayLastDefault']=$('#displayLastDefault').is( ":checked" );
	});
	
	$('#chooseDefault').click(function() {
		saveLstLanguagesToShow();
	});
	loadUpLanguages();
	imagePreview();
	
	if(!chck_license())
	{
		paypal_buttons();
	}
	else
	{
		$("#features_unlock").hide();
		$("#img_logo").attr("src","images/premium.png").attr("title","Premium user !");
		$("#div_img_logo").append("<br>Premium user");
		$("#fieldset_need_you_legend").css("height","205px");
		$("#fieldset_order_id").show();
		$("#order_number").html(localStorage['premium_orderid']);
	}
	
	
} 


function loadUpLanguages()
{	
	// Load up all languages
	for(var i = 0; i < langList.length; i++)
	{
		$('#lstAllLanguages').append($('<option>', {
		    value:  langList[i],
		    text: chrome.i18n.getMessage(langList[i])
		}));
	}
	// Load up selected languages
	var str = localStorage["lstLangToShow"];
	var lstLanguesVisibles = new Array();
	if(localStorage["lstLangToShow"] != null)
	{
		lstLanguesVisibles = str.split(",");
		for(var i = 0; i < lstLanguesVisibles.length; i++)
		{
			
			if(lstLanguesVisibles[i] == "1" || lstLanguesVisibles[i] == "2")
			{
				$('#lstLanguagesToShow').append($('<option>', {
				    value:  langList[i],
				    text: chrome.i18n.getMessage(langList[i])
				}));
				// Removing from the "All Languages" list
				$("#lstAllLanguages option[value='"+langList[i]+"']").remove(); 
				// Adding selected languages to the list to chose the default one.
				$('#chooseDefault').append($('<option>', {
				    value:  langList[i],
				    text: chrome.i18n.getMessage(langList[i])
				}));
				if(lstLanguesVisibles[i] == "2")
				{
					$('#chooseDefault option[value='+langList[i]+']').attr('selected', 'selected');
				}
			}
		}
	}
	$("#lstAllLanguages").sortSelect();
}

/* FUNCTION TAKEN FROM http://cssglobe.com/lab/tooltip/02/ */
function imagePreview(){	
	/* CONFIG */
		
		xOffset = 10;
		yOffset = 30;
		
		// these 2 variable determine popup's distance from the cursor
		// you might want to adjust to get the right result
		
	/* END CONFIG */
	$(".preview").hover(function(e){
		this.t = this.title;
		$("body").append("<p id='preview'><img src='images/ex_"+ this.title +".png' alt='Image preview' /></p>");								 
		$("#preview")
			.css("top",(e.pageY - xOffset) + "px")
			.css("left",(e.pageX + yOffset) + "px")
			.fadeIn("fast");						
    },
	function(){
		this.title = this.t;	
		$("#preview").remove();
    });	
	$(".preview").mousemove(function(e){
		$("#preview")
			.css("top",(e.pageY - xOffset) + "px")
			.css("left",(e.pageX + yOffset) + "px");
	});			
};

function display_only_premium()
{
	alert("This option is only available to premium users.");
}

function lang_prereq_set()
{
	return ($("#chooseDefault").val() != null || $('#restoreLastLanguage').is( ":checked" ));
}

function check_in_search_prereq()
{
	console.log("check_in_search_prereq", lang_prereq_set());
	if(!lang_prereq_set())
	{
		$('#inSiteSearch').prop('checked', false);
	}
}
function display_lang_prereq()
{
	alert("In order to work, the \"in-site\" search needs to have either:\n- One default language selected or\n- The option \""+chrome.i18n.getMessage("autoshowlasttranslation").replace("<br>"," ")+"\" selected.");
	
	var cnt = 0;
	var select = $("#chooseDefault");
    var timer = setInterval(function () {
        cnt++
        if (cnt == 10) {
        	select.css('border', '1px solid rgb(169, 169, 169)');
            clearInterval(timer);
        } else {
            cnt % 2 == 1 ? select.css('border', '2px solid #ff9811') : select.css('border', '1px solid rgb(169, 169, 169)');
        }
    }, 200);
    
}
