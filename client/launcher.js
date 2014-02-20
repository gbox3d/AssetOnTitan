/**
 * Created with JetBrains WebStorm.
 * User: gbox3d
 * Date: 13. 6. 4.
 * Time: 오후 4:23
 * To change this template use File | Settings | File Templates.
 */

/*

타이탄업데이터 클라이언트 싸이드모듈 for cordova 3.3

폰갭기반의 함수셋을 사용한 버전

 */


var AppLauncher = {
    version : "1.0",
    Updater : {
        fullPath : ''
    }
};

AppLauncher.Init = function(option) {

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
        function (fileSystem) { //success


            console.log('success get file system');

            AppLauncher.filesystem = fileSystem;

            if(option.successCB) {


                option.successCB(fileSystem);

            }


        },
        function(event) { //failed
            console.log('failed get file system');
            console.log(event.target.error.code);

            if(option.errorCB) {

                option.errorCB(event);

            }
        }

    );
}

AppLauncher.readConfig = function(option)
{
    AppLauncher.filesystem.root.getDirectory(
        option.repo_path,
        {create: true},   //없으면 만들기
        function(dir_entry) {

            AppLauncher.Updater.fullPath =  dir_entry.fullPath;
            //console.log(AppLauncher.Updater.fullPath);

            dir_entry.getFile(
                "setup.json",
                {create: true, exclusive: false},
                function(fileEntry) { //파일이 얻어지면

                    AppLauncher.configFileEntry = fileEntry;

                    fileEntry.file(function(file) {

                        if(file.size > 0) {

                            console.log('read config file');

                            var reader = new FileReader();

                            reader.onload = function(evt) {

                                console.log(evt.target.result);

                                var config_data = JSON.parse(evt.target.result);

                                AppLauncher.Updater.config = config_data;

                                //console.log(AppLauncher.Updater.config);

                                if(option.successCB)
                                    option.successCB(AppLauncher.Updater.config);
                            }

                            reader.readAsText(file);

                        }
                        else { //파일이 처음 생성되었으면

                            console.log('create new config file');

                            AppLauncher.Updater.config = {
                                updater_url : option.default_updater_url,
                                startup_file : option.default_startup_file
                            }
                            if(option.successCB)
                                option.successCB(AppLauncher.Updater.config);

                            function win(writer) {

                                //AppLauncher.Updater.configFileWriter = writer;

                                writer.onwrite = function(evt) { //쓰기 성공 했으면..
                                    console.log("write success");
                                };
                                writer.write( JSON.stringify(AppLauncher.Updater.config));
                            };

                            var fail = function(evt) {
                                console.log(error.code);
                            };

                            fileEntry.createWriter(win, fail);
                        }

                    });

                },
                function(evt) { //실패 하면

                    console.log('error : ' + evt.target.error.code)

                }
            );

        }
    );

}

AppLauncher.saveConfig = function(option) {

    console.log(option.data);

    AppLauncher.configFileEntry.createWriter(
        function(writer) {
            writer.onwrite = function(evt) { //쓰기 성공 했으면..
                console.log("write success");
            };
            writer.write( option.data);

        },
        function() {
            console.log("write failed");

    });

}


AppLauncher.Updater.startUpdater = function (path,repo_url,success,error,progCallback,downloadCallback)
{
    function fail(evt) {

        console.log(evt.target.error.code);

        if(error != undefined )  {

            error(evt);

        }
    }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
        function (fileSystem) {

            console.log('success get filesystem ');

            // Get the data directory, creating it if it doesn't exist.
            fileSystem.root.getDirectory(
                path,
                {create: true},   //없으면 만들기
                function(parent) {

                    console.log("Parent Name: " + parent.name);
                    console.log("Parent Name: " + parent.fullPath);

                    //$('#text_full_path').text(parent.fullPath);

                    //저장소 풀패스얻기
                    AppLauncher.Updater.fullPath =  parent.fullPath;


                    var OnDownloadFinish = function() {

                        console.log('download ALL file success..');

                        parent.getFile(
                            "check_new.json",
                            {create: true, exclusive: false},
                            function(fileEntry) { //파일이 얻어지면

                                fileEntry.file(function(file) {
                                    if(file.size > 0) {
                                        var fullPath = parent.fullPath;
                                        var parentName = fullPath.substring(fullPath.lastIndexOf('/')+1);

                                        //console.log(fullPath);
                                        //console.log(parentName);

                                        var parentEntry = new DirectoryEntry(parentName, fullPath);

                                        console.log('rename check_new.json to check.json....')

                                        fileEntry.moveTo(parentEntry,"check.json",
                                            function() {
                                                console.log('update check.json all finished success');

                                                if(success != undefined )  {

                                                    success();

                                                }

                                            },fail);

                                    }
                                    else {
                                        if(success != undefined )  {

                                            success();

                                        }

                                    }

                                },fail);


                            }
                            ,fail
                        );

                    }

                    //파일리스트에 있는 파일들 모두 다운로드 받기
                    var downloadList = function(filelist) {

                        console.log('now download start ..');

                        var download_count = 0;

                        var i=0;
                        //for(var i in filelist) {
                        function download(i) {

                            var filename = filelist[i];

                            var url = repo_url + '/' + filelist[i];
                            var fullPath =  AppLauncher.Updater.fullPath +'/' +filelist[i];

                            console.log('downloading...' + filelist[i] )
                            //console.log(url);
                            //console.log(fullPath)

                            var fileTransfer = new FileTransfer();

                            fileTransfer.onprogress = function(progressEvent) {

                                if(progCallback)
                                {
                                        progCallback(progressEvent);
                                }
                            };

                            fileTransfer.download(
                                url,
                                fullPath,
                                function(theFile) {
                                    //console.log("download complete: " + theFile.toURL());
                                    console.log("download complete: " + theFile.name);

                                    if(downloadCallback)
                                    {
                                        downloadCallback(
                                            {
                                                fullpath : theFile.toURL(),
                                                filename : theFile.name,
                                                percent:  (i / filelist.length) * 100
                                            }
                                        );
                                    }

                                    download_count++;

                                    if(download_count >= filelist.length) {
                                        OnDownloadFinish();

                                    }
                                    else {
                                        i++;
                                        download(i);
                                    }
                                },
                                function(err) {
                                    console.log("download error source " + err.source);
                                    console.log("download error target " + err.target);
                                    console.log(" error code: " + err.code);

                                    error(err);

                                    //에러 발생시 롤백처리
                                    if(AppLauncher.updater_url.check_old.version < 0) {

                                        //처음 시도일 경우 저장소 리셋하기
                                        AppLauncher.Updater.reset(path);



                                    }
                                    else {
                                        //처음이 아닐경우는 그냥 나눈다..

                                    }


                                }
                            );

                        }

                        //다운로드 스타트
                        download(0);

                    };

                    var UpdateAll = function(checklist_file) {

                        var reader =   new FileReader();

                        reader.onload = function(evt) {
                            console.log(evt.target.result);

                            var checklist_local = JSON.parse(evt.target.result);
                            console.log(checklist_local.version);

                            var download_list = [];
                            for(var filename in checklist_local.files)
                            {
                                download_list.push(filename);

                            }

                            downloadList(download_list);

                        }

                        reader.readAsText(checklist_file);
                    };


                    //디랙토리내의 파일 얻기
                    parent.getFile(
                        "check.json",
                        {create: true, exclusive: false},
                        function(fileEntry) { //파일이 얻어지면

                            console.log('get files success ');

                            fileEntry.file(function(file) {

                                console.log(file.lastModifiedDate);
                                console.log('file size :' + file.size);

                                if(file.size <= 0 ) {

                                    console.log('now first run app process...');

                                    AppLauncher.Updater.check_old = {version:-1}; //처음이면...

                                    var fileTransfer = new FileTransfer();

                                    fileTransfer.download(
                                        repo_url + "/check.json",
                                        //file.fullPath,
                                        AppLauncher.Updater.fullPath + "/check_new.json",
                                        function(theFile) {
                                            console.log("download complete: " + theFile.toURL());
                                            theFile.file(UpdateAll);
                                        },
                                        function(error) {
                                            console.log("download error source " + error.source);
                                            console.log("download error target " + error.target);
                                            console.log(" error code: " + error.code);

                                            if(error != undefined )  {
                                                var evt = {
                                                    target : {
                                                        error : {
                                                            code :error.code,
                                                            msg : 'file transfer error'
                                                        }
                                                    }
                                                };
                                                fail(evt);
                                            }
                                        }
                                    );
                                }
                                else {// 파일이 존재하면

                                    //이전 파일과 비교최신버전파일들의 리스트를 얻어낸다.

                                    var fileTransfer = new FileTransfer();

                                    var newfile = AppLauncher.Updater.fullPath + '/check_new.json';

                                    fileTransfer.download(
                                        repo_url + "/check.json",
                                        newfile,
                                        function(theFile) { //엔트리넘겨받음

                                            //console.log("download complete: " + theFile.toURL());
                                            console.log("download complete: " + theFile.name);

                                            //파일객체얻기
                                            theFile.file(function(newfile) {

                                                var reader =   new FileReader();

                                                reader.onload = function(evt) {

                                                    console.log('compare check list....');

                                                    //console.log(evt.target.result);

                                                    var check_new = JSON.parse(evt.target.result);

                                                    AppLauncher.Updater.check_new = check_new; //새로운 체크리스트

                                                    var reader =   new FileReader();

                                                    //구버전 읽기
                                                    reader.onload = function(evt) {

                                                        //console.log(evt.target.result);

                                                        var check_old = JSON.parse(evt.target.result);

                                                        //이전 업데이트리스트
                                                        AppLauncher.Updater.check_old = check_old;

                                                        console.log('old version :' + check_old.version);
                                                        console.log('new version :' + check_new.version);

                                                        //버전비교한후 신버전이업 업데이트 리스트 생성
                                                        if(check_old.version < check_new.version) {
                                                            console.log('new version exist!');

                                                            //신버전의 리스트 만들기..
                                                            var updateList = [];


                                                            function getOldRev(name) {


                                                                if(check_old.files[name] == undefined) return 0;

                                                                else {
                                                                    return check_old.files[name];

                                                                }
                                                            }

                                                            for(var i in check_new.files) {

                                                                if(check_new.files[i] > getOldRev(i)) {
                                                                    console.log(i + ' need update :' + (check_new.files[i] - getOldRev(i)) );
                                                                    updateList.push(i);
                                                                }
                                                            }

                                                            //목록에 있는 파일들 다운받기
                                                            downloadList(updateList);
                                                        }
                                                        else {
                                                            console.log('latest version');

                                                            if(success != undefined )  {
                                                                success();
                                                            }
                                                        }
                                                    }
                                                    //기존리스트읽기
                                                    reader.readAsText(file);
                                                }

                                                reader.onloadend = function() {
                                                    console.log('load end');
                                                }

                                                //console.log('read file....' + newfile);
                                                //신규리스트읽기
                                                reader.readAsText(newfile);
                                            },

                                            function(error) {
                                                console.log('error ' + error.code);
                                            }

                                            );
                                            //theFile.file(App.Updater.UpdateAll);
                                        },

                                        function(error) {
                                            console.log("download error source " + error.source);
                                            console.log("download error target " + error.target);
                                            console.log(" error code: " + error.code);

                                            if(error != undefined )  {
                                                var evt = {
                                                    target : {
                                                        error : {
                                                            code :error.code,
                                                            msg : 'file transfer error'
                                                        }
                                                    }
                                                };

                                                fail(evt);
                                            }
                                        }

                                        //fail
                                    );

                                    //App.Updater.checkUpdate(file);
                                }

                            },fail);
                        },
                        fail);
                }

            );
        },
        fail);
}

AppLauncher.Updater.reset = function(path_name) {

    function fail(evt) {

        console.log(evt.target.error.code);

        if(error != undefined )  {

            error(evt);

        }
    }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
        function (fileSystem) {

            fileSystem.root.getDirectory(
                path_name,
                {create: true},   //없으면 만들기
                function(entry) {
                    console.log(" Name: " + entry);

                    entry.removeRecursively(function(result) {

                        console.log('remove success :' + result)

                    },fail);

                })
        },
        fail
    );


}