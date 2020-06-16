<template>
  <div>
    <!--上传文件组件: 需要组件的id-->
    <!-- @files-submitted(files,fileList) 所选择的文件们添加到上传队列后触发。 -->
    <uploader
      :options="options"
      :autoStart="false"
      :file-status-text="statusText"
      ref="uploader"
      class="manage-uploader"
      @file-added="onFileAdd"
      @files-added="checkMd5"
      @file-success="fileSuccess"
      @file-removed="fileRemove"
      v-loading="md5Loading"
      element-loading-text="正在校验文件身份，请勿关闭"
      @upload-start="uploadStart"
      @files-submitted="filesSubmitted(files, fileList)"
    >
      <uploader-unsupport></uploader-unsupport>
      <uploader-btn>选择文件</uploader-btn>
      <uploader-list></uploader-list>
    </uploader>
  </div>
</template>

<script>
/*eslint-disable*/

import { movefileTo, copyFileTo, renameFile } from "@/api/component";
import service from "@/utils/request";
import SparkMD5 from "spark-md5";
import { hasMd5, mergeFile, uploadFiles } from "@/api/componentFiles";
import { getCompFiles } from "@/api/component";
import qs from "qs";

export default {
  name: "uploaderTool",
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
      ip: "",
      port: "",
      projectId: "",
      componentId: "",
      compName: "",
      parentNodeId: "",
      newFolderName: "",
      selectFileId: "",
      errorMessage: "操作失败",
      maniType: "",
      fileRename: {
        name: ""
      },
      uploadDialog: false,
      uploadFolderDialog: false,
      renameDialog: false,
      maniFileDialog: false,
      fileList: [],
      breadcrumbList: [],
      tableKey: 0,
      list: [],
      singleComp: null,
      total: null,
      listLoading: true,
      uploading: false,
      upFileLoading: false,
      upFolderLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: "+id",
        deviceName: undefined
      },
      sortable: null,
      oldList: [],
      newList: [],
      fileRenameRules: {
        name: [{ required: true, message: "请输入文件名！", trigger: "blur" }]
      },
      downloadLoading: false,
      maniFileLoading: false,
      options: {
        // 可通过 https://github.com/simple-uploader/Uploader/tree/develop/samples/Node.js 示例启动服务
        target: "http://127.0.0.1:8080/files/chunks",
        /*query: {
            upload_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJ0ZXN0MSIsInNjb3BlIjpbIlNDT1BFUyJdLCJleHAiOjE1MzU5ODQ2NTUsInVzZXJJZCI6IjE3ZDIwZWFjLTM5NjgtNGNlNC1hMjI1LTMyZDg3ZTJjMWVhZiIsImF1dGhvcml0aWVzIjpbIlJPTEVfdXNlciJdLCJqdGkiOiJhNzFmNmE2My0wMDZkLTRkMDAtOGFkYi0wMjY3ZmIzYzk3MWYiLCJjbGllbnRfaWQiOiJPQVVUSF9DTElFTlRfSUQifQ.CvOB1fP6PQOGhVrDvRgNGxAaJOiii9W2biz5BY6iJLU'
          },*/
        // target: 'http://' + this.ip + ':' + this.port + '/files/chunks',
        headers: {
          Authorization: ""
        },
        chunkSize: 80 * 1024 * 1024,
        simultaneousUploads: 20,
        // autoStart: false,
        testChunks: true
      },

      statusText: {
        success: "上传结束",
        error: "出错了",
        uploading: "上传中",
        paused: "暂停中",
        waiting: "等待中"
      },
      md5Loading: false,
      autoStart: false,
      fileInfo: [],
      files: [],
      fileAll: [],
      target: "",
      token: "",
      folderFileInfo: [],
      fileInfoList: [],
      fileCompleteLength: 0,
      folderfileCompleteLength: 0,
      hiddenClose: false
    };
  },
  created() {
    this.initData();
    this.ip = this.getCookie("ip");
    this.port = this.getCookie("port");
    // this.target = 'http://' + this.ip + ':' + this.port + '/apis/files/chunks'
    this.target = service.defaults.baseURL + "/files/chunks";
    this.token = "Bearer" + this.$store.getters.token;
    this.selectFileId = "";
    this.maniType = "";
  },
  methods: {
    initData() {
      this.projectId = this.$store.getters.projectId;
      this.componentId = this.selectCompId;
      this.compName = this.selectCompName;
      this.breadcrumbList = [];
      this.list = [];
      this.breadcrumbList.push({
        name: this.compName,
        componentId: this.componentId,
        parentNodeId: "",
        folder: true
      });
      // console.log(this.breadcrumbList)

      if (this.componentId) {
        this.getList();
      } else {
        this.listLoading = false;
      }

      // this.autoStart = false; //取消自动上传
    },
    getList() {
      this.listLoading = true;
      getCompFiles(this.componentId, this.parentNodeId)
        .then(res => {
          this.list = res.data.data;
          this.listLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
          this.$notify({
            title: "失败",
            message: "加载出错！",
            type: "error",
            duration: 2000
          });
        });
    },

    // 取消文件上传的操作
    /*fileClose() {
        this.$confirm('关闭后上传将被终止，确认关闭吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.fileReader.abort()
          this.$refs.uploader.uploader.cancel()
          this.uploadDialog = false
          this.md5Loading = false
        })
      },
      folderClose() {
        this.$confirm('关闭后上传将被终止，确认关闭吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.fileReader.abort()
          this.$refs.uploaderFolder.uploader.cancel()
          this.uploadFolderDialog = false
          this.md5Loading = false
        })
      },*/
    addFolder() {
      if (this.list.length === 0) {
        let newFolder = {
          name: "",
          newFolder: true,
          folder: true
        };
        this.list.splice(0, 0, newFolder);
      } else if (this.list[0].name != "") {
        let newFolder = {
          name: "",
          newFolder: true,
          folder: true
        };
        this.list.splice(0, 0, newFolder);
      }
    },
    newFoler() {
      if (this.newFolderName) {
        this.list.splice(0, 1);
        let formData = new FormData();
        formData.append("name", this.newFolderName);
        saveFolder(this.componentId, this.parentNodeId, formData)
          .then(() => {
            this.newFolderName = "";
            this.getList();
          })
          .catch(() => {
            this.newFolderName = "";
            this.$notify({
              title: "失败",
              message: "新建失败",
              type: "error",
              duration: 2000
            });
          });
      }
    },
    handleuploadFile() {
      this.uploadDialog = true;
      this.hiddenClose = false;
      this.$nextTick(() => {
        this.fileReader = new FileReader();
        this.$refs.uploader.uploader.cancel(); //清空文件上传列表
        this.$refs.uploader.uploader.opts.target = this.target;
        this.$refs.uploader.uploader.opts.headers.Authorization = this.token;
        $(".uploader-list ul").html("");
        this.fileCompleteLength = 0;
        this.fileInfoList = [];
        $(".manage-uploader .uploader-btn").css("display", "inline-block");
      });
    },
    handleUploadFolder() {
      this.hiddenClose = false;
      this.uploadFolderDialog = true;
      this.$nextTick(() => {
        this.fileReader = new FileReader();
        this.$refs.uploaderFolder.uploader.cancel(); //清空文件上传列表
        this.$refs.uploaderFolder.uploader.opts.target = this.target;
        this.$refs.uploaderFolder.uploader.opts.headers.Authorization = this.token;
        this.folderFileInfo = [];
        $(".manage-uploaderFolder .uploader-btn").css(
          "display",
          "inline-block"
        );
      });
    },
    uploadStart() {},
    // 文件添加后的回调
    onFileAdd(file) {
      // this.computeMD5(file);
    },
    // 上传文件的几个方法
    checkMd5(fileAdded, fileList) {
      // console.log(this.$refs.uploader.uploader.files)
      this.hiddenClose = true;
      this.md5Loading = true;
      $(".manage-uploader .uploader-btn").css("display", "none");
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
          /*axios.get('http://192.168.31.13:8080/files/hasmd5',{
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              params: {
                MD5: fileA.md5
              }
            })*/
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
                  '</div> <div class="uploader-file-size">' +
                  resVal +
                  '</div> <div class="uploader-file-meta"></div> <div class="uploader-file-status"><span>成功了</span> <span style="display: none;"><span>100%</span> <em>0 bytes / s</em> <i></i></span></div> <div class="uploader-file-actions"><span class="uploader-file-pause"></span> <span class="uploader-file-resume">️</span> <span class="uploader-file-retry"></span> <span class="uploader-file-remove"></span></div></div></div>'
              );
              that.$refs.uploader.uploader.removeFile(fileA);
              that.fileCompleteLength += 1; // 中和上传控件触发的removeFile事件的自减1
              // let notiMes = '文件' + fileA.name + '上传成功！'
              that.listLoading = false;
              /*that.$notify({
                  title: '成功',
                  message: notiMes,
                  type: 'success',
                  duration: 2000
                })*/

              if (completeFlag === fileAdded.length) {
                that.md5Loading = false;
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
                //自动上传 (上传方法): uploader.upload()
                // that.$refs.uploader.uploader.upload();
              }
            } else if (res.data.data == false) {
              completeFlag++;
              if (completeFlag === fileAdded.length) {
                that.md5Loading = false;
                // that.$refs.uploader.uploader.upload();
              }
            }
          });
        });
      }
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
            // console.log(currentChunk);
            if (currentChunk < chunks) {
              let a =
                "deal with" + currentChunk + "剩余" + (chunks - currentChunk);
              load();
            } else {
              resolve(spark.end());
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
    },
    fileRemove() {
      this.fileCompleteLength -= 1;
    },
    filesSubmitted(files, fileList) {},
    mergeFile(md5, chunkNum, totalSize, name, path) {
      var qs = require("qs");
      let data = {
        identifier: md5,
        totalChunks: chunkNum,
        totalSize: totalSize,
        filename: name,
        relativePath: path
      };
      let datapost = qs.stringify(data);
      /*axios.post('http://192.168.31.13:8080/files/chunks/merge', datapost, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          }
        })*/
      mergeFile(datapost)
        .then(() => {})
        .catch(() => {
          this.$notify({});
        });
    },
    // 上传文件时 fileSuccess 第一个参数为根文件， 第二个参数为上传的文件
    fileSuccess() {
      // console.log("fileSuccess", arguments);
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
      /*axios.post('http://192.168.31.13:8080/files/chunks/merge', datapost, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          }
        })*/
      this.listLoading = true;
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

    uploadFile() {
      this.listLoading = true;
      this.uploading = true;
      this.upFileLoading = true;
      let formData = new FormData();
      formData.append("parentnodeid", this.parentNodeId);
      this.fileAll = this.$refs.uploader.uploader.files;
      for (var i = 0; i < this.fileAll.length; i++) {
        //判断数组里是文件夹还是文件
        formData.append("files", this.fileAll[i].file);
      }
      saveFiles(this.componentId, formData)
        .then(res => {
          this.uploading = false;
          this.upFileLoading = false;
          this.$refs.uploader.uploader.cancel();
          this.getList();
          this.listLoading = false;
          this.uploadDialog = false;
        })
        .catch(error => {
          this.listLoading = false;
          this.uploading = false;
          this.upFileLoading = false;
          this.$notify({
            title: "失败",
            message: "上传失败",
            type: "error",
            duration: 2000
          });
        });
    },

    resetManiFile() {
      this.$refs.maniFile.breadcrumbList = [];
      this.$refs.maniFile.projectId = this.$store.getters.projectId;
      this.$refs.maniFile.componentId = this.selectCompId;
      this.$refs.maniFile.compName = this.selectCompName;
      this.$refs.maniFile.targetFolderId = this.componentId;
      this.$refs.maniFile.targetComponentId = this.componentId;
      this.$refs.maniFile.breadcrumbList.push({
        name: this.selectCompName,
        componentId: this.selectCompId,
        parentNodeId: "",
        folder: true
      });
    },

    renameFile() {
      this.$refs["fileRenameForm"].validate(valid => {
        if (valid) {
          let nameData = {
            name: this.fileRename.name
          };
          var qs = require("qs");
          let datapost = qs.stringify(nameData);
          renameFile(this.selectFileId, datapost)
            .then(() => {
              this.fileRename.name = "";
              this.renameDialog = false;
              this.$notify({
                title: "成功",
                message: "文件重命名成功！",
                type: "success",
                duration: 2000
              });
              this.getList();
            })
            .catch(error => {
              this.fileRename.name = "";
              this.errorMessage = "重命名失败！";
              if (error.response.data.message) {
                this.errorMessage = error.response.data.message;
              }
              this.$notify({
                title: "失败",
                message: this.errorMessage,
                type: "error",
                duration: 2000
              });
            });
        }
      });
    },
    maniFile() {
      if (this.$refs.maniFile.targetComponentId === "") {
        this.$message({
          type: "warning",
          message: "请先选择目标组件！"
        });
        return;
      }
      let data = {
        targetNodeId: this.$refs.maniFile.targetFolderId,
        targetComponentId: this.$refs.maniFile.targetComponentId
      };
      var qs = require("qs");
      let datapost = qs.stringify(data);
      // 移动文件
      if (this.maniType == "move") {
        // this.$refs.maniFile.moveFile()
        movefileTo(
          this.$refs.maniFile.selectFileId,
          this.$refs.maniFile.targetFolderId,
          datapost
        )
          .then(() => {
            this.maniFileDialog = false;
            this.$notify({
              title: "成功",
              message: "文件移动成功！",
              type: "success",
              duration: 2000
            });
            this.getList();
          })
          .catch(() => {
            // this.resetManiFile()
            // this.$refs.maniFile.initData()
            this.maniFileDialog = false;
            this.$notify({
              title: "失败",
              message: "文件移动失败！",
              type: "error",
              duration: 2000
            });
          });
      } else if (this.maniType == "copy") {
        // 复制文件
        // this.$refs.maniFile.initData()
        copyFileTo(
          this.$refs.maniFile.selectFileId,
          this.$refs.maniFile.targetFolderId,
          datapost
        )
          .then(() => {
            // this.resetManiFile()
            this.maniFileDialog = false;
            this.$notify({
              title: "成功",
              message: "文件移动成功！",
              type: "success",
              duration: 2000
            });
            this.getList();
            // this.$refs.maniFile.getList()
          })
          .catch(() => {
            // this.resetManiFile()
            // this.$refs.maniFile.initData()
            this.maniFileDialog = false;
            this.$notify({
              title: "失败",
              message: "文件复制失败！",
              type: "error",
              duration: 2000
            });
          });
      }
    }
  },
  computed: {
    classifyIcon() {
      return function(row) {
        let iconType = "";
        if (row.folder == true) {
          iconType = "folder";
        } else if (
          row.fileEntity.type === "png" ||
          row.fileEntity.type === "jpg" ||
          row.fileEntity.type === "gif"
        ) {
          iconType = "image";
        } else if (
          row.fileEntity.type === "rar" ||
          row.fileEntity.type === "zip"
        ) {
          iconType = "compressed";
        } else {
          iconType = "file";
        }
        return iconType;
      };
    },
    computedSize() {
      return function(val) {
        let resVal;
        if (val < 1024) {
          resVal = val + "B";
        } else if (val >= 1024 && val < 1048576) {
          resVal = Math.round((val / 1024) * 10) / 10 + "KB";
        } else if (val >= 1048576 && val < 1073741824) {
          resVal = Math.round((val / 1048576) * 10) / 10 + "MB";
        } else if (val >= 1073741824) {
          resVal = Math.round((val / 1073741824) * 10) / 10 + "G";
        }
        return resVal;
      };
    },
    fileInfoListLength() {
      return this.fileInfoList.length;
    },
    folderFileLength() {
      return this.folderFileInfo.length;
    }
  },
  watch: {
    parentFolderId() {
      this.parentNodeId = this.parentFolderId;
    },
    addConponentId() {
      // console.log(this.addConponentId);
      this.componentId = addConponentId;
    },
    selectCompId(newValue, oldValue) {
      (this.componentId = this.selectCompId), (this.parentNodeId = "");
      if (this.componentId) {
        this.initData();
      }
    },
    selectCompName(newValue, oldValue) {
      (this.componentId = this.selectCompId), (this.parentNodeId = "");
      if (this.componentId) {
        this.initData();
      }
    },
    /*fileInfoListLength(newValue, oldValue) {
        alert(this.fileInfoListLength)
      },*/
    fileInfoListLength(newValue, oldValue) {
      // alert(this.fileCompleteLength)
      // console.log()
      if (
        this.fileCompleteLength === this.fileInfoList.length &&
        this.fileInfoList.length !== 0
      ) {
        let datapost = JSON.stringify(this.fileInfoList);
        this.statusText.success = "正在合并文件";
        uploadFiles(this.componentId, this.parentNodeId, datapost)
          .then(() => {
            this.listLoading = false;
            this.hiddenClose = false;
            this.$notify({
              title: "成功",
              message: "上传成功",
              type: "success",
              duration: 2000
            });
            this.statusText.success = "文件合并成功";
            this.getList();
            //刷新上传文件列表(默认文件夹)
            this.$parent.getList();
          })
          .catch(() => {
            this.listLoading = false;
            this.hiddenClose = false;
            this.$notify({
              title: "失败",
              message: "文件上传时出错",
              type: "error",
              duration: 2000
            });
            this.statusText.success = "文件合并失败";
            this.getList();
          });
      }
    },
    folderFileLength(newValue, oldValue) {
      // alert(this.fileCompleteLength)
      // console.log()
      if (
        this.folderfileCompleteLength === this.folderFileInfo.length &&
        this.folderFileInfo.length !== 0
      ) {
        // alert(this.folderfileCompleteLength)
        let datapost = JSON.stringify(this.folderFileInfo);
        this.statusText.success = "正在合并文件";
        uploadFiles(this.componentId, this.parentNodeId, datapost)
          .then(() => {
            this.listLoading = false;
            this.hiddenClose = false;
            this.$notify({
              title: "成功",
              message: "上传成功",
              type: "success",
              duration: 2000
            });
            this.statusText.success = "文件合并成功";
            this.getList();
          })
          .catch(() => {
            this.listLoading = false;
            this.hiddenClose = false;
            this.$notify({
              title: "失败",
              message: "文件上传时出错",
              type: "error",
              duration: 2000
            });
            this.statusText.success = "文件合并失败";
            this.getList();
          });
      }
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
