<template>
  <div class="app-container calendar-list-container deploy">
    <div class="filter-container">
      <el-input
        style="width: 200px;"
        class="filter-item"
        :placeholder="$t('table.componentsName')"
        v-model="searchQuery"
      ></el-input>
      <el-button
        class="filter-item pull-right"
        style="margin-left: 10px;float: right;"
        @click="deployAll"
        type="primary"
        icon="el-icon-news"
        >一键部署</el-button
      >
    </div>
    <!--<el-table :key="tableKey"
              :data="listA"
              v-loading="listLoading"
              element-loading-text="给我一点时间"
              border
              fit
              highlight-current-row
              class="delpoyTable"
              style="width: 100%"
     >
      <el-table-column min-width="140" align="center" :label="$t('table.deviceName')">
        <template slot-scope="scope">
          <span v-if="scope.row.deviceEntity">{{scope.row.deviceEntity.name}}</span>
          <span v-else>暂未绑定设备</span>
        </template>
      </el-table-column>
      <el-table-column min-width="140" align="center" :label="$t('table.deviceIP')">
        <template slot-scope="scope">
          <span v-if="scope.row.deviceEntity">{{scope.row.deviceEntity.hostAddress}}</span>
          <span v-else>暂未绑定设备</span>
        </template>
      </el-table-column>
      <el-table-column min-width="120" align="center" :label="$t('table.devicePath')">
        <template slot-scope="scope">
          <span v-if="scope.row.deviceEntity">{{scope.row.deviceEntity.deployPath}}</span>
          <span v-else>暂未绑定设备</span>
        </template>
      </el-table-column>
      <el-table-column min-width="110" align="center" :label="$t('table.deviceState')">
        <template slot-scope="scope">
          <span class="el-tag el-tag&#45;&#45;danger" v-if="scope.row.online === false">离线</span>
          <span class="el-tag el-tag&#45;&#45;primary" v-else>在线</span>
        </template>
      </el-table-column>
      <el-table-column min-width="180" align="center" :label="$t('table.deployProgress')">
        <template slot-scope="scope">
          &lt;!&ndash;<el-progress :percentage="computedProgress(scope.row.progress)"></el-progress>&ndash;&gt;
          <el-progress :percentage="scope.row.progress"></el-progress>
        </template>
      </el-table-column>
      <el-table-column min-width="100" align="center" label="部署速度">
        <template slot-scope="scope">
          <span>{{computedDeploySpeed(scope.row.speed)}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="140" align="center" label="文件详情">
        <template slot-scope="scope">
          <span v-if="scope.row.fileState === 0" style="color: #FF0000;">{{scope.row.descript}}</span>
          <span v-else-if="scope.row.fileState === 1 || scope.row.fileState === 2" style="color: limegreen;">{{scope.row.descript}}</span>
          <span v-else>{{scope.row.descript}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="130" align="center" :label="$t('table.actions')">
        <template slot-scope="scope">
          <el-button size="mini" type="success" :id="scope.row.online" :state="scope.row.state" class="deployBtn" :disabled="!scope.row.online || scope.row.deviceEntity === null"
                     @click="deployByNode(scope.row)" :loading="scope.row.deployLoading">部署</el-button>
        </template>
      </el-table-column>
    </el-table>-->

    <el-table
      :key="tableKey"
      :data="listA"
      v-loading="listLoading"
      element-loading-text="给我一点时间"
      fit
      highlight-current-row
      style="width: 100%"
      class="delpoyTable"
      :row-key="getRowKeysDeviceEntity"
      :expand-row-keys="deviceExpands"
      @expand-change="expandRow"
    >
      <!-- :row-key="getRowKeysDeviceEntity"   //获取当前行id -->
      <!-- :expand-row-keys="deviceExpands"    //只展开一行放入当前行id -->
      <!-- 查询组件 -->
      <el-table-column align="left" width="40" type="expand">
        <template slot-scope="props">
          <el-table
            stripe
            highlight-current-row
            style="padding: 0 0"
            :data="props.row.deviceEntity"
          >
            <!-- 设备名 -->
            <el-table-column
              min-width="140"
              align="center"
              :label="$t('table.deviceName')"
              prop="name"
            >
            </el-table-column>
            <!-- IP -->
            <el-table-column
              min-width="140"
              align="center"
              :label="$t('table.deviceIP')"
              prop="hostAddress"
            >
            </el-table-column>
            <!-- 部署路径 -->
            <el-table-column
              min-width="120"
              align="center"
              :label="$t('table.devicePath')"
              prop="deployPath"
            >
            </el-table-column>
            <!-- 状态 1  online -->
            <el-table-column
              min-width="110"
              align="center"
              :label="$t('table.deviceState')"
            >
              <template slot-scope="scope">
                <span
                  class="el-tag el-tag--danger"
                  v-if="scope.row.online === false"
                  >离线</span
                >
                <span class="el-tag el-tag--primary" v-else>在线</span>
              </template>
            </el-table-column>
            <!-- 发送进度 2   progress  -->
            <el-table-column
              min-width="180"
              align="center"
              :label="$t('table.deployProgress')"
            >
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.progress"></el-progress>
              </template>
            </el-table-column>
            <!-- 部署速度 3   speed    -->
            <el-table-column min-width="100" align="center" label="部署速度">
              <template slot-scope="scope">
                <span>{{ computedDeploySpeed(scope.row.speed) }}</span>
              </template>
            </el-table-column>
            <!-- 文件详情  4  fileState   -->
            <el-table-column min-width="140" align="center" label="文件详情">
              <template slot-scope="scope">
                <span
                  v-if="scope.row.fileState === 0"
                  style="color: #FF0000;"
                  >{{ scope.row.descript }}</span
                >
                <span
                  v-else-if="
                    scope.row.fileState === 1 || scope.row.fileState === 2
                  "
                  style="color: limegreen;"
                  >{{ scope.row.descript }}</span
                >
                <span v-else>{{ scope.row.descript }}</span>
              </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column
              min-width="130"
              align="center"
              :label="$t('table.actions')"
            >
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="success"
                  :id="scope.row.online"
                  :state="scope.row.state"
                  class="deployBtn"
                  :disabled="
                    !scope.row.online || scope.row.deviceEntity === null
                  "
                  @click="deployByNode(scope.row)"
                  :loading="scope.row.deployLoading"
                  >部署</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <!-- 组件名称 -->
      <el-table-column
        min-width="140"
        align="left"
        :label="$t('table.componentsName')"
      >
        <template slot-scope="scope">
          <!--@click="getDetailByNode(scope.row, scope.$index)"-->
          <span v-if="scope.row.componentEntity">{{
            scope.row.componentEntity.name
          }}</span>
          <span v-else>暂未绑定组件</span>
        </template>
      </el-table-column>
      <!--  组件版本     componentVersion    -->
      <el-table-column
        min-width="140"
        align="left"
        :label="$t('table.componentVersion')"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.componentEntity">{{
            scope.row.componentEntity.version
          }}</span>
          <span v-else>暂未绑定组件</span>
        </template>
      </el-table-column>
      <!-- 组件创建时间 createTime    -->
      <el-table-column
        min-width="140"
        align="left"
        :label="$t('table.componentCreationTime')"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.componentEntity">{{
            scope.row.componentEntity.createTime
          }}</span>
          <span v-else>暂未绑定组件</span>
        </template>
      </el-table-column>
      <!-- 组件相对路径   relativePath -->
      <el-table-column
        min-width="140"
        align="left"
        :label="$t('table.componentRelativePath')"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.componentEntity">{{
            scope.row.componentEntity.relativePath
          }}</span>
          <span v-else>暂未绑定组件</span>
        </template>
      </el-table-column>
      <!--  组件描述    description -->
      <el-table-column
        min-width="140"
        align="left"
        :label="$t('table.componentDescription')"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.componentEntity">{{
            scope.row.componentEntity.description
          }}</span>
          <span v-else>暂未绑定组件</span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="部署详情" :visible.sync="dialogTableVisible">
      <el-table
        :key="tableKey"
        :data="deviceDeployDetail"
        v-loading="listLoading"
        element-loading-text="给我一点时间"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column align="center" :label="$t('table.compName')">
          <template slot-scope="scope">
            <span>{{ scope.row.componentEntity.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('table.deployFileName')">
          <template slot-scope="scope">
            <span>{{ scope.row.componentDetailEntity.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          width="110px"
          align="center"
          :label="$t('table.deviceState')"
        >
          <template slot-scope="scope">
            <span class="el-tag el-tag--danger" v-if="scope.row.state === false"
              >部署失败</span
            >
            <span class="el-tag el-tag--primary" v-else>部署成功</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
// import { doDeploy, getDeployDevice, deployNode } from '@/api/deploy'
import {
  deployNode,
  deployAll,
  deployByDeploymentDesignDetailId
} from "@/api/deploy";
import { deployNodeList, getNodeDetail } from "@/api/deployDesignNode";
import waves from "@/directive/waves"; // 水波纹指令
import service from "@/utils/request";
// 该库为Web浏览器或node.js提供了一个基于WebSocket客户端的STOMP。应用程序。
import Stomp from "stompjs";
// 基于 SockJS 的 WebSocket
import SockJS from "sockjs-client";
import Vue from "vue";

/* eslint-disable */
export default {
  name: "deploy",
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listQuery: {
        page: 0,
        size: 20,
        limit: 5,
        tagname: ""
      },
      searchQuery: "",
      userData: {
        username: "",
        password: ""
      },
      proId: "",
      deployPlanId: "", //所选部署设计的id
      listLoading: true,
      deployLoading: false,
      dialogTableVisible: false,
      errorDetails: [], //部署失败的文件
      completedDeatils: [], //部署成功的文件
      deployDetailInfo: {}, //部署详情
      deployDetailInfo2: [], //部署详情
      deviceDeployDetail: [], //某设备的部署详情
      webResBody: [],
      webProgressBody: [],
      deployIds: [], // 一键部署的所有设备的id
      getRowKeysDeviceEntity(row) {
        return row.id;
      },
      deviceExpands: [], //只展开一行放入当前行id
      bindDeviceEntityList: []
    };
  },
  created() {
    this.userData.username = this.getCookie("username");
    this.userData.password = this.getCookie("password");
    this.proId = this.getCookie("projectId");
    // 部署计划ID
    this.deployPlanId = this.$route.params.id;
    this.getList();
  },
  methods: {
    // 所有节点绑定组件列表查询
    getList() {
      // 获取组件信息
      this.listLoading = true;
      // getDeployDevice(this.deployPlanId, this.listQuery).then(response => {
      deployNodeList(this.deployPlanId, this.listQuery).then(response => {
        this.list = response.data.data.content;
        this.list = response.data.data.content;
        this.total = response.data.data.totalElements;
        this.listLoading = false;
        for (let i = 0; i < this.list.length; i++) {
          for (let j = 0; j < this.list[i].deviceEntity.length; j++) {
            // 状态 1   online    // 发送进度 2   progress
            this.list[i].deviceEntity[j].online = false;
            //
            this.list[i].deviceEntity[j].virtual = false;
            // 部署速度 3  speed
            this.list[i].deviceEntity[j].speed = 0;
            this.list[i].deviceEntity[j].state = 0;
            // 文件详情  4  fileState   =>   descript
            this.list[i].deviceEntity[j].descript = "--";
            // this.list[i].comps[j].ifRestart = false;
            // this.list[i].comps[j].ifWait = false;
          }
        }
        //   ???
        this.listLength = response.data.data.length;
        // this.getList2();
      });
    },
    getList2() {
      //  SockJS包装的Websocket
      let url = service.defaults.baseURL + "/OMS";
      let socket = new SockJS(url);

      // 创建STOMP客户端 在web浏览器中使用普通的Web Socket
      let stompClient = Stomp.over(socket);
      // console.log(stompClient);
      stompClient.debug = null;
      let that = this;
      stompClient.connect({}, function(frame) {
        stompClient.subscribe("/onlineDevice", function(response) {
          let resBody = response.body;
          let resBody2 = resBody.replace(/[\\]/g, "");
          that.webResBody = JSON.parse(resBody2);
          // console.log(that.webResBody);
          // $("#onlineheartbeatmessages").html(resBody);

          if (that.bindDeviceEntityList.length > 0) {
            for (let i = 0; i < that.bindDeviceEntityList.length; i++) {
              that.bindDeviceEntityList[i].online = false;

              if (that.bindDeviceEntityList[i].comps !== undefined) {
                for (
                  let k = 0;
                  k < that.bindDeviceEntityList[i].comps.length;
                  k++
                ) {
                  // 组件的在线状态
                  that.bindDeviceEntityList[i].comps[k].online = false;
                }
              }

              if (
                that.bindDeviceEntityList[i].online === false &&
                that.bindDeviceEntityList[i].virtual === true
              ) {
                that.bindDeviceEntityList.splice(i, 1);
                i--;
              }
            }
          }

          if (that.webResBody) {
            //  $.each :  处理json
            $.each(that.webResBody, function(key, value) {
              // console.log(key); //ip
              // console.log(value);
              let listIfExist = false;
              let tempList = [];
              for (let i = 0; i < that.list.length; i++) {
                for (let j = 0; j < that.list[i].deviceEntity.length; j++) {
                  if (
                    that.list[i].deviceEntity[j].hostAddress ===
                    value.hostAddress
                  ) {
                    that.list[i].deviceEntity[j].online = true;
                    break;
                  }
                }
              }

              // if (that.bindDeviceEntityList.length > 0) {
              //   for (let j = 0; j < that.bindDeviceEntityList.length; j++) {
              //     // console.log(222);
              //     // console.log(that.webResBody);
              //     // console.log(that.bindDeviceEntityList);

              //     if (
              //       that.bindDeviceEntityList[j].hostAddress ===
              //       value.hostAddress
              //     ) {
              //       that.bindDeviceEntityList[j].online = true;

              //       // that.list.forEach(function(item, index) {
              //       //   console.log(item);
              //       //   if (item.deviceEntity.length > 0) {
              //       //     item.deviceEntity.online = true;
              //       //   }
              //       // });
              //     }
              //     // if (that.bindDeviceEntityList[j].virtual !== true) {
              //     //   //虚拟设备不需要再赋值  或者在每次查之前把虚拟且离线的设备删除
              //     //   if (that.list[j].deviceEntity !== null) {
              //     //     if (
              //     //       value.hostAddress ===
              //     //       that.list[j].deviceEntity.hostAddress
              //     //     ) {
              //     //       //查找在线设备
              //     //       that.list[j].online = true;

              //     //       if (
              //     //         that.list[j].online &&
              //     //         that.list[j].comps !== undefined
              //     //       ) {
              //     //         for (let k = 0; k < that.list[j].comps.length; k++) {
              //     //           //重置组件的在线状态
              //     //           if (
              //     //             that.list[j].comps[k].deploymentDesignNodeEntity
              //     //               .id === that.list[j].id
              //     //           ) {
              //     //             that.list[j].comps[k].online = true;
              //     //           }
              //     //         }
              //     //       }
              //     //       that.list[j].virtual = false;
              //     //       listIfExist = true;
              //     //       break;
              //     //     }
              //     //   }
              //     // }
              //   }
              // }
            });
          }

          // 更改数据: 更改嵌套表格指定数据:start   : Vue文档中明确指出的注意事项，由于 JavaScript 的限制，Vue 不能检测出数据的改变，所以当我们需要动态改变数据的时候，Vue.set()完全可以满足我们的需求。
          for (let i = 0; i < that.list.length; i++) {
            for (let j = 0; j < that.list[i].deviceEntity.length; j++) {
              if (that.list[i].deviceEntity.length > 0) {
                //    Vue.set( target, key, value ) ; Vue.set()不光能修改数据，还能添加数据
                // target：要更改的数据源(可以是对象或者数组)
                // key：要更改的具体数据
                // value ：重新赋的值
                Vue.set(
                  that.list[i].deviceEntity,
                  j,
                  that.list[i].deviceEntity[j]
                );
              }
            }
          }
          // 更改数据: 更改嵌套表格指定数据:end
        });

        stompClient.subscribe("/deployProgress/" + that.deployPlanId, function(
          response
        ) {
          let progressBody = response.body;
          let progressBody2 = progressBody.replace(/[\\]/g, "");
          that.webProgressBody.push(JSON.parse(progressBody2));

          if (that.webProgressBody.length > 0) {
            for (let i = 0; i < that.webProgressBody.length; i++) {
              if (that.list.length > 0) {
                for (let j = 0; j < that.list.length; j++) {
                  if (that.list[j].deviceEntity) {
                    if (
                      that.webProgressBody[i].hostAddress ==
                      that.list[j].deviceEntity.hostAddress
                    ) {
                      //查找此设备
                      // that.list[j].progress = parseFloat(that.webProgressBody[i].progress.toFixed(2));
                      that.list[j].progress = parseInt(
                        that.webProgressBody[i].progress
                      );
                      that.list[j].speed = parseFloat(
                        that.webProgressBody[i].speed.toFixed(2)
                      );
                      that.list[j].state = that.webProgressBody[i].state;
                      that.list[j].fileState = that.webProgressBody[i].state;
                      that.list[j].descript =
                        that.webProgressBody[i].description;
                      if (that.list[j].comps) {
                        for (let k = 0; k < that.list[j].comps.length; k++) {
                          //重置为可部署状态
                          if (that.list[j].progress !== 100) {
                            that.list[j].comps[k].ifComplete = false;
                            that.list[j].comps[k].ifWait = true;
                          } else {
                            that.list[j].comps[k].ifComplete = true;
                            that.list[j].comps[k].ifWait = false;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });
      });
    },
    //  点击组件名: 查询绑定设备详情
    expandRow(row, rowList) {
      // if (!row.comps) {
      //   row.loading = true;
      //   // 查询部署节点绑定详情
      //   getNodeDetail(row.id).then(res => {
      //     for (let i = 0; i < this.list.length; i++) {
      //       if (res.data.data.length > 0 && row.id === this.list[i].id) {
      //         this.list[i].comps = res.data.data;
      //         for (let j = 0; j < this.list[i].comps.length; j++) {
      //           this.list[i].comps[j].online = false;
      //           this.list[i].comps[j].ifRestart = false;
      //           this.list[i].comps[j].ifWait = false;
      //         }
      //         break;
      //       }
      //     }
      //     this.deviceExpands.push(row.id);
      //   });
      // }

      //------点击组件名: 查询绑定设备详情
      // if (row.deviceEntity.length > 0) {
      //   row.deviceEntity.forEach(function(value, index) {
      //     console.log(value);
      //     console.log(index);
      //   });
      // }
      // this.bindDeviceEntityList = row.deviceEntity;

      if (rowList.length) {
        // 只展开一行//说明展开了
        this.deviceExpands = [];
        if (row) {
          this.deviceExpands.push(row.id); // 只展开当前行id
        }
        //  这里可以调用接口数据渲染
        this.getList2();
      } else {
        // 说明收起了
        this.deviceExpands = [];
        //置空刚才展开嵌套表格时:调用的websocket
        // this.socket.close();
      }
    },

    deployByNode: function(row) {
      let id = row.id;
      let online = false;
      let thisState;

      for (let i = 0; i < this.list.length; i++) {
        for (let j = 0; j < this.list[i].deviceEntity.length; j++) {
          if (this.list[i].deviceEntity[j].id === id) {
            online = this.list[i].deviceEntity[j].online;
            thisState = this.list[i].deviceEntity[j].state;
            break;
          }
        }
      }
      if (online) {
        if (thisState !== 3) {
          //部署状态为3时表示正在部署
          this.$confirm("确认部署吗？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              let data = {
                deployMethod: "TCP"
              };
              let qs = require("qs");
              let deployData = qs.stringify(data);
              // this.deployLoading = true
              row.deployLoading = true;
              let didi = "5a153e21-a27c-4ac7-9055-7ecf46b60a3b";
              deployNode(didi)
                .then(() => {
                  // this.deployLoading = false
                  row.deployLoading = false;
                  this.dialogFormVisible = false;
                  this.$notify({
                    title: "成功",
                    message: "开始部署",
                    type: "success",
                    duration: 2000
                  });
                })
                .catch(err => {
                  row.deployLoading = false;
                  if (err.response.data.data.length != 0) {
                    this.$notify({
                      title: "失败",
                      message: err.response.data.data,
                      type: "error",
                      duration: 2000
                    });
                  }
                });
            })
            .catch(() => {
              this.$message({
                type: "info",
                message: "已取消部署"
              });
            });
        } else {
          row.deployLoading = false;
          this.$message({
            message: "此设备正在部署!",
            type: "warning"
          });
        }
      }
    },

    // 一键部署
    deployAll: function() {
      this.deployIds.splice(0, this.deployIds.length);
      for (let i = 0; i < this.list.length; i++) {
        // 所有在线设备
        if (this.list[i].online === true) {
          this.deployIds.push(this.list[i].id);
        }
      }

      // 一键部署的id
      /*console.log('一键部署的id');
        console.log(this.deployPlanId);
        console.log(this.deployIds);*/

      if (this.deployIds.length > 0) {
        //有设备在线
        this.$confirm("确认部署所有在线设备吗吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            deployAll(this.deployPlanId)
              .then(() => {
                // this.deployLoading = false
                this.$notify({
                  title: "成功",
                  message: "开始部署",
                  type: "success",
                  duration: 2000
                });
              })
              .catch(err => {
                if (err.response.data.data.length != 0) {
                  this.$notify({
                    title: "失败",
                    message: err.response.data.data,
                    type: "error",
                    duration: 2000
                  });
                }
              });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消部署"
            });
          });
      }
    },

    // 部署单个组件
    deployByComp: function(row) {
      let id = row.id;
      let deviceId = row.deploymentDesignNodeEntity.deviceEntity.id;

      let ifOnline = false;

      for (let i = 0; i < this.list.length; i++) {
        if (
          this.list[i].deviceEntity !== null &&
          deviceId === this.list[i].deviceEntity.id &&
          this.list[i].online
        ) {
          ifOnline = true;
          break;
        }
      }
      // console.log(row);

      if (ifOnline) {
        // 判断该组件所绑定的设备是否在线
        this.$confirm("确认部署吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            row.ifRestart = true;
            for (let i = 0; i < this.list.length; i++) {
              console.log(this.list[i].id);
              if (row.deploymentDesignNodeEntity.id === this.list[i].id) {
                for (let j = 0; j < this.list[i].comps.length; j++) {
                  this.list[i].comps[j].ifWait = true;
                }
              }
            }
            //document.getElementById("compSvg").icon-class = "restart.svg";
            deployByDeploymentDesignDetailId(id)
              .then(() => {
                this.$notify({
                  title: "成功",
                  message: "开始部署",
                  type: "success",
                  duration: 2000
                });
              })
              .catch(err => {
                if (err.response.data.data.length != 0) {
                  this.$notify({
                    title: "失败",
                    message: err.response.data.data,
                    type: "error",
                    duration: 2000
                  });
                }
              });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消部署"
            });
          });
      }
    }
  },
  computed: {
    // 前端搜索
    listA: function() {
      let self = this;
      if (self.list !== null) {
        return self.list.filter(function(item) {
          if (item.componentEntity !== null) {
            return (
              item.componentEntity.name
                .toLowerCase()
                .indexOf(self.searchQuery.toLowerCase()) !== -1
            );
          } else {
            return (
              item.version
                .toLowerCase()
                .indexOf(self.searchQuery.toLowerCase()) !== -1
            );
          }
        });
      }
    },
    listenProjectId() {
      return this.$store.state.app.projectId;
    },
    computedProgress() {
      return function(num) {
        if (num == 0 || !num) {
          return 0;
        } else {
          return Math.round(num);
        }
      };
    },
    computedDeploySpeed() {
      return function(speed) {
        if (speed >= 0 && speed <= 1000) {
          return Math.round(speed * 10) / 10 + "KB/S";
        }
        if (speed > 1000 && speed <= 50000) {
          return Math.round(speed / 10) / 100 + "MB/S";
        }
        if (speed > 50000) {
          return "50MB/S";
        }
        if (!speed) {
          return 0 + "KB/S";
        }
      };
    }
  },
  watch: {
    listenProjectId: function() {
      this.proId = this.getCookie("projectId");
      this.getList();
    }
  }
};
</script>

<style scoped></style>
