<template>
  <div class="app-container calendar-list-container">
    <div class="operationContainer" style="height: 40px;border-bottom:1px solid #ebeef5">
      <div style="float: left">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item v-for="(item,index) in breadcrumbList" :key="index"><span @click="switchFolder(item,index)">{{item.name}}</span></el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div style="float: right;color:rgb(0, 171, 235);cursor: pointer;">
        <span style="margin-right: 18px" @click="addFolder">
          <svg-icon icon-class="add"></svg-icon>
          <span style="font-size: 14px;margin-left: 6px;">新建文件夹</span>
        </span>
        <span @click="handleuploadFile">
          <svg-icon icon-class="upload1"></svg-icon>
          <span style="font-size: 14px;margin-left: 6px;">上传文件</span>
        </span>
      </div>
    </div>
    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" fit
              highlight-current-row
              style="width: 100%"
              class="fileList"
    >
      <el-table-column :label="$t('table.compName')" width="200">
        <template slot-scope="scope">
          <span>
            <svg-icon :icon-class="classifyIcon(scope.row)" style="font-size: 30px;margin-right: 10px;"></svg-icon>
            <el-tooltip class="item" effect="dark" :content="scope.row.name" placement="top">
              <span v-if="!scope.row.newFolder" class="link-type"
                    @click="loadListFile(scope.row)"
                    style="position:relative;top:2px;display:inline-block;width:70%;white-space:nowrap;overflow:hidden;text-overflow: ellipsis">
                {{scope.row.name}}
              </span>
            </el-tooltip>
            <el-input @keyup.enter.native="newFoler"
                      ref="newFolderInput"
                      autofocus="autofocus"
                      v-if="scope.row.newFolder"
                      v-model="newFolderName"
                      placeholder="按enter确定"
                      style="width: 70%;display: inline-block;position: relative;top:-2px;">
            </el-input>
          </span>
        </template>
      </el-table-column>
      <!--<el-table-column width="150px" :label="$t('table.compVersion')">
        <template slot-scope="scope">
          <span>{{scope.row.version}}</span>
        </template>
      </el-table-column>-->
      <el-table-column min-width="150px" :label="$t('table.compSize')">
        <template slot-scope="scope">
          <span>{{scope.row.size}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" label="创建时间">
        <template slot-scope="scope">
          <span>{{scope.row.createTime}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column min-width="100px" :label="$t('table.compPath')">
        <template slot-scope="scope">
          <span>{{scope.row.deployPath}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" :label="$t('table.compDesc')">
        <template slot-scope="scope">
          <span>{{scope.row.description}}</span>
        </template>
      </el-table-column>-->
    </el-table>
    <el-dialog
      class="uploadDialog"
      title="提示"
      :visible.sync="uploadDialog"
      width="30%">
      <uploader :options="options"
                :autoStart="autoStart"
                :file-status-text="statusText"
                :started="started"
                ref="uploader"
                class="uploader-example">
        <uploader-unsupport></uploader-unsupport>
        <uploader-drop>
          <p>拖拽文件到此处或</p>
          <uploader-btn>选择文件</uploader-btn>
          <!--<uploader-btn :directory="true">选择文件夹</uploader-btn>-->
        </uploader-drop>
        <uploader-list ref="uploaderList"></uploader-list>
      </uploader>
      <span slot="footer" class="dialog-footer">
    <el-button @click="uploadDialog = false">取 消</el-button>
    <el-button type="primary" @click="uploadFile">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  /*eslint-disable*/
  import { compList, createComp, updateComp, copyComp, importComp, deleteComp, compSingle, saveFolder, getCompFiles, saveFiles } from '@/api/component'
  export default {
    name: 'index',
    data() {
      return {
        projectId:'',
        componentId: '',
        compName: '',
        parentNodeId: '',
        newFolderName: '',
        uploadDialog: false,
        fileList: [],
        breadcrumbList: [],
        tableKey: 0,
        list: [],
        singleComp: null,
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          importance: undefined,
          title: undefined,
          type: undefined,
          sort: '+id',
          deviceName: undefined
        },
        sortable: null,
        oldList: [],
        newList: [],
        temp: {
          id: '',
          name: '',
          version: '',
          deployPath: '',
          description: '',
          fileAll: ''
        },
        downloadLoading: false,
        options: {
          // 可通过 https://github.com/simple-uploader/Uploader/tree/develop/samples/Node.js 示例启动服务
          //target: '//localhost:3000/upload',
          chunkSize: 1024 * 1024,
          testChunks: true
        },
        attrs: {
          accept: 'image/*'
        },
        statusText: {
          success: '成功了',
          error: '出错了',
          uploading: '上传中',
          paused: '暂停中',
          waiting: '等待中'
        },
        started: false,
        autoStart: '',
        fileInfo: [],
        folderInfo: [],
        files: [],
        folderClearData: [],        //文件夹需要清空的内容数组
        fileClearData: [],          //文件需要清空的内容数组
        fileAll: [],
        searchQuery: '',
        CheckedComps: []
      }
    },
    created() {
      /*this.userData.username = this.getCookie('username')
      this.userData.password = this.getCookie('password')*/
      this.projectId = this.$store.getters.projectId
      this.componentId = this.$route.params.id
      this.compName = this.$route.params.name
      this.breadcrumbList = []
      this.breadcrumbList.push({
        name: this.compName,
        componentId: this.componentId,
        parentNodeId: '',
        folder: true
      })
      console.log(this.breadcrumbList)
      this.getList();
      this.autoStart = false;      //取消自动上传
    },
    methods: {
      getList() {
        this.listLoading = true
        getCompFiles(this.componentId,this.parentNodeId).then((res) => {
          this.list = res.data.data
          this.listLoading = false
          // this.parentNodeId = ''
          // (this.parentNodeId)
        })
        /*compList(this.projectId).then(response => {
          this.list = response.data.data.content
          this.total = response.data.total
          this.listLoading = false
          /!*this.oldList = this.list.map(v => v.id);
          this.newList = this.oldList.slice();
          this.$nextTick(() => {
            this.setSort()
          })*!/

          console.log(this.list);
        })*/
      },
      loadListFile(row) {
        if(row.folder){
          /*if(row.parentNode && row.parentNode != null) {
            this.parentNodeId = row.parentNode
          } else {
            this.parentNodeId = ''
          }*/
          this.parentNodeId = row.id
          this.listLoading = true
          getCompFiles(this.componentId,this.parentNodeId).then((res) => {
            this.listLoading = false
            this.list = res.data.data
            this.breadcrumbList.push({
              name: row.name,
              componentId: this.componentId,
              parentNodeId: row.id,
              folder: true
            })
            console.log(this.breadcrumbList)
            /*this.parentNodeId = ''
            alert(this.parentNodeId)*/
          })
        } else {
          return
        }
      },
      addFolder() {
        let newFolder = {
          name: '',
          newFolder: true
        }
        this.list.splice(0, 0, newFolder);
        this.$nextTick(() => {
          // this.$refs['newFolderInput'].onfocus
        })
      },
      newFoler() {
        /*let formData = new FormData();
        formData.append('name',this.newFolderName)
        formData.append('parentnodeid',this.parentNodeId)*/
        saveFolder(this.componentId, this.parentNodeId).then(() => {
          this.newFolderName = ''
          this.getList()
        }).catch(() => {
          this.newFolderName = ''
        })
      },
      handleuploadFile() {
        this.uploadDialog = true
        // this.$refs['uploader'].fileList = []
      },
      uploadFile() {
        this.listLoading = true
        let formData = new FormData()
        formData.append('parentnodeid', this.parentNodeId)
        this.fileAll = this.$refs.uploader.uploader.files
        for (var i = 0; i < this.fileAll.length; i++) {
          //判断数组里是文件夹还是文件
          formData.append('files', this.fileAll[i].file)
        }
        saveFiles(this.componentId, formData).then((res) => {
          this.getList()
          this.listLoading = false
          this.uploadDialog = false
        })
      },
      switchFolder(row,index){
        // console.log(this.breadcrumbList)
        if(row.folder){
          this.listLoading = true
          this.parentNodeId = row.parentNodeId
          getCompFiles(this.componentId,this.parentNodeId).then((res) => {
            this.listLoading = false
            this.list = res.data.data
            this.breadcrumbList.splice(index+1, this.breadcrumbList.length-index-1)
          }).catch(() => {
            this.listLoading = false
          })
        } else {
          return
        }
      }
    },
    computed: {
      classifyIcon () {
        return function (row) {
          let iconType = ''
          if(!row.type) {
            iconType = 'folder'
          } else if(row.type === 'png' || row.type === 'jpg' || row.type === 'gif'){
            iconType = 'image'
          } else if(row.type === 'rar' || row.type === 'zip') {
            iconType = 'compressed'
          } else {
            iconType = 'file'
          }
          return iconType
        }
      }
    }
  }
</script>

<style scoped>

</style>
