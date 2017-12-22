/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 var fetchedData;
 
 var app = {
    // Application Constructor
    initialize: function() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
      var dir = new DirManager()
      dir.create('/Documents', Log('created succefully'));

    },

    launchInstagram: function() {
      document.getElementById('launchInstagram').style.color='red';
      window.plugins.launcher.launch({packageName:'com.instagram.android'}, function successCallback(){console.log("ok")}, function errorCallback(){alert("error")});
    },
    queuePostNow: function() {
      document.getElementById('queue-post-now').style.color='red';
      var file = new FileManager;
      $.ajax({
        type: 'GET',
        url: 'http://192.168.43.185/queue/get_insta_post_details/user/post_now',
        dataType: 'json',
            //crossDomain:true,
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
              // Download files for the node.

              var userInstaPostData = JSON.stringify(response);
              // console.log(userInstaPostData)

                // writing data into json file
                file.write_file('/Documents', 'userInstaPostData.json', userInstaPostData, 
                  // success callback if data written succefully
                  function success() {
                    console.log("written data succefully")
                  },
                  // failed callback 
                  function fail(error) {
                    console.log("fail to write file" +error);
                  }, Log("went wrong"));

                var files = response.field_post_files;
                files = files.split(',');
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                for (var i = 0; i <= files.length - 1; i++) {
                  var fileExt = files[i].split('|')[1];
                  var fileUR = files[i].split('|')[0];
                  var fileName = i+1 + '.' + fileExt;

                  
                   var fileTransfer = new FileTransfer();
                   var uri = encodeURI(fileUR);
                   var fileURL = fileSystem.root.toURL() + "queue_instagram" + '/'+fileName;
                   fileTransfer.download(
                    uri, // file's uri
                    fileURL, // where will be saved
                    function (entry) {
                     console.log("Successful download..." , entry.toURL());
                     window.galleryRefresh.refresh(
                      entry.toURL(),
                      function(success){ console.log(success); },
                      function(error){ console.log(error); }
                      );
                   },
                   function (error) {
                    console.log("download error source " + error.source);
                    console.log("download error target " + error.target);
                    console.log("upload error code" + error.code);
                  },
                    null, // or, pass false
                    {}
                    );
                  }
                });
              },
              error: function(error) {
                console.log(error);
              }
            });
      
    },

    queueScheduled: function() {
      document.getElementById('queue-scheduled').style.color='red';
      var file = new FileManager;
      $.ajax({
        type: 'GET',
        url: 'http://192.168.43.185/queue/get_insta_post_details/user/saved_to_schedule',
        dataType: 'json',
            //crossDomain:true,
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
              // Download files for the node.

              var userInstaPostData = JSON.stringify(response);
              // writing data into json file
              file.write_file('/Documents', 'userInstaPostData.json', userInstaPostData, 
                // success callback if data written succefully
                function success() {
                  console.log("written data succefully")
                },
                // failed callback 
                function fail(error) {
                  console.log("fail to write file" +error);
                }, Log("went wrong"));  

              window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                var fileTransfer = new FileTransfer();
                var files = response.field_post_files;
                files = files.split(',');
               
               for (var i = 0; i <= files.length - 1; i++) {
                var fileExt = files[i].split('|')[1];
                var fileUR = files[i].split('|')[0];
                fileUR = fileUR.trim();
                var fileName = i+1 + '.' + fileExt;
                var uri = encodeURI(fileUR);
                var fileURL = fileSystem.root.toURL() + "queue_instagram" + '/'+fileName;
                 fileTransfer.download(
                    uri, // file's uri
                    fileURL, // where will be saved
                    function (entry) {
                     console.log("Successful download..." , entry.toURL());
                     window.galleryRefresh.refresh(
                      entry.toURL(),
                      function(success){ console.log(success); },
                      function(error){ console.log(error); }
                      );
                   },
                   function (error) {
                    console.log(error)
                    console.log("download error source " + error.source);
                    console.log("download error target " + error.target);
                    console.log("upload error code" + error.code);
                  },
                    null, // or, pass false
                    {}
                    );
               }
             });
            },
            error: function(error) {
              console.log(error);
            }
          });
      },

      queuePostStatus: function(){
        var file = new FileManager;
        file.read_file('/Documents', 'userInstaPostData.json', function(result) {
          console.log(result)
          var nid = JSON.parse(result).nid;
          
          jQuery.ajax({
            url: 'http://192.168.43.185/queue/update_user_insta_post_status?_format=json',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              //'X-CSRF-Token': csrfToken
            },
            data: JSON.stringify({ "nid": nid }),
            success: function (res) {
              console.log(res);
            }
          });
        }, function(error){
          console.log("read error ")
        }, Log('failed'));
      }   
    };

    app.initialize();