<template>
  <!-- 文件上传组件 -->
  <uploader
    ref="uploader"
    :options="options"
    :autoStart="false"
    :auto="false"
    class="manage-uploader"
    @file-added="onFileAdd"
    @files-added="onFilesAdd"
    @file-success="onFileSuccess"
  >
    <uploader-unsupport></uploader-unsupport>
    <uploader-btn>选择文件</uploader-btn>
    <uploader-list></uploader-list>
  </uploader>
</template>

<script>
import SparkMD5 from "spark-md5";
import Vue from "vue";
import qs from "qs";
// import { ACCESS_TOKEN } from '@/store/mutation-types';
import { hasMd5, mergeFile, uploadFiles } from "@/api/componentFiles";
import { getCompFiles } from "@/api/component";
import uniqid from "uniqid";
import { mapMutations } from "vuex";
export default {
  name: "uploadFile",
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
      // 文件上传配置项
      options: {
        //ip地址  // 目标上传 URL
        target: "http://127.0.0.1:8080/files/chunks",
        // target: 'http://192.168.5.177:8080/files/chunks/',
        // 在header中添加的验证 token
        headers: {
          Authorization: `bearer${Vue.ls.get(ACCESS_TOKEN)}`
          //  Authorization: "Bearer" + this.$store.getters.token
        },
        //分块大小
        chunkSize: 80 * 1024 * 1024,
        simultaneousUploads: 20,
        autoStart: false,
        testChunks: true,
        // checkChunkUploadedByResponse: function(chunk, message) {
        //   let objMessage = JSON.parse(message)
        //   if (objMessage.skipUpload) {
        //     return true
        //   }
        //   return (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0
        // }
        fileParameterName: "file" //上传文件时文件的参数名，默认file
      },
      attrs: {
        accept: "image/*"
      },
      promiseList: [],
      fileName: "",
      filesId: [],
      fileType: [],
      fileName: [],
      md5: [],
      fileInfoMap: new Map(),
      parentNodeId: ""
    };
  },
  computed: {
    //Uploader实例
    uploader() {
      return this.$refs.uploader.uploader;
    }
  },
  methods: {
    ...mapMutations({
      // setUploadFileName: 'SET_UPLOAD_FILE_NAME',
      setMd5Id: "SET_MD5_ID",

      setFileType: "SET_FILE_TYPE",
      setUploadFileId: "SET_UPLOAD_FILE_ID",
      setFileInformation: "SET_FILE_INFORMATION",
      setUploadFileName: "SET_UPLOAD_FILE_NAME",
      setFileMd5Id: "SET_FILE_MD5_ID"
    }),
    // 文件信息实例化工厂
    fileInfoFactory(fileObj) {
      let fileInfo = new Object();
      fileInfo.identifier = fileObj.uniqueIdentifier;
      fileInfo.relativePath = "/" + fileObj.relativePath;
      fileInfo.totalSize = fileObj.totalSize;
      fileInfo.filename = fileObj.name;
      fileInfo.totalChunks = fileObj.chunks.length;
      fileInfo.status = "";
      return fileInfo;
    },

    // promiseFactory
    promiseFactory(fileInfo) {
      let P = new Promise((resolve, reject) => {
        mergeFile(qs.stringify(fileInfo))
          .then(res => {
            resolve(res.data.data.id);
            // 绑定文件信息 uploadFiles
            // uploadFiles().then()
            // console.log(res.data.data);
            //上传文件的所有的文件id: filesId
            this.filesId.push(res.data.data.id);
            this.setUploadFileId(this.filesId);
            //上传文件的所有类型        fileType
            this.fileType.push(res.data.data.fileType);
            this.setFileType(this.fileType);
            // 上传文件的所有文件名称  fileName
            // console.log(fileInfo.filename);
            this.fileName.push(fileInfo.filename);
            this.setUploadFileName(this.fileName);
            // 上传文件的所有文件的md5
            this.md5.push(res.data.data.md5);
            this.setFileMd5Id(this.md5);

            let fileId = res.data.data.id;
            this.fileInfoMap.set(fileId, fileInfo.filename);
            // console.log(this.fileInfoMap);
          })
          .catch(() => {
            reject("error");
          });
      });
      return P;
    },

    // 按添加文件的批次赋予每批文件唯一的serialNo
    serialInfoFactory(id, num) {},

    // 文件添加后的回调
    onFileAdd(file) {
      this.computeMD5(file);
    },

    //批量添加文件
    onFilesAdd(files) {
      let tag = uniqid.time();
      files.forEach(file => {
        file.serialNo = tag;
      });
    },

    // 计算文件MD5的方法
    computeMD5(file) {
      let fileReader = new FileReader();
      let time = new Date().getTime();
      let blobSlice = File.prototype.slice;
      let currentChunk = 0;
      const chunkSize = 10 * 1024 * 1000;
      let chunks = Math.ceil(file.size / chunkSize);
      let spark = new SparkMD5.ArrayBuffer();
      file.pause();
      loadNext();
      fileReader.onload = e => {
        spark.append(e.target.result);
        if (currentChunk < chunks) {
          currentChunk++;
          loadNext();
          // 实时展示MD5的计算进度
          this.$nextTick(() => {
            // $(`.myStatus_${file.id}`).text(
            //   '校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%'
            // )
            document.getElementsByClassName(`.myStatus_${file.id}`).text =
              "校验MD5 " + ((currentChunk / chunks) * 100).toFixed(0) + "%";
          });
        } else {
          let md5 = spark.end();
          //----
          this.computeMD5Success(md5, file);
          // this.fileName = file.name;

          // 存值---
          // console.log(file.name)
          // console.log(file);
          // this.setFileInformation(file);
          // this.setUploadFileName(file.name);
          // console.log(md5);
          this.setMd5Id(md5);
          // console.log(
          // 	`MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${
          // 		file.size
          // 	} 用时：${new Date().getTime() - time} ms`
          // );
        }
      };
      fileReader.onerror = function() {
        this.$message.error(`文件${file.name}读取出错，请检查该文件`);
        file.cancel();
      };
      function loadNext() {
        let start = currentChunk * chunkSize;
        let end =
          start + chunkSize >= file.size ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
    },

    // 计算MD5成功后的回调
    computeMD5Success(md5, file) {
      // 将自定义参数直接加载uploader实例的opts上
      Object.assign(this.uploader.opts, {
        query: {
          ...this.params
        }
      });
      file.uniqueIdentifier = md5;
      let fileInfo = this.fileInfoFactory(file);
      //后台接口---
      hasMd5(md5).then(res => {
        //判断是否已上传过
        // console.log(res.data.data);  true   false
        //  this.$message.error('上传文件重复'),为true时,要改变暂停和上传按钮的状态
        // 如果文件md5已存在则应该直接upload
        if (res.data.data.id) {
          // 绑定文件信息 uploadFiles
        } else {
          // console.log('upload start');
          // 上传文件控制处
          file.resume();
        }
      });
    },

    // 文件上传成功后的回调
    onFileSuccess() {
      // console.log(arguments[1]);
      let fileInfo = this.fileInfoFactory(arguments[1]);
      this.promiseList.push(this.promiseFactory(fileInfo));
    },
    clickFileUpload() {
      // recordFileUploadId().then(res => {
      // 	console.log(res)
      // 	this.computeMD5Success();
      // 	alert(1)
      // })
    }
  },
  watch: {
    parentFolderId() {
      this.parentNodeId = this.parentFolderId;
    }
    // promiseList: function(val) {
    //   if (val.length === 3) {
    //     Promise.all(val).then(() => {
    //       console.log(val)
    //       alert('all promises success')
    //     })
    //   }
    // }
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
