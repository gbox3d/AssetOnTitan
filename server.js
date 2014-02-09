/**
 * Created by gbox3d on 2013. 12. 12..
 */

var node_module_path = '/usr/local/lib/node_modules/';
var http = require('http');
var UrlParser = require('url');
var child_proc = require('child_process');
var checklist_module = require('./node_modules/checklist');

//파라메터값처리
var gPort = 58090;

var custom_port = process.argv[2];

if(custom_port) {
    gPort = custom_port;
}



//콘솔로 출력된 결과값을 응답으로 넘겨줌
function response_console_result(res, stdout, stderr) {

    var strTemp = stdout;
    console.log(stdout);

    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Max-Age': '1000'
    });

    //stdout 출력
    var strTemps = strTemp.split('\n');

    var strOut = '[';

    strTemps.forEach(function(item,i){

        strOut += '"' + item + '",';

    });

    strOut += '"endof"]';


    //stderr 출력
    var strErrs = stderr.split('\n');

    var strErr = '[';
    strErrs.forEach(function(item,i){

        strErr += '"' + item + '",';

    });

    strErr += '"endof"]';


    var result_str = '{"result" : "success","stdout" : ' +  strOut + ',"stderr" : ' + strErr +' }';

    console.log(result_str);


    res.end(
        result_str
    );

}

http.createServer(function (req, res) {

    console.log('request received');

    var result = UrlParser.parse(req.url,true);

    //console.log(req.url);
    //console.log(result);
    //console.log(req.method);

    if(result.pathname == '/update_svn') {

        console.log(result.query);

        child_proc.exec('svn update', function(err, stdout, stderr) {

            response_console_result(res,stdout,stderr);

        });

    }
    else if(result.pathname == '/config_upgrade') {

        checklist_module.update_checklist({
            src_dir:'repo',
            mode : 'upgrade',
            complete : function(evt) {
                if(evt.result == 'ok') {
                    response_console_result(res,evt.msg,'');
                }
                else
                {
                    response_console_result(res,evt.msg,'error');
                }

            }
        });

//        child_proc.exec('node config.js dev upgrade', function(err, stdout, stderr) {
//
//            response_console_result(res,stdout,stderr);
//        });

    }
    else if(result.pathname == '/config_reset') {

        checklist_module.update_checklist({
            src_dir:'repo',
            mode : 'reset',
            complete : function(evt) {
                if(evt.result == 'ok') {
                    response_console_result(res,evt.msg,'');
                }
                else
                {
                    response_console_result(res,evt.msg,'error');
                }



            }
        });

//        child_proc.exec('node config.js dev reset', function(err, stdout, stderr) {
//
//            response_console_result(res,stdout,stderr);
//        });

    }
    else {
        res.writeHead(200, {
            //'Content-Type': 'application/json'
            'Content-Type': 'text/plain'
            //'Access-Control-Allow-Origin': '*',
            //'Access-Control-Allow-Methods': 'POST',
            //'Access-Control-Max-Age': '1000'
        });

        res.end(
            'updater control server v 0.11'
        );

    }

}).listen(gPort);

console.log('running at port :' + gPort);

//////////////////////////////////////////
//정적 웹서버
var connect = require(node_module_path + 'connect');
connect.createServer(connect.static(__dirname)).listen(gPort + 1);

console.log('start static webserver at '+ gPort + 1)