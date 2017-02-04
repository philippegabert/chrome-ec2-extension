eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('1 2=["\\8\\9\\7\\b\\6\\4\\3\\5\\a\\i\\c\\j\\h\\g\\d\\e"];1 f=2[0]',20,20,'|var|_0xbef4|x54|x21|x5D|x37|x23|x4E|x3A|x24|x3B|x6E|x7B|x28|pp|x62|x67|x27|x75'.split('|'),0,{}))


function save_options() {
	var default_region = $("#ec2_regions").val();
	var accessKeyId = $("#accessKeyId").val();
	var secretAccessKey = $("#secretAccessKey").val();
	var intervalFetchRunning = $("#intervalFetchRunning").val();
	eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('b 2=["\\c\\9\\7\\8\\a\\f\\h","\\g\\d\\e"];3=5[2[1]][2[0]](3,4);6=5[2[1]][2[0]](6,4)',18,18,'||_0xb95e|accessKeyId|pp|CryptoJS|secretAccessKey|x63|x72|x6E|x79|var|x65|x45|x53|x70|x41|x74'.split('|'),0,{}));

	chrome.storage.sync.set({
		default_region : default_region,
		accessKeyId : accessKeyId,
		secretAccessKey : secretAccessKey,
		intervalFetchRunning: intervalFetchRunning
	}, function() {
		// Update status to let user know options were saved.
		$("#status").css("color", "#000000").text('Options saved.');
		setTimeout(function() {
			$("#status").text('');
		}, 1000);
	});
}

function set_option_page()
{
	restore_options();
	$("#save").click(function() {
    	save_options();
    })
    $("#chk_options").click(function() {
    	chk_options();
    })
}

function chk_options()
{
	$("#loading_pic").show();
	var creds = new AWS.Credentials({
		  accessKeyId: $("#accessKeyId").val(), 
		  secretAccessKey: $("#secretAccessKey").val()
	});
	AWS.config.credentials = creds;
	var iam = new AWS.IAM();
	iam.getUser({}, function(err, data) {
		if (err)
		{
			console.error("[EC2Mgt] An error occured while fetching account details ["+err.toString()+"]");
			$("#status").css("color", "#FF0000");
			$("#status").html("Error ! An error occured while fetching account details ["+err.toString()+"]");
			$("#loading_pic").hide();
		}
		else
		{
			console.log("[EC2Mgt] User information successfully fetched. ["+data.User.UserId + " / "+data.User.UserName+"]");
			$("#status").css("color", "#00CC00");
			$("#status").html("Yup, it works ! <br>Account ID: <b>"+data.User.UserId + "</b><br>Account User name: <b>"+data.User.UserName+ "</b>");
			$("#loading_pic").hide();
		}
	});
}

function restore_options() {
	chrome.storage.sync.get({
		default_region : 'eu-west-1',
		accessKeyId: '',
		secretAccessKey: '', 
		intervalFetchRunning: 30
	}, function(items) {
		$("#ec2_regions").val(items.default_region);
		$("#intervalFetchRunning").val(items.intervalFetchRunning);
		$("#ec2_regions").niceSelect();
		eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('u 9=["\\8\\v\\a","\\i\\a\\a\\8\\b\\b\\d\\8\\c\\k\\h","\\h\\8\\a\\g\\c\\t\\f","\\j\\s\\q","\\r\\i\\w","\\n\\i\\a\\a\\8\\b\\b\\d\\8\\c\\k\\h","\\b\\8\\a\\g\\8\\f\\j\\a\\a\\8\\b\\b\\d\\8\\c","\\n\\b\\8\\a\\g\\8\\f\\j\\a\\a\\8\\b\\b\\d\\8\\c"];$(9[5])[9[4]](e[9[3]][9[2]](l[9[1]],p).o(e[9[0]].m));$(9[7])[9[4]](e[9[3]][9[2]](l[9[6]],p).o(e[9[0]].m))',33,33,'||||||||x65|_0xf911|x63|x73|x79|x4B|CryptoJS|x74|x72|x64|x61|x41|x49|items|Utf8|x23|toString|pp|x53|x76|x45|x70|var|x6E|x6C'.split('|'),0,{}));
	});
}

document.addEventListener('DOMContentLoaded', set_option_page);