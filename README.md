AssetOnTitan
============

'어셋의 거인' 은  멀티플랫폼 앱 컨텐츠 업데이트 시스템 입니다.
 진격의 업데이터!!( it's simple ,easy and so flexible content updater manager system )

업데이터에 대한 자세한 기술지원은 gbox2@naver.com 으로 연락주시기 바랍니다.

-간편사용법

서버측 하실일들..

1. 업데이터 소스를 다운받는다.
2. 압축을 푼다.
3. 압축을 푼 디랙토리로 가서 dev 폴더를 만든다.
4. dev 폴더 안에 들어가서 svn 이나 git 같은것으로 소스를 끌어 놓을 디랙토리를 만든다.(예> svn checkout --username gbox2 https://dev.naver.com/svn/gtf/trunk/ohmtide/firebolt/simulator)
5. 예제처럼 하면 simulator 디랙토리가 만들어진다. 다시 이전 디랙토리로 나온다.
6. node server.js 포트번호 저장소디랙토리이름으로 실행시킨다.
(예> node server.js 58001 simulator) 


클라이언트측 하실일들..

먼 꼭 필요한 코도바 플러그인
[ 'org.apache.cordova.console',
  'org.apache.cordova.device',
  'org.apache.cordova.file',
  'org.apache.cordova.file-transfer' ]
  
  위와 같습니다.
  

