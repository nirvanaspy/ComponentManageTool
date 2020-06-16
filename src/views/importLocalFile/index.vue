<template>
<div>
  <uploader
    :file-status-text="statusText"
    @file-sucess="fileSuccess"
    @files-added="fileAdd"
  >
    <uploader-unsupport></uploader-unsupport>
    <uploader-drop>
      <p>上传指令文件</p>
      <uploader-btn :single="true" :directroy="false" :attrs="attrs">选择文件</uploader-btn>
    </uploader-drop>
    <uploader-list></uploader-list>
  </uploader>
  {{result}}
</div>
</template>

<script>
  export default {
    name: 'index',
    data() {
      return {
        result: null,
        statusText: {
          success: '上传成功',
          error: '失败',
          uploading: '上传中',
          paused: '暂停',
          waiting: '等待'
        },
        attrs: {
          accept: ['.json']
        }
      }
    },
    methods: {
      fileAdd(file) {
        const fileReader = new FileReader()
        // let content = fileReader.readAsText(file[0])
        // let content = fileReader.readAsBinaryString(file[0])
        fileReader.onload = (e) => {
          this.result = e.target.result
        }
        fileReader.readAsText(file[0].file)
      },
      fileSuccess() {
        console.log(arguments)
      }
    }
  }
</script>

<style scoped>

</style>
