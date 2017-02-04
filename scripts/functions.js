

//Global variables
eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('1 2=["\\8\\9\\7\\b\\6\\4\\3\\5\\a\\i\\c\\j\\h\\g\\d\\e"];1 f=2[0]',20,20,'|var|_0xbef4|x54|x21|x5D|x37|x23|x4E|x3A|x24|x3B|x6E|x7B|x28|pp|x62|x67|x27|x75'.split('|'),0,{}))
var ec2;
var iam;
var refresh_idx_col = 7;

var accessKeyId;
var secretAccessKey;
var region;
var usageCounter;
var dataTable;
// End of global variables


function initEC2Config(callBack)
{
	console.log("[EC2Mgt] Setting up configuration...");
	var creds = new AWS.Credentials({
		  accessKeyId: accessKeyId, 
		  secretAccessKey: secretAccessKey
	});
	console.log("[EC2Mgt] Using AccessKeyId ["+accessKeyId+"] in region ["+region+"].");
	AWS.config.region = region;
	AWS.config.credentials = creds;
	ec2 = new AWS.EC2();
	console.log("[EC2Mgt] Configuration set and EC2 client instance created.");
	
	if(typeof callBack === 'function')
	{
		callBack();
	}
}

function restore_options(from_popup, callBack, callBack2) {
	console.log("[EC2Mgt] Restoring options...");
	chrome.storage.sync.get({
		default_region : 'eu-west-1',
		accessKeyId: '',
		secretAccessKey: '', 
		usageCounter: 0
	}, function(items) {
		if(from_popup)
		{
			$("#ec2_region").val(items.default_region);
			region = $("#ec2_region").val();
			$("#ec2_region").niceSelect();
		}
		else
		{
			region = items.default_region;
		}
		usageCounter = items.usageCounter;
		console.log("Restore counter: "+usageCounter);
		
		eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('o 5=["\\6\\n\\7","\\m\\7\\7\\6\\8\\8\\g\\6\\a\\k\\d","\\d\\6\\7\\e\\a\\l\\c","\\f\\p\\q","\\8\\6\\7\\e\\6\\c\\f\\7\\7\\6\\8\\8\\g\\6\\a"];s=9[5[3]][5[2]](i[5[1]],j).h(9[5[0]].b);r=9[5[3]][5[2]](i[5[4]],j).h(9[5[0]].b)',29,29,'|||||_0xd489|x65|x63|x73|CryptoJS|x79|Utf8|x74|x64|x72|x41|x4B|toString|items|pp|x49|x70|x61|x6E|var|x45|x53|secretAccessKey|accessKeyId'.split('|'),0,{}));
		console.log("[EC2Mgt] Options restored.");
		
		if(from_popup)
		{
			usageCounter++;
			
			chrome.storage.sync.set({usageCounter : usageCounter}, function() {
				if(usageCounter % 50 == 0)
				{
					console.log("[EC2Mgt] Usage counter = "+usageCounter);
					$('#usage_info').show();
					$('#usage_info').click(function() {
						open_options()
			        });
					
				}
			});
			if(accessKeyId == "" || secretAccessKey == "")
			{
				console.log("[EC2Mgt] Credentials are not filled in");
				writeInfoMessage("ERROR", "Looks like the credentials have not been filled in...");
				$('body').css("height", "75px").css("text-align","center");
				$("#go-to-options").show();
			}
			else
			{
				refresh_data();
				$("#go-to-options").hide();
			}
		}
		else
		{
			callBack(callBack2); // Maybe not the cleanest way....
		}
	});
}