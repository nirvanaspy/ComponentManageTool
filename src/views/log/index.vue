<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input style="width: 240px;" class="filter-item" placeholder="输入部署设计名称" v-model="searchQuery">
      </el-input>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column width="200px" align="center" label="类型">
        <template slot-scope>
          <span>部署设计</span>
        </template>
      </el-table-column>
      <el-table-column min-width="140px" align="center" sortable label="部署时间" prop="tag">
         <template slot-scope="scope">
           <span v-if="scope.row.startTime">{{computedTimeTag(scope.row.startTime)}}</span>
           <span v-else>--</span>
         </template>
       </el-table-column>
      <el-table-column min-width="140px" align="center" label="结果">
        <template slot-scope="scope">
          <span v-if="scope.row.complete === true" style="color: limegreen;">{{scope.row.message}}</span>
          <span v-else>
            <span v-if="scope.row.message" style="color: red;">{{scope.row.message}}</span>
            <span v-else>--</span>
          </span>
        </template>
      </el-table-column>
      <!--<el-table-column width="160px" align="center" label="部署详情">
        <template slot-scope="scope">
          <el-button type="primary" plain  @click="deployDetails(scope.row)">查看</el-button>
        </template>
      </el-table-column>-->
    </el-table>
    <div class="pagination-container" style="text-align: center;">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="currentPage" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog title="部署详情" :visible.sync="dialogTableVisible" width="60%">

      <el-table :key='tableKey' :data="deployDetail" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" width="140px" label="主机IP">
          <template slot-scope="scope">
            <span>{{scope.row.hostName}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" min-width="160px" label="组件名称">
          <template slot-scope="scope">
            <span>{{scope.row.componentName}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="120px" label="组件版本">
          <template slot-scope="scope">
            <span>{{scope.row.componentVersion}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" min-width="220px" label="目标路径">
          <template slot-scope="scope">
            <span>{{scope.row.targetPath}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="120px" label="部署状态">
          <template slot-scope="scope">
            <span v-if="scope.row.complete" style="color: limegreen;">成功</span>
            <span v-else  style="color: red;">失败</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" style="text-align: center;">
        <el-pagination background @size-change="handleSizeChange2" @current-change="handleCurrentChange2"
                       :current-page="currentPage2" :page-sizes="[10,20,30, 50]" :page-size="listQuery2.limit"
                       layout="total, sizes, prev, pager, next, jumper" :total="total2">
        </el-pagination>
      </div>

    </el-dialog>

  </div>
</template>

<script>
  /*eslint-disable*/
  import { logList, logDetail, logSearchList } from '@/api/log'
  import waves from '@/directive/waves' // 水波纹指令
  import { parseTime } from '@/utils'

  /* eslint-disable */
  export default {
    name: 'usermanage',
    directives: {
      waves
    },
    data() {
      return {
        searchQuery: '',
        tableKey: 0,
        list: [],
        deployDetail: [],
        listLoading: true,
        dialogTableVisible: false,
        proId: '',
        id: '',
        listQuery: {
          page: 0,
          limit: 10
        },
        listQuery2: {
          page: 0,
          limit: 10
        },
        sortable: null,
        total: 0,
        pagesize:10,//每页的数据条数
        currentPage:1,//默认开始页面
        total2: 0,
        pagesize2:20,//每页的数据条数
        currentPage2:1,//默认开始页面
        importanceOptions: [1, 2, 3],
        depolyStatusOptions: ['部署成功', '进行中', '部署异常'],
        sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        temp: {
          id: undefined,
          importance: 1,
          remark: '',
          timestamp: new Date(),
          title: '',
          type: '',
          status: 'published'
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        dialogPvVisible: false,
        downloadLoading: false,
        /*pickerOptions2: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }]
        },
        value4: '',
        startTime: '', // 日期开始时间
        startTimeTemp: '', // 查询时 日期开始时间戳
        endTime: '', // 日期结束时间
        endTimeTemp: '', // 查询时 日期结束时间戳
        compName: '', // 查询时组件名
        deviceIP: '', // 查询时设备IP
        compSize: '', // 查询时大小
        compState: '', // 查询时状态
        showTimeResult: false, // 时间查询显示标志*/
        selected: ""
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          '成功': 'success',
          '部署中': 'info',
          '失败': 'danger'
        }
        return statusMap[status]
      },
      typeFilter(type) {
        return calendarTypeKeyValue[type]
      }
    },
    created() {
      this.proId = this.getCookie('projectId')
      this.getList()
      // this.getRefresh_token()
    },
    methods: {
      getList() {
        this.listLoading = true
        logList(this.proId, this.listQuery).then(response => {
          this.list = response.data.data.content
          this.listLoading = false
          this.listLength = response.data.data.length
          this.total = response.data.data.totalElements
        })
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.pagesize = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val - 1
        this.currentPage = val
        this.getList()
      },
      handleSizeChange2(val) {
        this.listQuery2.limit = val
        this.pagesize2 = val
        this.deployDetails()
      },
      handleCurrentChange2(val) {
        this.listQuery2.page = val - 1
        this.currentPage2 = val
        this.deployDetails()
      },
      /*deployDetails: function (row) {
        let ifexist = false;      //设备是否部署，false为未部署*!/
        if(row !== undefined){
          this.id = row.id;
        }
        let i = 0;
        this.dialogTableVisible = true;
        this.listLoading = true
        logDetail(this.id, this.listQuery2).then(response => {
          this.deployDetail = response.data.data.content
          this.listLoading = false
          this.listLength = response.data.data.length
          this.total2 = response.data.data.totalElements
        })
      },*/
      /*searchAll: function() {
        if (this.value4.length != 0){
          this.startTime = this.value4[0];
          this.endTime = this.value4[1];

          this.startTimeTemp = Math.floor(new Date(this.startTime).getTime() / 1000);
          this.endTimeTemp = Math.floor(new Date(this.endTime).getTime() / 1000);

          let start = parseInt(this.startTimeTemp);
          let end = parseInt(this.endTimeTemp);
        }

        //  /deploylogs

        let username = this.getCookie('username');
        let password = this.getCookie('password');

        this.deviceIP = $("input[id='search-deviceIP']").val();
        this.compName = $("input[id='search-compName']").val();
        this.compSize = $("input[id='search-compSize']").val();
        //this.compState = $("input[id='search-compState']").val();


        let state = this.selected;

        if (state.length > 0) {
          if (state == "部署异常") {
            this.compState = 0;
          } else if (state == "进行中") {
            this.compState = 1;
          } else if (state == "部署成功") {
            this.compState = 2;
          }
        }

        let formData = new FormData();

        let searchObj = {};

        if (this.deviceIP.length != 0) {
          formData.append('ip', this.deviceIP);
          searchObj.ip = this.deviceIP;
        }

        if (this.compName.length != 0 || this.compSize.length != 0) {
          //searchObj.componentEntity = {};
          if (this.compName.length != 0) {
            formData.append('componentEntity.name', this.compName);
            searchObj.componentName = this.compName;
          }
          if (this.compSize.length != 0) {
            formData.append('componentEntity.size', this.compSize);
            searchObj.componentEntity.size = this.compSize;
          }
        }

        if (this.compState.length != 0) {
          formData.append('state', this.compState);
          searchObj.state = this.compState;
        }
        if (this.value4.length != 0) {
          formData.append('createTime', this.startTimeTemp);
          formData.append('finishTime', this.endTimeTemp);

          //searchObj.createTime = this.startTimeTemp;
          searchObj.startTime = new Date(this.startTime).getTime();
          searchObj.endTime = new Date(this.endTime).getTime();
        }

        logSearchList(searchObj).then(response => {
          this.list = response.data.data
          this.listLoading = false
        })

      },*/
    },
    computed: {
      /*listA: function () {
        let self = this;
        return self.list.filter(function (item) {
          return item.createTime.toLowerCase().indexOf(self.searchQuery.toLowerCase()) !== -1;
        })
      },*/
      computedTimeTag() {
        return function (tag) {
          let date = new Date(tag);
          let Y = date.getFullYear() + '-';
          let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
          let D = date.getDate() < 10 ? '0'+ date.getDate() + ' ' : date.getDate() + ' '
          let h = date.getHours() < 10 ? '0'+ date.getHours() + ':' : date.getHours() + ':'
          let m = date.getMinutes() < 10 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':'
          let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
          return Y+M+D+h+m+s
        }
      }
    }
  }
/*  const this.prototype.startTime = function () {
    const startTime = this.value4[0]
    const endTime = this.value4[1]
    const startTimeTemp = Math.floor(new Date(startTime).getTime() / 1000)
    const endTimeTemp = Math.floor(new Date(endTime).getTime() / 1000)
    return startTimeTemp
  }*/
</script>
