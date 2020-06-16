<template>
  <div
    class="app-container calendar-list-container"
    style="position: absolute;top: 85px;bottom: 0;width: 100%;height: 90%"
  >
    <div style="height: 30px;padding:4px 4px;color:#777;">
      当前部署设计：{{ currentName }}
    </div>
    <split-pane split="vertical" class="splicClass" style="height: 96%">
      <template slot="paneL">
        <div class="filter-container" style="padding: 10px 0 5px 5px">
          <el-input
            style="width: 200px;"
            class="filter-item"
            placeholder="请输入已绑定组件名称"
            v-model="searchQuery"
          ></el-input>
          <el-button
            class="filter-item"
            style="margin-left: 10px;float:right;"
            @click="addNode"
            type="success"
            icon="el-icon-edit"
            v-show="!isHistory"
            >添加节点</el-button
          >
        </div>
        <div style="height: 80%;padding-left: 6px;">
          <el-table
            :key="tableKey"
            :data="listA"
            v-loading="listLoading"
            element-loading-text="给我一点时间"
            border
            fit
            highlight-current-row
            stripe
            height="100%"
            style="width: 100%;"
            class="nodeTable"
          >
            <!-- 已绑定组件 -->
            <el-table-column align="center" label="已绑定组件" min-width="130">
              <template slot-scope="scope">
                <span
                  v-if="scope.row.componentEntity"
                  class="link-type"
                  @click="designNodeDetail(scope.row)"
                  >{{ scope.row.componentEntity.name }}</span
                >
                <span
                  v-else
                  class="link-type"
                  @click="designNodeDetail(scope.row)"
                  >未绑定组件</span
                >
              </template>
            </el-table-column>
            <!-- 组件创建时间  createTime -->
            <el-table-column
              align="center"
              label="组件创建时间"
              min-width="130"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.componentEntity">{{
                  scope.row.componentEntity.createTime
                }}</span>
                <span v-else>未绑定组件</span>
              </template>
            </el-table-column>
            <!-- 组件路径 -->
            <el-table-column align="center" label="组件路径" min-width="130">
              <template slot-scope="scope">
                <span v-if="scope.row.componentEntity">{{
                  scope.row.componentEntity.relativePath
                }}</span>
                <span v-else>未绑定组件</span>
              </template>
            </el-table-column>
            <!-- 绑定设备 -->
            <!-- <el-table-column align="center" label="设备ip" min-width="140">
              <template slot-scope="scope">
                <span v-if="scope.row.deviceEntity">
                  {{ scope.row.deviceEntity.hostAddress }}
                </span>
                <span v-else>未绑定设备</span>
              </template>
            </el-table-column> -->
            <!-- 选择组件 -->
            <el-table-column
              align="center"
              label="选择组件"
              width="90"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-button
                  type="success"
                  plain
                  size="mini"
                  @click="handleSelectComps(scope.row)"
                  >选择组件</el-button
                >
              </template>
            </el-table-column>
            <!-- 选择设备 -->
            <el-table-column
              align="center"
              label="选择设备"
              width="90"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  plain
                  size="mini"
                  @click="handleSelectEquipments(scope.row)"
                  >选择设备</el-button
                >
              </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column
              align="center"
              :label="$t('table.actions')"
              width="110"
            >
              <template slot-scope="scope">
                <el-dropdown trigger="click" v-if="!scope.row.deleted">
                  <span class="el-dropdown-link" v-if="!scope.row.virtual">
                    <el-button type="success" plain size="mini"
                      >更多操作</el-button
                    >
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>
                      <span
                        style="display:inline-block;padding:0 10px;"
                        @click="handleDelete(scope.row)"
                        >删除</span
                      >
                    </el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.deviceEntity" divided>
                      <span
                        style="display:inline-block;padding:0 10px;"
                        @click="unbindDevice(scope.row)"
                        >解绑</span
                      >
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <span id="clicktag"></span>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="10"
            layout="total, sizes, prev, pager, next, jumper"
            :total="this.total"
            background
            style="text-align: center;margin-top:20px"
          ></el-pagination>
        </div>
      </template>
      <!-- 设备组件关系图 -->
      <template slot="paneR" id="ERDiv">
        <div style="height: 100%;">
          <!--<div id="deviceComp" style="width: 100%;height:440px;"></div>-->
          <div class="chart-container" style="width: 100%;height:550px;">
            <deployBindER
              id="ER"
              ref="deployBindER"
              :detaillist="nodeDetail"
              :currentNodeInfo="currentNodeInfo"
            ></deployBindER>
            <!--<fullScreenER></fullScreenER>-->
          </div>
        </div>
      </template>
    </split-pane>

    <!--部署设计节点选择组件对话框-->
    <el-dialog
      title="选择组件"
      :visible.sync="selectCompDialogVisible"
      width="60%"
      class="no-padding-dialog"
     >
      <span id="compClickTag"></span>
      <el-input
        style="width: 200px;position: absolute;top: 16px;left: 100px;"
        class="filter-item"
        placeholder="请输入组件名称"
        v-model="searchAbleCompQuery"
      ></el-input>
      <!-- 添加组件 -->
      <!-- <el-button
        size="mini"
        type="primary"
        style="position: absolute;top: 15px; left: 316px;"
        @click="handleCompCreate"
        >添加组件</el-button
      > -->
      <div class="selectDetail" style="min-height: 300px;overflow: hidden;">
        <div
          class="ableToSelectComp"
          style="width:50%;float: left;padding: 10px;"
        >
          <el-table
            :data="listAbleComp"
            border
            fit
            max-height="600"
            highlight-current-row
            stripe
            @expand-change="getCompHis"
            :row-key="getRowKeysComp"
            :expand-row-keys="compExpands"
            style="width: 100%;"
          >
            <el-table-column align="left" width="40" type="expand">
              <template slot-scope="props">
                <div
                  v-loading="props.row.hisVersion == undefined"
                  style="min-height: 60px;"
                  element-loading-text="正在查询历史组件"
                  element-loading-spinner="el-icon-loading"
                >
                  <div
                    v-for="item in props.row.hisVersion"
                    style="width: 100%;padding: 10px;"
                    class="comp-his"
                    :key="item.index"
                  >
                    <span style="display: inline-block;width: 70%;">
                      <svg-icon icon-class="history1"></svg-icon>
                      {{ item.createTime }}
                    </span>
                    <span
                      style="display: inline-block;width: 20%;text-align: center"
                    >
                      <!--<el-button size="mini" type="success" @click="handleBindComp(item.id, item, props.row)" :loading="props.row.binding || item.binding">绑定</el-button>-->
                      <el-tooltip
                        content="绑定此版本"
                        effect="dark"
                        placement="top-start"
                      >
                        <el-button
                          type="text"
                          @click="handleBindComp(item.id, item, props.row)"
                          :loading="props.row.binding || item.binding"
                        >
                          <svg-icon
                            icon-class="bind"
                            style="font-size: 16px;position: relative;top: 2px;"
                          ></svg-icon>
                        </el-button>
                      </el-tooltip>
                    </span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="可选组件"
              min-width="120"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-tooltip placement="top">
                  <div slot="content">
                    版本：{{ scope.row.version }}
                    <br />
                    相对路径：{{ scope.row.relativePath }}
                  </div>
                  <span>{{ scope.row.name }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="操作"
              width="80"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-button
                  type="success"
                  size="mini"
                  @click="findNewestAndBind(scope.row)"
                  :loading="scope.row.binding"
                  >绑定</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="selectedComp" style="width:50%;float: left;padding: 10px;">
          <el-table
            :data="bindedCompList"
            border
            fit
            highlight-current-row
            max-height="600"
            stripe
            style="width: 100%;"
          >
            <el-table-column
              align="center"
              label="已绑定组件"
              min-width="120"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.componentHistoryEntity.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="当前版本创建时间"
              min-width="80"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.componentHistoryEntity.createTime }}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="操作"
              width="100"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="解除绑定"
                  placement="top"
                >
                  <el-button
                    type="text"
                    style="color: #f56c6c;font-size: 17px;margin-right: 6px;"
                    @click="unbindComp(scope.row)"
                  >
                    <svg-icon icon-class="delete"></svg-icon>
                  </el-button>
                  <!--<span style="color: #f56c6c;font-size: 17px;margin-right: 6px;cursor: pointer;" @click="unbindComp(scope.row)" ><svg-icon icon-class="delete"></svg-icon></span>-->
                </el-tooltip>
                <el-popover
                  placement="left"
                  width="900"
                  @show="chekHisVersion(scope.row)"
                  trigger="click"
                >
                  <span
                    slot="reference"
                    @click="handleSwithCompVersion(scope.row)"
                    class="icon-show-popover"
                  >
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="
                        scope.row.popoverVisible ? '关闭窗口' : '切换版本'
                      "
                      placement="top"
                    >
                      <span
                        style="color: #409eff;font-size: 17px;cursor: pointer;margin-right: 6px;"
                      >
                        <svg-icon icon-class="open"></svg-icon>
                      </span>
                    </el-tooltip>
                  </span>
                  <el-table
                    border
                    stripe
                    highlight-current-row
                    :data="scope.row.hisVersion"
                    style="padding: 0 0"
                    :show-header="false"
                  >
                    <el-table-column align="center" width="40">
                      <template slot-scope>
                        <span>
                          <svg-icon icon-class="history1"></svg-icon>
                        </span>
                      </template>
                    </el-table-column>
                    <el-table-column label="名称" align="left">
                      <template slot-scope="scope">
                        <span>{{ scope.row.createTime }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="80px">
                      <template slot-scope="scope">
                        <el-button
                          size="mini"
                          @click="switchCompHis(scope.row)"
                          type="success"
                          >绑定</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                </el-popover>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="部署时使用最新版本"
                  placement="top"
                  v-if="!scope.row.keepLatest"
                >
                  <span
                    class="icon-update"
                    @click="keepUpdated(scope.row, true)"
                  >
                    <svg-icon icon-class="update"></svg-icon>
                  </span>
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="部署时使用当前版本"
                  placement="top"
                  v-else
                >
                  <span
                    class="icon-update"
                    @click="keepUpdated(scope.row, false)"
                  >
                    <svg-icon icon-class="update-disable"></svg-icon>
                  </span>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- 添加组件 -->
      <el-dialog
        title="添加组件"
        class="filesDialog"
        :visible.sync="compDialogFormVisible"
        top="7vh"
        width="86%"
        append-to-body
       >
        <el-form
          :rules="componentRules"
          ref="dataCompForm"
          :model="compTemp"
          label-width="100px"
          style="width: 100%;height: 100%"
        >
          <div
            style="height: 90%;overflow-y: auto;width: 40%;float: left;padding-right: 16px;position: relative;"
          >
            <el-form-item :label="$t('table.compName')" prop="name">
              <el-input v-model="compTemp.name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('table.compVersion')" prop="version">
              <el-input v-model="compTemp.version"></el-input>
            </el-form-item>
            <el-form-item :label="$t('table.compPath')" prop="relativePath">
              <el-tooltip
                class="item"
                effect="dark"
                :content="noticeContent"
                placement="top-start"
              >
                <el-input
                  v-model="compTemp.relativePath"
                  placeholder="/test，必须以斜杠开头，文件夹名称结尾"
                ></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('table.compDesc')" prop="desc">
              <el-input v-model="compTemp.description"></el-input>
            </el-form-item>
            <div class="button-container" style="float: right;">
              <el-button @click="compDialogFormVisible = false">关闭</el-button>
              <el-button
                v-if="showConfirmBtn"
                type="primary"
                @click="createComp"
                :loading="creComLoading"
                >{{ $t("table.confirm") }}</el-button
              >
            </div>
          </div>
          <div
            style="height: 100%;overflow: auto;width: 60%;float: right;padding:5px 0 10px 10px;border-left:1px solid #ccc;margin-top: -44px"
            v-loading="managerLoading"
            element-loading-text="请先填写组件的基本信息并创建"
          >
            <comFileManage
              ref="createComFile"
              :selectCompId="selectedCompId"
              :selectCompName="selectedCompName"
            ></comFileManage>
          </div>
        </el-form>
      </el-dialog>
      <addComponents v-show="dialogVisibleAddComponents" ref="addComponents"></addComponents>
    </el-dialog>
    <!-- 部署设计节点选择设备对话框 -->
    <el-dialog
      title="选择设备"
      :visible.sync="selectDeviceDialogVisible"
      width="60%"
      class="no-padding-dialog"
     >
      <span id="compClickTag"></span>
      <el-input
        style="width: 200px;position: absolute;top: 16px;left: 100px;"
        class="filter-item"
        placeholder="请输入用户ip"
        v-model="searchQueryDevice"
      >
      </el-input>
      <el-button
        size="mini"
        type="primary"
        style="position: absolute;top: 15px; left: 316px;"
        @click="handleDeviceCreate"
        >添加设备
      </el-button>
      <div class="selectDetail" style="min-height: 300px;overflow: hidden;">
        <!-- 左 -->
        <div
          class="ableToSelectComp"
          style="width:50%;float: left;padding: 10px;"
        >
          <el-table
            :key="tableKey"
            :data="listAbleDevice"
            v-loading="deviceLoading"
            element-loading-text="给我一点时间"
            border
            fit
            highlight-current-row
            ref="deviceTable"
            style="width: 100%;"
            @selection-change="handleCheckedDeviceChange"
            id="deviceTable"
          >
            <el-table-column label="设备名" width="160" align="left">
              <template slot-scope="scope">
                <svg-icon icon-class="设备"></svg-icon>
                <span>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
              min-width="100px"
              align="left"
              :label="$t('table.deviceIP')"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.hostAddress }}</span>
              </template>
            </el-table-column>
            <el-table-column
              min-width="90px"
              align="left"
              :label="$t('table.compPath')"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.deployPath }}</span>
              </template>
            </el-table-column>
            <!-- 绑定设备: 操作 -->
            <el-table-column
              align="center"
              label="操作"
              width="80"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-button
                  type="warning"
                  size="mini"
                  @click="bindDevice(scope.row)"
                  :loading="scope.row.binding"
                  >绑定</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 右 -->
        <div class="selectedComp" style="width:50%;float: left;padding: 10px;">
          <el-table
            :data="boundDeviceList"
            border
            fit
            highlight-current-row
            max-height="600"
            stripe
            style="width: 100%;"
          >
            <!-- 已绑定设备 -->
            <el-table-column label="已绑定设备" width="160" align="left">
              <template slot-scope="scope">
                <svg-icon icon-class="设备"></svg-icon>
                <span>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <!-- ip -->
            <el-table-column
              min-width="100px"
              align="left"
              :label="$t('table.deviceIP')"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.hostAddress }}</span>
              </template>
            </el-table-column>
            <!-- 相对路径 -->
            <el-table-column
              min-width="90px"
              align="left"
              :label="$t('table.compPath')"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.deployPath }}</span>
              </template>
            </el-table-column>
            <!-- 单独解绑设备: 操作 -->
            <el-table-column
              align="center"
              label="操作"
              width="100"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="解除绑定"
                  placement="top"
                >
                  <el-button
                    type="text"
                    style="color: #f56c6c;font-size: 17px;margin-right: 6px;"
                    @click="clickAloneUnboundEquipment(scope.row)"
                    ><svg-icon icon-class="delete"></svg-icon
                  ></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <el-dialog
        title="添加组件"
        class="filesDialog"
        :visible.sync="compDialogFormVisible"
        top="7vh"
        width="86%"
        append-to-body=""
      >
        <el-form
          :rules="componentRules"
          ref="dataCompForm"
          :model="compTemp"
          label-width="100px"
          style="width: 100%;height: 100%"
        >
          <div
            style="height: 90%;overflow-y: auto;width: 40%;float: left;padding-right: 16px;position: relative;"
          >
            <el-form-item :label="$t('table.compName')" prop="name">
              <el-input v-model="compTemp.name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('table.compVersion')" prop="version">
              <el-input v-model="compTemp.version"></el-input>
            </el-form-item>
            <el-form-item :label="$t('table.compPath')" prop="relativePath">
              <el-tooltip
                class="item"
                effect="dark"
                :content="noticeContent"
                placement="top-start"
              >
                <el-input
                  v-model="compTemp.relativePath"
                  placeholder="/test，必须以斜杠开头，文件夹名称结尾"
                ></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('table.compDesc')" prop="desc">
              <el-input v-model="compTemp.description"></el-input>
            </el-form-item>
            <div class="button-container" style="float: right;">
              <el-button @click="compDialogFormVisible = false">关闭</el-button>
              <el-button
                v-if="showConfirmBtn"
                type="primary"
                @click="createComp"
                :loading="creComLoading"
                >{{ $t("table.confirm") }}</el-button
              >
            </div>
          </div>
          <div
            style="height: 100%;overflow: auto;width: 60%;float: right;padding:5px 0 10px 10px;border-left:1px solid #ccc;margin-top: -44px"
            v-loading="managerLoading"
            element-loading-text="请先填写组件的基本信息并创建"
          >
            <comFileManage
              ref="createComFile"
              :selectCompId="selectedCompId"
              :selectCompName="selectedCompName"
            ></comFileManage>
          </div>
        </el-form>
      </el-dialog>
    </el-dialog>
    <!--添加设备对话框-->
    <el-dialog
      title="添加设备"
      :visible.sync="deviceDialogFormVisible"
      width="40%"
      append-to-body=""
     >
      <el-form
        :rules="deviceRules"
        ref="dataDeviceForm"
        :model="deviceTemp"
        label-width="100px"
        :disabled="deviceTemp.virtual"
        style="width: 80%; margin:0 auto;"
      >
        <el-form-item :label="$t('table.deviceName')" prop="name">
          <el-input v-model="deviceTemp.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('table.deviceIP')" prop="hostAddress">
          <el-input v-model="deviceTemp.hostAddress"></el-input>
        </el-form-item>
        <el-form-item :label="$t('table.devicePath')" prop="deployPath">
          <el-tooltip placement="top">
            <div slot="content">
              此路径为设备接收部署文件的路径。例如:<br />Windows: C:/test<br />Linux:
              /test<br />Vxworks: /test
            </div>
            <el-input
              v-model="deviceTemp.deployPath"
              placeholder="例如：D:/test"
            ></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('table.deviceDesc')" prop="description">
          <el-input v-model="deviceTemp.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="deviceDialogFormVisible = false"
          style="margin-right: 10px"
          >{{ $t("table.cancel") }}</el-button
        >
        <el-button
          type="primary"
          @click="createDevice"
          :loading="creDevLoading"
          >{{ $t("table.confirm") }}</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import {
  deployplanList,
  createDeployplan,
  updateDeployplan,
  deleteDeployplan,
  hisDeployplan,
  cleanDeployplan,
  restoreDeployplan
} from "@/api/deployplan";
import {
  deployNodeList,
  deleteDeployplanNode,
  createDeployplanNode,
  bindDeviceToNode,
  componentBindingDevice,
  unbindDeviceByNode,
  getAllBindDevices,
  getNodeDetail,
  bindCompToNode,
  bindCompsToNode,
  bindCompHisToNode,
  deleteBindDetail,
  getAvailableComps,
  bindSingleCompHisToNode,
  updateCompHisToNode,
  keepLatest,
  singeUnbundling,
  aloneUnboundEquipment
} from "@/api/deployDesignNode";
import { Loading } from "element-ui";
import { compList } from "@/api/component";
import { saveDevices, getDevices, getAllDevices } from "@/api/device";
import { doDeployBind, getDeployComLists, deleteBind } from "@/api/deployBind";
import { createComp, compHisVersion, compHisVersions } from "@/api/component";
import comFileManage from "@/views/fileManager/filecomp";
import waves from "@/directive/waves"; // 水波纹指令
import splitPane from "vue-splitpane";
import deployBindER from "../deployBind/deployBindER";
import fullScreenER from "../deployBind/fullScreenER";
import Sortable from "sortablejs";
import Vue from "vue";
import addComponents from "@/views/components/index";
export default {
  name: "designNode",
  components: {
    splitPane,
    deployBindER,
    comFileManage,
    fullScreenER,
    addComponents
  },
  directives: {
    waves
  },
  data() {
    const validateIP = (rule, value, callback) => {
      //ip地址
      let exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      let reg = value.match(exp);

      if (value.length == 0) {
        callback(new Error("请输入IP！"));
      } else if (reg == null) {
        callback(new Error("IP地址不合法！"));
      } else {
        callback();
      }
    };
    const validatePath = (rule, value, callback) => {
      let pattern = /^([a-zA-Z]:(\\))([a-zA-Z]*)|(\/([a-zA-Z]+))*$/;
      if (value.length == 0) {
        callback(new Error("请输入路径！"));
      } else if (!value.match(pattern)) {
        callback(new Error("路径格式不正确!"));
      } else {
        callback();
      }
    };

    return {
      proId: "",
      searchQuery2: "",
      deployPlanId: "",
      deployPlanName: "",
      isHistory: false,
      selectedId: "",
      deployName: "",
      tableKey: 0,
      list: [],
      listLoading: true,
      listQuery: {
        page: 0,
        size: 20,
        limit: 5,
        tagname: ""
      },
      total: null,
      pagesize: 10, //每页的数据条数
      currentPage: 1, //默认开始页面
      sortable: null,
      temp: {
        id: "",
        name: "",
        description: ""
      },
      deviceTemp: {
        name: "",
        hostAddress: "",
        deployPath: "",
        description: ""
      },
      compTemp: {
        id: "",
        name: "",
        version: "",
        relativePath: "",
        description: "",
        fileAll: ""
      },
      dialogFormVisible: false,
      baselineVisible: false,
      baselineDetailVisible: false,
      modifyBaselineVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "新建"
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [
          { required: true, message: "type is required", trigger: "change" }
        ],
        timestamp: [
          {
            type: "date",
            required: true,
            message: "timestamp is required",
            trigger: "change"
          }
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" }
        ]
      },
      deviceRules: {
        name: [{ required: true, message: "请输入设备名", trigger: "blur" }],
        hostAddress: [
          { required: true, trigger: "blur", validator: validateIP }
        ],
        deployPath: [
          { required: true, trigger: "blur", validator: validatePath }
        ]
      },
      componentRules: {
        name: [{ required: true, message: "请输入组件名", trigger: "blur" }],
        version: [{ required: true, message: "请输入版本", trigger: "blur" }],
        relativePath: [
          { required: true, trigger: "blur", validator: validatePath }
        ]
      },
      deployRules: {
        name: [
          { required: true, message: "请输入部署设计名称", trigger: "blur" }
        ]
      },
      baselineRules: {
        name: [{ required: true, message: "请输入基线名", trigger: "blur" }]
      },
      downloadLoading: false,
      creDepLoading: false,
      upDepLoading: false,
      creBasLoading: false,
      upBasLoading: false,
      searchQuery: "",
      searchQueryDevice: "",
      searchAbleCompQuery: "",
      errorMessage: "操作失败！",
      deviceList: [],
      deviceTotal: 0,
      deviceLoading: false,
      bindDeviceLoading: false,
      currentNodeId: "",
      bindDeviceId: [],
      bindedDeviceList: [],
      notBindDevice: [],
      currentDeviceList: [],
      complistLoading: false,
      bindLoading: false,
      listQuery2: {
        page: 0,
        size: 10,
        limit: 10,
        tagname: ""
      },
      total2: null,
      pagesize2: 10, //每页的数据条数
      currentPage2: 1, //默认开始页面
      listComp: [],
      componentIds: [],
      componentHisIds: [],
      bindCompsId: [],
      repeatCompsId: [],
      checkedHisComId: [],
      watchArr: [],
      radio: "",
      nodeDetail: [],
      currentNodeInfo: {},
      compExpands: [],
      currentName: "",
      saveChecked: false,
      creDevLoading: false,
      deviceDialogFormVisible: false,
      creComLoading: false,
      managerLoading: false,
      compDialogFormVisible: false,
      selectCompDialogVisible: false,
      selectDeviceDialogVisible: false,
      selectedCompId: "",
      selectedCompName: "",
      showConfirmBtn: true,
      noticeContent:
        "此路径为组件在设备上的相对路径，必须以斜杠开头，文件夹名称结尾，例如/test",
      availableCompList: [],
      bindedCompList: [],
      currentBindedComHisId: "",
      boundDeviceList: [],
      dialogVisibleAddComponents: false
    };
  },
  created() {
    this.proId = this.$store.getters.projectId;
    this.isHistory = false;
    this.deployPlanId = this.$route.params.id;
    this.deployPlanName = this.$route.params.name;
    this.currentName = this.$route.query.name;
    this.getList();
    this.getDeviceList();
  },
  methods: {
    addNode() {
      this.$confirm("确认添加节点吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          createDeployplanNode(this.deployPlanId)
            .then(() => {
              this.list.unshift(this.temp);
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
              this.getList();
            })
            .catch(error => {
              this.errorMessage = "操作失败！";
              if (error.response.data.message) {
                this.errorMessage = error.response.data.message;
              }
              this.$notify({
                title: "创建失败",
                message: this.errorMessage,
                type: "error",
                duration: 2000
              });
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消添加节点"
          });
        });
    },
    getList() {
      // alert('节点列表接口数据请求事件发生了')
      this.listLoading = true;
      deployNodeList(this.deployPlanId, this.listQuery).then(res => {
        this.isHistory = false;
        this.list = res.data.data.content;
        // 显示组件名
        this.listLoading = false;
        this.total = res.data.data.totalElements;
      });
    },
    getDeviceList() {
      let projectId = this.getCookie("projectId");
      getAllDevices(projectId).then(response => {
        this.deviceList = response.data.data;
        this.deviceTotal = response.data.data.length;
        this.deviceLoading = false;
        /*for (let i = 0; i < this.list.length; i++) {
            this.deviceList[i].online = false;
            this.deviceList[i].virtual = false;
          }*/
        // this.listLength = response.data.data.length
        // this.getList2()
      });
    },
    //添加设备
    resetDeviceTemp() {
      this.deviceTemp = {
        name: "",
        hostAddress: "",
        deployPath: "",
        description: ""
      };
    },
    handleDeviceCreate() {
      this.resetDeviceTemp();
      this.deviceDialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataDeviceForm"].clearValidate();
      });
    },
    createDevice() {
      this.$refs["dataDeviceForm"].validate(valid => {
        if (valid) {
          this.creDevLoading = true;
          let formData = new FormData();
          formData.append("name", this.deviceTemp.name);
          formData.append("hostAddress", this.deviceTemp.hostAddress);
          formData.append("deployPath", this.deviceTemp.deployPath);
          formData.append("description", this.deviceTemp.description);
          saveDevices(this.proId, formData)
            .then(res => {
              this.creDevLoading = false;
              this.deviceDialogFormVisible = false;
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
              this.getList();
              this.getUnboundDeviceList();
            })
            .catch(error => {
              this.creDevLoading = false;
              this.errorMessage = "操作失败！";
              if (error.response.data.message) {
                this.errorMessage = error.response.data.message;
              }
              this.$notify({
                title: "创建设备失败",
                message: this.errorMessage,
                type: "error",
                duration: 2000
              });
            });
        }
      });
    },
    //添加组件
    resetCompTemp() {
      this.compTemp = {
        id: "",
        name: "",
        version: "",
        relativePath: "",
        description: "",
        fileAll: ""
      };
    },
    handleCompCreate() {
      this.showConfirmBtn = true;
      this.managerLoading = true;
      this.resetCompTemp();
      this.selectedCompId = "";
      this.selectedCompName = "";
      this.compDialogFormVisible = true;
      this.$nextTick(() => {
        if (this.$refs.createComFile.list) {
          this.$refs.createComFile.list = [];
          this.$refs.createComFile.breadcrumbList = [];
        }
        this.$refs["dataCompForm"].clearValidate();
      });
    },
    // 设计节点：  选择组件·，添加组件事件
    createComp() {
      alert(1);
      this.$refs["dataCompForm"].validate(valid => {
        if (valid) {
          const createloading = Loading.service({
            lock: true,
            text: "Loading",
            spinner: "el-icon-loading"
          });
          this.creComLoading = true;
          let formData = new FormData();
          formData.append("name", this.compTemp.name);
          formData.append("version", this.compTemp.version);
          formData.append("relativePath", this.compTemp.relativePath);
          formData.append("description", this.compTemp.description);
          createComp(this.proId, formData)
            .then(res => {
              this.showConfirmBtn = false;
              this.creComLoading = false;
              createloading.close();
              this.selectedCompId = res.data.data.id;
              this.selectedCompName = res.data.data.name;
              this.managerLoading = false;
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
              this.getList();
              this.getAbleComps(this.currentNodeId);
            })
            .catch(error => {
              this.showConfirmBtn = true;
              this.creComLoading = false;
              createloading.close();
              this.errorMessage = "操作失败！";
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
    //表格:选择设备
    handleCheckedDeviceChange(val) {
      this.bindDeviceId = val;
    },

    // 这个方法留意
    handleCheckedCompsChange(val) {
      //所选的组件，checkbox
      this.checkedComps = val;
      this.componentIds.splice(0, this.componentIds.length);
      // this.componentHisIds.splice(0,this.componentHisIds.length);
      for (let i = 0; i < this.checkedComps.length; i++) {
        if (!this.checkedComps.selectedHisId) {
          this.componentIds.push(this.checkedComps[i].identify);
        }
      }
    },
    checkboxIsBind(row) {
      if (row.isBind === true || row.selectedHisId) {
        return 0;
      } else {
        return 1;
      }
    },
    devicePopShow(row) {
      this.currentNodeId = row.id;
    },
    designNodeDetail(row) {
      this.currentNodeInfo = row;
      getNodeDetail(row.id).then(res => {
        this.nodeDetail = res.data.data;
      });
    },

    //绑定:  设备: 以组件为视角,(一个组件)绑定多个设备(原来:一个设备绑定多个组件)
    // bindDevice() {
    //   if (this.bindDeviceId.length == 0) {
    //     this.$message({
    //       message: "您还未选择设备",
    //       type: "error"
    //     });
    //     this.bindDeviceLoading = false;
    //     return;
    //   } else {
    //     this.bindDeviceLoading = true;
    //     let deviceIds = [];
    //     this.bindDeviceId.forEach(item => {
    //       // deviceIds.push(item.id);
    //       deviceIds.push(JSON.stringify({ id: item.id }));
    //     });
    //     // console.log(deviceIds);
    //     // 参数格式: ["{"id":"1d2ee382-be2e-467b-894b-ec06d85f4787"}", "{"id":"29bf3555-d4ce-4553-8067-661c59738b6d"}", "{"id":"cf5ffebb-acfb-4411-8f77-62b1c22ff11f"}"]
    //     // bindDeviceToNode(this.currentNodeId, this.bindDeviceId[0].id)
    //     componentBindingDevice(this.currentNodeId, JSON.stringify(deviceIds))
    //       .then(res => {
    //         this.$notify({
    //           title: "成功",
    //           message: "设备绑定成功",
    //           type: "success",
    //           duration: 2000
    //         });
    //         document.getElementById("clicktag").click();
    //         this.bindDeviceLoading = false;
    //         this.getList();
    //         // 父组件传给子组件的数据
    //         // :detaillist="nodeDetail"
    //         // :currentNodeInfo="currentNodeInfo"
    //         // 绑定设备按钮事件：获取到已绑定的设备信息
    //         this.currentNodeInfo = res.data;
    //         // 查询部署节点绑定详情, 获取当前节点已绑定所有组件和设备的信息
    //         getNodeDetail(this.currentNodeId).then(res => {
    //           // console.log(res.data);
    //           // 获取到所有的组件和设备信息
    //           this.nodeDetail = res.data.data;
    //         });
    //       })
    //       .catch(() => {
    //         this.$notify({
    //           title: "失败",
    //           message: "设备绑定失败",
    //           type: "error",
    //           duration: 2000
    //         });
    //         this.bindDeviceLoading = false;
    //       });
    //   }
    // },
    //-----------
    // 选择设备start
    handleSelectEquipments(row) {
      this.currentNodeId = row.id;
      this.selectDeviceDialogVisible = true;
      // 获取所有未绑定设备列表
      this.getUnboundDeviceList();
      //获取已绑定设备列表
      this.getBoundDeviceList();
    },
    getUnboundDeviceList() {
      getAllBindDevices(this.deployPlanId)
        .then(res => {
          // this.currentDeviceList = res.data.data;

          let allDeviceList = res.data.data;
          this.getBoundDeviceList();
          let boundDeviceList = this.boundDeviceList;
          let unboundDeviceList = [];
          // 两个数组去同: 同样的数组,length不同
          for (var i = 0; i < allDeviceList.length; i++) {
            var obj = allDeviceList[i];
            var num = obj.id;
            var flag = false;
            for (var j = 0; j < boundDeviceList.length; j++) {
              var aj = boundDeviceList[j];
              var n = aj.id;
              if (n == num) {
                flag = true;
                break;
              }
            }
            if (!flag) {
              unboundDeviceList.push(obj);
            }
          }
          this.currentDeviceList = unboundDeviceList;
        })
        .catch(() => {});
    },
    getBoundDeviceList() {
      getNodeDetail(this.currentNodeId).then(res => {
        if (res.data.data[0].deploymentDesignNodeEntity) {
          this.boundDeviceList =
            res.data.data[0].deploymentDesignNodeEntity.deviceEntity;
        }
      });
    },
    // 单独绑定设备
    bindDevice(row) {
      this.bindDeviceId.push(row);
      let deviceIds = [];
      this.bindDeviceId.forEach(item => {
        // deviceIds.push(item.id);
        deviceIds.push(JSON.stringify({ id: item.id }));
      });
      // 参数格式: ["{"id":"1d2ee382-be2e-467b-894b-ec06d85f4787"}", "{"id":"29bf3555-d4ce-4553-8067-661c59738b6d"}", "{"id":"cf5ffebb-acfb-4411-8f77-62b1c22ff11f"}"]
      // bindDeviceToNode(this.currentNodeId, this.bindDeviceId[0].id)
      componentBindingDevice(this.currentNodeId, JSON.stringify(deviceIds))
        .then(res => {
          this.getBoundDeviceList();
          this.getUnboundDeviceList();
          this.$notify({
            title: "成功",
            message: "设备绑定成功",
            type: "success",
            duration: 2000
          });
          this.bindDeviceId = [];
          deviceIds = [];
          this.getBoundDeviceList();
          document.getElementById("clicktag").click();
          this.getList();
          // 父组件传给子组件的数据
          // :detaillist="nodeDetail"
          // :currentNodeInfo="currentNodeInfo"
          // 绑定设备按钮事件：获取到已绑定的设备信息
          this.currentNodeInfo = res.data;
          // 查询部署节点绑定详情, 获取当前节点已绑定所有组件和设备的信息
          getNodeDetail(this.currentNodeId).then(res => {
            // console.log(res.data);
            // 获取到所有的组件和设备信息
            this.nodeDetail = res.data.data;
          });
        })
        .catch(() => {
          this.bindDeviceId = [];
          deviceIds = [];
          this.$notify({
            title: "失败",
            message: "设备绑定失败: 该设备已经被其它节点绑定",
            type: "error",
            duration: 3000
          });
        });
    },
    // 单独解绑设备: 解除绑定
    clickAloneUnboundEquipment(row) {
      aloneUnboundEquipment(this.currentNodeId, row.id)
        .then(res => {
          if (res.status === 200) {
            this.getBoundDeviceList();
            this.getUnboundDeviceList();
            this.$notify({
              title: "成功",
              message: "解绑成功",
              type: "success",
              duration: 2000
            });
          }
        })
        .catch(req => {
          this.$notify({
            title: "失败",
            message: "解绑失败",
            type: "error",
            duration: 2000
          });
        });
    },

    // 选择设备end
    unbindDevice(row) {
      this.$confirm("确认解绑吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          unbindDeviceByNode(row.id)
            .then(() => {
              this.$notify({
                title: "成功",
                message: "设备解绑成功",
                type: "success",
                duration: 2000
              });
              this.getList();
              this.currentNodeInfo = { deviceEntity: null };
              getNodeDetail(row.id).then(res => {
                this.nodeDetail = res.data.data;
                // this.nodeDetail[0].currentNodeInfo = this.currentNodeInfo
              });
            })
            .catch(() => {
              this.$notify({
                title: "失败",
                message: "设备解绑失败",
                type: "error",
                duration: 2000
              });
              this.bindDeviceLoading = false;
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消解绑"
          });
        });
    },
    // 切换设备
    checkNodeDevice() {
      this.deviceLoading = true;
      let projectId = this.getCookie("projectId");
      /*getAllDevices(projectId).then(response => {
          this.deviceList = response.data.data
          this.deviceTotal = response.data.data.length
          this.searchQueryDevice = ''
          this.deviceLoading = true
          this.currentDeviceList = this.deviceList.slice() // 注意：复制数组，防止原数组被修改！！
          getAllBindDevices(this.deployPlanId).then((res) => {
            this.bindedDeviceList = res.data.data
            for (var i = 0; i < this.bindedDeviceList.length; i++) {
              this.currentDeviceList.splice(this.currentDeviceList.findIndex(item => item.id === this.bindedDeviceList[i].id), 1)
            }
            this.deviceLoading = false
          }).catch(() => {
            this.deviceLoading = false
          })
        })*/
      // 获取所有绑定设备
      getAllBindDevices(this.deployPlanId)
        .then(res => {
          this.deviceLoading = false;
          this.currentDeviceList = res.data.data;
        })
        .catch(() => {
          this.deviceLoading = false;
        });
    },
    handleSizeChange2(val) {
      // this.listQuery2.size = val
      this.listQuery2.limit = val;
      this.pagesize2 = val;
      compList(this.proId, this.listQuery2).then(response => {
        this.listComp = response.data.data.content;
        this.total2 = response.data.data.totalElements;
        this.listLoading = false;
        for (var j = 0; j < this.listComp.length; j++) {
          this.listComp[j].isBind = false;
          this.listComp[j].identify = this.listComp[j].id;
        }
        //this.listComp.isBind = false;
        this.bindCompsId.splice(0, this.bindCompsId.length);
        //为是否绑定赋值
        for (var i = 0; i < this.listBind.length; i++) {
          for (var j = 0; j < this.listComp.length; j++) {
            if (this.listBind[i].componentEntity.id == this.listComp[j].id) {
              //判断id是否相等
              this.listComp[j].isBind = true;
              this.bindCompsId.push(this.listComp[j].id);
              break;
            }
          }
        }
      });
    },
    handleCurrentChange2(val) {
      this.listQuery2.page = val - 1;
      this.currentPage2 = val;
      compList(this.proId, this.listQuery2).then(response => {
        this.listComp = response.data.data.content;
        this.total2 = response.data.data.totalElements;
        this.listLoading = false;
        for (var j = 0; j < this.listComp.length; j++) {
          this.listComp[j].isBind = false;
          this.listComp[j].identify = this.listComp[j].id;
        }
        //this.listComp.isBind = false;
        this.bindCompsId.splice(0, this.bindCompsId.length);
        //为是否绑定赋值
        for (var i = 0; i < this.listBind.length; i++) {
          for (var j = 0; j < this.listComp.length; j++) {
            if (this.listBind[i].componentEntity.id == this.listComp[j].id) {
              //判断id是否相等
              this.listComp[j].isBind = true;
              this.bindCompsId.push(this.listComp[j].id);
              break;
            }
          }
        }
      });
    },

    //绑定组件
    handleSelectComps(row) {
      this.currentNodeId = row.id;
      this.getAbleComps(row.id);
      this.compExpands = [];
      getNodeDetail(this.currentNodeId).then(res => {
        this.bindedCompList = res.data.data;
      });
      this.selectCompDialogVisible = true;
    },
    getAbleComps(id) {
      getAvailableComps(id).then(res => {
        this.availableCompList = res.data.data;
      });
    },
    getCompHis(row) {
      let indexOfId = this.compExpands.indexOf(row.id);
      if (indexOfId !== -1) {
        this.compExpands.splice(indexOfId, 1);
        return;
      }
      this.compExpands.push(row.id);
      if (!row.hisVersion) {
        row.loading = true;
        compHisVersions(row.id).then(res => {
          this.availableCompList.forEach((item, index) => {
            if (item.id === row.id) {
              row.hisVersion = res.data.data;
              Vue.set(
                this.availableCompList,
                index,
                this.availableCompList[index]
              );
              return;
            }
          });
        });
      }
    },
    // 绑定此版本
    handleBindComp(id, row, fatherRow) {
      if (this.bindedCompList.length === 1) {
        this.$message.error(
          "组件只能绑定一个! 请先解除已绑定组件后,在重新选择绑定组件"
        );
      } else if (this.bindedCompList.length === 0) {
        fatherRow.binding = true;
        this.availableCompList.forEach((itemA, indexA) => {
          if (itemA.id === fatherRow.id) {
            this.$set(this.availableCompList, indexA, fatherRow);
          }
        });
        bindSingleCompHisToNode(this.currentNodeId, id)
          .then(res => {
            this.availableCompList.forEach((item, index) => {
              if (item.id === res.data.data.componentEntity.id) {
                let indexOfComp = this.compExpands.indexOf(
                  res.data.data.componentEntity.id
                );
                if (indexOfComp !== -1) {
                  this.compExpands.splice(indexOfComp, 1);
                }
                this.availableCompList.splice(index, 1);
                getNodeDetail(this.currentNodeId).then(res => {
                  this.bindedCompList = res.data.data;
                  this.nodeDetail = res.data.data;
                });
              }
            });
            // 重新请求节点列表
            this.getList();
          })
          .catch(() => {
            fatherRow.binding = false;
            this.availableCompList.forEach((itemA, indexA) => {
              if (itemA.id === fatherRow.id) {
                this.$set(this.availableCompList, indexA, fatherRow);
              }
            });
            this.$notify({
              title: "失败",
              message: "组件绑定失败",
              type: "error",
              duration: 2000
            });
          });
      }
    },
    bindCompLatest(id, fatherRow) {
      fatherRow.binding = true;
      this.availableCompList.forEach((itemA, indexA) => {
        if (itemA.id === fatherRow.id) {
          this.$set(this.availableCompList, indexA, fatherRow);
        }
      });
      bindSingleCompHisToNode(this.currentNodeId, id)
        .then(res => {
          this.availableCompList.forEach((item, index) => {
            if (item.id === res.data.data.componentEntity.id) {
              let indexOfComp = this.compExpands.indexOf(
                res.data.data.componentEntity.id
              );
              if (indexOfComp !== -1) {
                this.compExpands.splice(indexOfComp, 1);
              }
              this.availableCompList.splice(index, 1);
              getNodeDetail(this.currentNodeId).then(res => {
                this.bindedCompList = res.data.data;
                this.nodeDetail = res.data.data;
              });
            }
          });
          // 重新请求节点列表
          this.getList();
        })
        .catch(() => {
          fatherRow.binding = false;
          this.availableCompList.forEach((itemA, indexA) => {
            if (itemA.id === fatherRow.id) {
              this.$set(this.availableCompList, indexA, fatherRow);
            }
          });
          this.$notify({
            title: "失败",
            message: "组件绑定失败",
            type: "error",
            duration: 2000
          });
        });
    },
    getRowKeysComp(row) {
      return row.id;
    },
    // 解绑组件
    unbindComp(row) {
      if (row.unBinding === true) {
        return;
      }
      row.unBinding = true;
      deleteBindDetail(row.id)
        .then(res => {
          row.unBinding = false;
          this.availableCompList.push(row.componentEntity);
          getNodeDetail(this.currentNodeId).then(res => {
            this.bindedCompList = res.data.data;
            this.nodeDetail = res.data.data;
          });
          // 重新请求节点列表
          this.getList();
          // 置空右侧绑定组件图标    nodeDetail: [],    currentNodeInfo: {},
          // thid.$refs.deployBindER.
        })
        .catch(() => {
          row.unBinding = false;
          this.$notify({
            title: "失败",
            message: "组件解绑失败",
            type: "error",
            duration: 2000
          });
        });
    },
    handleSwithCompVersion(row) {
      this.currentBindedComHisId = row.id;
    },
    chekHisVersion(row) {
      compHisVersions(row.componentEntity.id).then(res => {
        this.bindedCompList.forEach((item, index) => {
          if (item.id === row.id) {
            row.hisVersion = res.data.data;
            row.hisVersion.forEach((comps, indexOf) => {
              if (comps.id === row.componentHistoryEntity.id) {
                row.hisVersion.splice(indexOf, 1);
              }
            });
            Vue.set(this.bindedCompList, index, this.bindedCompList[index]);
            return;
          }
        });
      });
    },
    // 切换版本: 绑定组件
    switchCompHis(row) {
      updateCompHisToNode(this.currentBindedComHisId, row.id)
        .then(res => {
          document.getElementById("compClickTag").click();
          getNodeDetail(this.currentNodeId).then(res => {
            this.bindedCompList = res.data.data;
            this.nodeDetail = res.data.data;
          });
          // 重新请求节点列表
          this.getList();
        })
        .catch(() => {
          this.$notify({
            title: "失败",
            message: "版本切换失败",
            type: "error",
            duration: 2000
          });
        });
    },
    //绑定组件
    findNewestAndBind(row) {
      //限制绑定组件个数为1个
      if (this.bindedCompList.length === 1) {
        this.$message.error(
          "组件只能绑定一个! 请先解除已绑定组件后,在重新选择绑定组件"
        );
      } else if (this.bindedCompList.length === 0) {
        let query = {
          page: 0,
          size: 10,
          limit: 10
        };
        compHisVersion(row.id, query)
          .then(res => {
            if (res.data.data.totalElements > 0) {
              let id = res.data.data.content[0].id;
              this.bindCompLatest(id, row);
            } else {
              return;
            }
          })
          .catch(() => {
            this.$notify({
              title: "失败",
              message: "获取组件信息失败",
              type: "error",
              duration: 2000
            });
          });
      }
    },
    // ------------
    // findNewestAndBind(row) {
    //   let query = {
    //     page: 0,
    //     size: 10,
    //     limit: 10
    //   };
    //   compHisVersion(row.id, query)
    //     .then(res => {
    //       if (res.data.data.totalElements > 0) {
    //         let id = res.data.data.content[0].id;
    //         this.bindCompLatest(id, row);
    //       } else {
    //         return;
    //       }
    //     })
    //     .catch(() => {
    //       this.$notify({
    //         title: "失败",
    //         message: "获取组件信息失败",
    //         type: "error",
    //         duration: 2000
    //       });
    //     });
    // },
    // ------------
    keepUpdated(row, flag) {
      if (row.editing === true) {
        return;
      }
      row.editing = true;
      keepLatest(row.id, flag)
        .then(res => {
          row.editing = false;
          row.keepLatest = res.data.data.keepLatest;
          this.$notify({
            title: "成功",
            message: "",
            type: "success",
            duration: 2000
          });
        })
        .catch(() => {
          row.editing = false;
          this.$notify({
            title: "失败",
            message: "",
            type: "error",
            duration: 2000
          });
        });
    },
    // 绑定相关操作结束
    beforeSubmit: function(rowId, row) {
      //绑定前的准备工作 绑定前获取设备的id，获取所选部署设计的id
      this.componentHisIds = [];
      this.componentIds = [];
      this.bindCompsId = [];
      this.currentNodeId = rowId;
      // this.$refs.compMultiTable.clearSelection() 这种方法并不能获取到当前显示到表格，清空的永远是第一个在页面中渲染的弹出框内出表格选项，必须动态赋予表格ref值
      this.$nextTick(() => {
        // 根据每次显示到不同的节点的id 动态获取到当前显示到popover弹出框内的表格，否则清空的永远是第一个在页面中渲染的弹出框内出表格选项
        this.$refs["compTable" + rowId].clearSelection();
      });
      if (row) {
        this.currentNodeInfo = row;
      }
      this.complistLoading = true;
      this.listComp = [];

      //查询已绑定信息
      getNodeDetail(this.currentNodeId).then(response => {
        this.listBind = response.data.data;
        // this.total = response.data.total

        compList(this.proId, this.listQuery2)
          .then(response => {
            this.complistLoading = false;
            this.listComp = response.data.data.content;
            this.total2 = response.data.data.totalElements;
            this.listLoading = false;
            for (let j = 0; j < this.listComp.length; j++) {
              this.listComp[j].isBind = false;
              this.listComp[j].identify = this.listComp[j].id;
            }

            //this.listComp.isBind = false;

            this.bindCompsId.splice(0, this.bindCompsId.length);

            //为是否绑定赋值
            for (let i = 0; i < this.listBind.length; i++) {
              for (let j = 0; j < this.listComp.length; j++) {
                if (this.listBind[i].componentEntity) {
                  if (
                    this.listBind[i].componentEntity.id == this.listComp[j].id
                  ) {
                    //判断id是否相等
                    this.listComp[j].isBind = true;
                    this.listComp[j].bindHisComp = this.listBind[
                      i
                    ].componentHistoryEntity;
                    this.listComp[j].designDetailId = this.listBind[i].id;
                    this.bindCompsId.push(this.listComp[j].id);
                    break;
                  }
                }
              }
            }
          })
          .catch(() => {
            this.complistLoading = false;
            this.$notify({
              title: "失败",
              message: "获取信息失败",
              type: "error",
              duration: 2000
            });
          });
      });
    },
    submit: function() {
      //alert("hh");
      this.bindLoading = true;
      this.repeatCompsId.splice(0, this.repeatCompsId.length);
      if (this.componentHisIds.length !== 0) {
        let hisDataIds = (this.componentHisIds + "").replace(/\[|]/g, "");
        let hisData = {
          componentHistoryIds: hisDataIds
        };
        let qs = require("qs");
        let hisDataPost = qs.stringify(hisData);
        bindCompHisToNode(this.currentNodeId, hisDataPost)
          .then(() => {
            this.bindLoading = false;
            document.getElementById("clicktag").click();
            getNodeDetail(this.currentNodeId).then(res => {
              this.nodeDetail = res.data.data;
              // this.nodeDetail[0].currentNodeInfo = res.data.data[0].deploymentDesignNodeEntity
            });
            this.compExpands = [];
            this.$notify({
              title: "成功",
              message: "组件历史版本绑定成功",
              type: "success",
              duration: 2000
            });
          })
          .catch(() => {
            this.bindLoading = false;
            this.$notify({
              title: "失败",
              message: "组件历史绑定失败",
              type: "error",
              duration: 2000
            });
          });
      }
      if (this.componentIds.length !== 0) {
        for (let i = 0; i < this.componentIds.length; i++) {
          for (let j = 0; j < this.bindCompsId.length; j++) {
            if (this.bindCompsId[j] === this.componentIds[i]) {
              //判断选择的组件是否有已绑定的
              this.repeatCompsId.push(this.bindCompsId[j]);
            }
          }
        }

        /*if (this.repeatCompsId.length !== 0) {
            this.$message({
              type: 'warning',
              message: '有' + this.repeatCompsId.length + '个组件已绑定过！'
            })
            this.bindLoading = false
            return;
          }*/

        let dataBindId = (this.componentIds + "").replace(/\[|]/g, "");
        let data = {
          // 'deviceId': this.deviceCHId,
          componentIds: dataBindId
        };
        let qs = require("qs");
        let dataBind = qs.stringify(data);
        bindCompsToNode(this.currentNodeId, dataBind)
          .then(() => {
            this.bindLoading = false;
            getNodeDetail(this.currentNodeId).then(res => {
              this.nodeDetail = res.data.data;
              // this.nodeDetail[0].currentNodeInfo = res.data.data[0].deploymentDesignNodeEntity
            });
            document.getElementById("clicktag").click();
            this.$notify({
              title: "成功",
              message: "绑定成功",
              type: "success",
              duration: 2000
            });
            this.compExpands = [];
            /*getDeployComLists(this.deployPlanId, this.deviceCHId).then((res) => {
              this.bindedDeviceList = res.data.data
            })*/
            /*getAllBindDevices(this.deployPlanId).then((res) => {
              this.bindedDeviceList = res.data.data
            })*/
          })
          .catch(() => {
            this.bindLoading = false;
            this.$notify({
              title: "失败",
              message: "绑定失败",
              type: "error",
              duration: 2000
            });
          });
      } else if (
        this.componentIds.length === 0 &&
        this.componentHisIds.length === 0
      ) {
        this.$message({
          type: "warning",
          message: "无绑定信息!"
        });
        this.bindLoading = false;
      }
    },
    expandRow(row) {
      if (!row.hisVersion) {
        row.loading = true;
        compHisVersions(row.id).then(res => {
          /*row.hisVersion = res.data.data.content
            Vue.set(row.hisVersion, res.data.data.content)
            row.loading = false*/
          /*for(var j = 0; j < res.data.data.length; j++) {
              if(row.bindHisComp.id === res.data.data[j].id) {
                res.data.data[j].isBind === true
              }
            }*/
          for (let i = 0; i < this.listComp.length; i++) {
            if (res.data.data.length === 0) {
              this.listComp[i].loading = false;
              Vue.set(this.listComp, i, this.listComp[i]);
              return;
            }
            if (
              res.data.data.length > 0 &&
              this.listComp[i].id === res.data.data[0].componentEntity.id
            ) {
              this.listComp[i].loading = false;
              this.listComp[i].hisVersion = res.data.data;
              /*for(var j = 0; j < this.listComp[i].hisVersion.length; j++) {
                  this.listComp[i].hisVersion[j].isBind === false
                  if(this.listComp[i].hisVersion[j].id === this.listComp[i].bindHisComp.id) {
                    alert(2)
                    this.listComp[i].hisVersion[j].isBind === true
                  }
                  Vue.set(this.listComp[i].hisVersion, j, this.listComp[i].hisVersion[j])
                }*/
              Vue.set(this.listComp, i, this.listComp[i]);
            }
          }
        });
      }
    },
    getSelectHisId(row, fatherRow) {
      this.watchArr.push(row.id);
      fatherRow.selectedHisId = row.id;
      // this.componentIds.splice(this.componentIds.findIndex(item => item === fatherRow.identify), 1)
      for (let i = 0; i < this.componentIds.length; i++) {
        if (this.componentIds[i] === fatherRow.identify) {
          this.componentIds.splice(i, 1);
        }
      }
    },
    checkHisIsBind(row) {
      row.isBind = false;
      for (let i = 0; i < this.listComp.length; i++) {
        if (this.listComp[i].bindHisComp) {
          if (row.id === this.listComp[i].bindHisComp.id) {
            row.isBind = true;
            break;
          }
        }
      }
      if (row.isBind === true) {
        return 0;
      } else {
        return 1;
      }
    },
    disableAllHis(row) {
      row.isBind = false;
      for (let i = 0; i < this.listComp.length; i++) {
        if (this.listComp[i].bindHisComp) {
          if (row.id === this.listComp[i].bindHisComp.id) {
            row.isBind = true;
            break;
          }
        }
      }
      return 0;
    },
    deleteBindRelation(row) {
      // alert(1111)
      deleteBindDetail(row.designDetailId)
        .then(() => {
          this.$notify({
            title: "成功",
            message: "组件解绑成功",
            type: "success",
            duration: 2000
          });
          this.compExpands = [];
          document.getElementById("clicktag").click();
          this.beforeSubmit(this.currentNodeId);
          getNodeDetail(this.currentNodeId).then(res => {
            this.nodeDetail = res.data.data;
          });
        })
        .catch(() => {
          this.$notify({
            title: "失败",
            message: "组件解绑失败",
            type: "error",
            duration: 2000
          });
        });
    },
    getHis() {
      this.listLoading = true;
      let projectId = this.getCookie("projectId");
      hisDeployplan(projectId, this.listQuery).then(response => {
        this.isHistory = true;
        this.list = response.data.data.content;
        this.total = response.data.total;
        this.listLoading = false;
        this.listLength = response.data.data.length;
        this.total = response.data.data.totalElements;
      });
    },
    handleSizeChange(val) {
      this.listQuery.size = val;
      this.pagesize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val - 1;
      this.currentPage = val;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作成功",
        type: "success"
      });
      row.status = status;
    },
    resetTemp() {
      this.temp = {
        name: "",
        description: ""
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleUpdate(row) {
      this.selectedId = row.id;
      this.temp = Object.assign({}, row); // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      let qs = require("qs");
      this.$refs["dataForm"].validate(valid => {
        this.upDepLoading = true;
        if (valid) {
          let data = {
            name: this.temp.name,
            description: this.temp.description
          };

          const id = this.selectedId;

          let deployplanData = qs.stringify(data);
          updateDeployplan(deployplanData, id)
            .then(() => {
              this.upDepLoading = false;
              this.dialogFormVisible = false;
              this.$notify({
                title: "成功",
                message: "修改成功",
                type: "success",
                duration: 2000
              });
              this.getList();
            })
            .catch(error => {
              this.upDepLoading = false;
              this.errorMessage = "操作失败！";
              if (error.response.data.message) {
                this.errorMessage = error.response.data.message;
              }
              this.$notify({
                title: "修改失败",
                message: this.errorMessage,
                type: "error",
                duration: 2000
              });
            });
        }
      });
    },
    handleDelete(row) {
      let id = row.id;
      this.$confirm("确认删除吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteDeployplanNode(id)
            .then(() => {
              this.$notify({
                title: "成功",
                message: "删除节点成功",
                type: "success",
                duration: 2000
              });
              this.getList();
            })
            .catch(() => {
              this.$notify({
                title: "失败",
                message: "删除节点失败！",
                type: "error",
                duration: 2000
              });
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  },
  computed: {
    listAbleDevice() {
      let self = this;
      return self.currentDeviceList.filter(function(item) {
        return (
          item.hostAddress
            .toLowerCase()
            .indexOf(self.searchQueryDevice.toLowerCase()) !== -1
        );
      });
    },
    listA: function() {
      let self = this;
      return self.list.filter(function(item) {
        if (item.componentEntity) {
          return (
            item.componentEntity.name
              .toLowerCase()
              .indexOf(self.searchQuery.toLowerCase()) !== -1
          );
        } else {
          return item;
        }
      });
    },
    listB: function() {
      let self = this;
      return self.listComp.filter(function(item) {
        return (
          item.name.toLowerCase().indexOf(self.searchQuery2.toLowerCase()) !==
          -1
        );
      });
    },
    listAbleComp() {
      let self = this;
      return self.availableCompList.filter(function(item) {
        return (
          item.name
            .toLowerCase()
            .indexOf(self.searchAbleCompQuery.toLowerCase()) !== -1
        );
      });
    },
    listenProId() {
      return this.$store.state.app.projectId;
    },
    listenSelectHisComp() {
      return this.watchArr;
    },
    computedDisabled: function() {
      return function(row, fatherRow) {
        if (fatherRow.bindHisComp) {
          if (row.id === fatherRow.bindHisComp.id) {
            row.isBind = true;
          }
          return true;
        }
      };
    },
    computedBinding: function() {
      return function(row) {
        if (row.binding === true) {
          return true;
        }
      };
    },
    listenPopover() {
      if (document.getElementsByClassName("el-popover").length > 0) {
        if (
          document.getElementsByClassName("el-popover")[0].style.display ===
          "block"
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    listenCurrentNodeId() {
      return this.currentNodeId;
    }
  },
  watch: {
    listenProId: function(a, b) {
      this.getList();
    },
    listenSelectHisComp: function(a, b) {
      this.componentHisIds = [];
      for (var i = 0; i < this.listComp.length; i++) {
        if (this.listComp[i].selectedHisId) {
          this.componentHisIds.push(this.listComp[i].selectedHisId);
        }
        // this.componentIds.splice(this.componentIds.findIndex(item => item === this.listComp[i].identify), 1)
        // this.componentIds.splice(this.componentIds.findIndex(item => this.listComp[i].selectedHisId && ((item === this.listComp[i].identify))), 1)
      }
    }
  }
};
</script>

<style scoped>
.splicClass {
  min-height: 530px;
  position: relative;
  border: 1px solid lightgrey;
}

div.isBinded {
  background: #e6e6fa;
}

.pan-btn {
  font-size: 12px;
  color: #fff;
  padding: 3px 15px;
  border-radius: 2px;
  border: none;
  outline: none;
  margin-right: 0;
  transition: all 0.6s ease;
  position: relative;
  display: inline-block;
}

.el-button + .el-button {
  margin-left: 0;
}
.icon-update {
  color: #f56c6c;
  font-size: 22px;
  cursor: pointer;
  line-height: 26px;
  position: relative;
  top: 2px;
}
.comp-his:hover {
  background: rgb(245, 247, 250) !important;
}
.comp-his:nth-child(odd) {
  background: rgb(250, 250, 250);
}
</style>
