<template>
  <div>
    <!--上传组件执行文件:组件: 需要组件的id-->
    <uploader
      :options="options"
      :autoStart="false"
      :file-status-text="statusText"
      ref="uploader"
      class="manage-uploader"
      @files-added="checkMd5"
      @file-success="fileSuccess"
      @file-removed="fileRemove"
      element-loading-text="正在校验文件身份，请勿关闭"
    >
      <uploader-unsupport></uploader-unsupport>
      <uploader-btn>选择文件</uploader-btn>
      <uploader-list></uploader-list>
    </uploader>
  </div>
</template>

<script>
import { hasMd5, mergeFile, uploadFiles } from "@/api/componentFiles";
import { getCompFiles } from "@/api/component";
import SparkMD5 from "spark-md5";
export default {
  name: "implementFile",
  components: {},
  props: {
    selectCompId: {
      type: String
    },
    parentFolderId: {
      type: String
    }
  },
  data() {
    return {
      options: {
        // 可通过 https://github.com/simple-uploader/Uploader/tree/develop/samples/Node.js 示例启动服务
        target: "http://127.0.0.1:8080/files/chunks",
        // target: 'http://' + this.ip + ':' + this.port + '/files/chunks',
        headers: {
          Authorization: ""
        },
        chunkSize: 80 * 1024 * 1024,
        simultaneousUploads: 20,
        autoStart: false,
        testChunks: true
      },
      autoStart: false,
      statusText: {
        success: "上传结束",
        error: "出错了",
        uploading: "上传中",
        paused: "暂停中",
        waiting: "等待中"
      },
      //隐藏关闭
      hiddenClose: false,
      fileCompleteLength: 0,
      fileInfoList: []
    };
  },
  methods: {
    //filesAdded(files, fileList, event) 和 fileAdded 一样，但是一般用作多个文件的校验。//如果说返回了 false，那么这个文件就会被忽略，不会添加到文件上传列表中。
    checkMd5(fileAdded, fileList) {
      //   console.log(this.$refs.uploader.filesAdded);
      //   this.hiddenClose = true;
      //   $(".manage-uploader .uploader-btn").css("display", "none");

      this.fileCompleteLength += fileAdded.length;
      let chunkSize = this.$refs.uploader.uploader.opts.chunkSize;
      let completeFlag = 0;
      let that = this;
      for (var i = 0; i < fileAdded.length; i++) {
        let fileA = fileAdded[i];
        this.resolveMd5(fileA, chunkSize).then(function(result) {
          // console.log(result);
          fileA.md5 = result;
          fileA.uniqueIdentifier = result;
          hasMd5(fileA.md5).then(res => {
            if (res.data.data.id) {
              completeFlag++;
              let infoList = {
                fileId: res.data.data.id,
                MD5: fileA.md5,
                name: fileA.name,
                relativePath: "/" + fileA.relativePath
              };
              that.fileInfoList.push(infoList);
              let resVal = "";
              let val = fileA.size;
              if (val < 1024) {
                resVal = val + " B";
              } else if (val >= 1024 && val < 1048576) {
                resVal = Math.round((val / 1024) * 10) / 10 + " KB";
              } else if (val >= 1048576 && val < 1073741824) {
                resVal = Math.round((val / 1048576) * 10) / 10 + " MB";
              } else if (val >= 1073741824) {
                // 2653276160
                resVal = Math.round((val / 1073741824) * 10) / 10 + " G";
              }
              $(".manage-uploader .uploader-list ul").prepend(
                '<div status="success" class="uploader-file">' +
                  '<div class="uploader-file-progress" style="transform: translateX(0%);"></div> ' +
                  '<div class="uploader-file-info">' +
                  '<div class="uploader-file-name"><i icon="unknown" class="uploader-file-icon"></i>' +
                  fileA.name +
                  "</div> " +
                  '<div class="uploader-file-size">' +
                  resVal +
                  "</div>" +
                  '<div class="uploader-file-meta"></div> <div class="uploader-file-status"><span>成功了</span> <span style="display: none;"><span>100%</span> <em>0 bytes / s</em> <i></i></span></div> <div class="uploader-file-actions"><span class="uploader-file-pause"></span> <span class="uploader-file-resume">️</span> <span class="uploader-file-retry"></span> <span class="uploader-file-remove"></span></div></div></div>'
              );
              that.$refs.uploader.uploader.removeFile(fileA);
              that.fileCompleteLength += 1; // 中和上传控件触发的removeFile事件的自减1
              // let notiMes = '文件' + fileA.name + '上传成功！'
              /*that.$notify({
                  title: '成功',
                  message: notiMes,
                  type: 'success',
                  duration: 2000
                })*/

              if (completeFlag === fileAdded.length) {
                /*if(that.$refs.uploader.uploader.files.length === 0) {
                    let datapost = JSON.stringify(that.fileInfoList)
                    console.log(datapost)
                    uploadFiles(that.componentId, that.parentNodeId, datapost).then(() => {
                      that.listLoading = false
                      that.$notify({
                        title: '成功',
                        message: '文件上传成功',
                        type: 'success',
                        duration: 2000
                      })

                      that.getList()
                    }).catch(() => {
                      that.listLoading = false
                      that.$notify({
                        title: '失败',
                        message: '文件上传失败',
                        type: 'error',
                        duration: 2000
                      })
                    })
                  }*/
                //触发上传
                // that.$refs.uploader.uploader.upload();
              }
            } else if (res.data.data == false) {
              completeFlag++;
              if (completeFlag === fileAdded.length) {
                //触发上传
                // that.$refs.uploader.uploader.upload();
              }
            }
          });
        });
      }
    },
    // 上传文件时 fileSuccess 第一个参数为根文件， 第二个参数为上传的文件
    fileSuccess() {
      console.log("fileSuccess", arguments);
      // this.fileMd5HeadTailTime(arguments[1].file, this.$refs.uploader.uploader.opts.chunkSize)
      // this.mergeFile(arguments[1].uniqueIdentifier, arguments[1].chunks.length, arguments[1].size, arguments[1].name, arguments[1].relativePath)
      let data = {
        identifier: arguments[1].uniqueIdentifier,
        totalChunks: arguments[1].chunks.length,
        totalSize: arguments[1].size,
        filename: arguments[1].name,
        relativePath: arguments[1].relativePath
      };
      let datapost = qs.stringify(data);
      mergeFile(datapost).then(res => {
        let infoList = {
          fileId: res.data.data.id,
          MD5: arguments[1].md5,
          name: arguments[1].name,
          relativePath: "/" + arguments[1].relativePath
        };
        this.fileInfoList.push(infoList);
      });
    },
    fileRemove() {
      this.fileCompleteLength -= 1;
    },
    resolveMd5(zenfile, chunkSize) {
      return new Promise((resolve, reject) => {
        let file = zenfile.file;
        // let spark = new SparkMD5.ArrayBuffer()
        if (zenfile.md5) {
          resolve(zenfile.md5);
        } else {
          let spark = new SparkMD5();
          let fileReader = new FileReader();
          let blobSlice =
            File.prototype.slice ||
            File.prototype.mozSlice ||
            File.prototype.webkitSlice;
          let chunks = Math.ceil(file.size / chunkSize);
          let currentChunk = 0;
          fileReader.onload = e => {
            spark.appendBinary(e.target.result);
            currentChunk++;
            console.log(currentChunk);
            if (currentChunk < chunks) {
              let a =
                "deal with" + currentChunk + "剩余" + (chunks - currentChunk);
              load();
            } else {
              resolve(spark.end());
              // console.log(new Date())
            }
            fileReader.onerror = e => reject(e);
          };

          let load = () => {
            var start = currentChunk * chunkSize;
            var end =
              start + chunkSize >= file.size ? file.size : start + chunkSize;
            fileReader.readAsBinaryString(file.slice(start, end));
          };
          load();
        }
      });
    }
  }
};
</script>

<style>
.uploader-example {
  width: 880px;
  padding: 15px;
  margin: 40px auto 0;
  font-size: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}
.uploader-example .uploader-btn {
  margin-right: 4px;
}
.uploader-example .uploader-list {
  max-height: 440px;
  overflow: auto;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
