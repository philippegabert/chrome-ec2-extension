

//Global variables
var pp = "N:#;7!T]$\'nugb{("

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

		var _0xd489 = ["enc", "accessKeyId", "decrypt", "AES", "secretAccessKey"];
		accessKeyId = CryptoJS[_0xd489[3]][_0xd489[2]](items[_0xd489[1]], pp).toString(CryptoJS[_0xd489[0]].Utf8);
		secretAccessKey = CryptoJS[_0xd489[3]][_0xd489[2]](items[_0xd489[4]], pp).toString(CryptoJS[_0xd489[0]].Utf8)
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
