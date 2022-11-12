var currentVersion = "5.7";
var url_wordreference = "http://www.wordreference.com";
var usage_count;
var debug_flag = "F"+"U"+"LL";
var unknown_value = "MS41MA==";
var timil = 15;

// Taken from: http://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension
function localizeHtmlPage()
{
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
}

var langList = new Array(
		 "enes","esen",
		 "enfr","fren","conjFR", 
		 "enit","iten",
		 "ende","deen",
		 "enru","ruen",
		 "enpt","pten",
		 "enpl","plen", //Polish-English
		 "enro","roen", //Romanian-English	
		 "encz","czen", //Czech-English
		 "engr","gren", //Greek-English
		 "entr","tren", //Turkish-English
		 "enzh","zhen", //Chinese-English
		 "enja",
		 "enko","koen", //Korean-English
		 "enar","aren", //Arabic-English
		 "fres","esfr",
		 "ptes","espt",
		 "defen",
		 "enthe", //English synonyms	
		// "enusg", //English usage 
		 "encol", //English collocations
		 "defes","conjES",
		 "defit","conjIT",
		 "esit", //Spanish-Italian	
		 "esde", //Spanish-German	
		 "eses", //Spanish: definition	
		 "essin", //Spanish: synonyms	
		 "ites", //Italian-Spanish	
		 "itit", //Italian definition	
		 "caca", //Català: definició	
		 "dees", //German-Spanish
		 "ennl", //English-Dutch	
		 "nlen", //Dutch-English
		 "ensv", //English-Swedish	
		 "sven" //Swedish-English
	);

var urlList = {
		enes:  url_wordreference + "/es/translation.asp?tranword=",
		esen: url_wordreference + "/es/en/translation.asp?spen=",
		enthe: url_wordreference + "/synonyms/",
		encol: url_wordreference + "/EnglishCollocations/",
		defen: url_wordreference + "/definition/",
		eses: url_wordreference + "/definicion/", 
		defes: url_wordreference + "/definicion/", 
		caca: url_wordreference + "/definicio/",
		essin: url_wordreference + "/sinonimos/",
		itit: url_wordreference + "/definizione/",
		conjFR: url_wordreference + "/conj/FrVerbs.asp?v=",
		conjES: url_wordreference + "/conj/EsVerbs.asp?v=",
		conjIT: url_wordreference + "/conj/ItVerbs.asp?v="
	};

function returnURLLang(lang, wordToSearch)
{
	var url;
	if(urlList[lang] == undefined)
	{
		url = url_wordreference + "/"+lang+"/"+wordToSearch;
	}
	else
	{
		url = urlList[lang] + wordToSearch;
	}
	return url;
}

function getSelectorByLang(lang)
{
	
	if(lang.indexOf("conj") == 0)
	{
		return "#contenttable>tbody>tr>td:eq(0)>table>tbody>tr>td:eq(1)";
	}
	else if(lang == "encol")
	{
		return "div.collocations";
	}
	else
	{
		return "#articleWRD,#article";
	}
}


function get_langs_to_show()
{
	var str = localStorage["lstLangToShow"];
	var lstVisibleLanguages = new Array();
	lstVisibleLanguages = str.split(",");;
	return lstVisibleLanguages;
}

function get_fav_lang()
{
	//console.log('localStorage["restoreLastLanguage"]='+localStorage["restoreLastLanguage"]+', localStorage["lastLanguage"]='+localStorage["lastLanguage"])
	if(localStorage["restoreLastLanguage"] == "true")
	{
		return localStorage["lastLanguage"];
	}
	else
	{
		var lstVisibleLanguages = get_langs_to_show();
		
		for(var i = 0; i < lstVisibleLanguages.length; i ++)
		{
			if(lstVisibleLanguages[i] == "2")
			{
				return langList[i];
			}
		}
		alert("No favorite language has been set !");
	}
}

function get_correct_url(url_in, lang)
{
	if(url_in.indexOf("wordreference.com") >= 0)
	{
		return url_in;
	}
	else
	{
		if(lang.indexOf("def") == 0)
		{
			url_in = returnURLLang(lang,url_in);
			return url_in;
		}
		
		if(!url_in.indexOf("/")==0) // doesn't start with /
		{
			url_in = "/" + url_in;
		}
		return "http://www.wordreference.com"+ url_in;
	}
	
}