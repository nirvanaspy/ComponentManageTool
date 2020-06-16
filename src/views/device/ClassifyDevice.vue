<template>
  <keep-alive>
    <div class="classify-container">
      <div class="operate-btn">
        <el-button type="primary" size="mini" style="float: right;" @click="addDevice">添加设备</el-button>
        <el-button type="success" size="mini" style="float: right;margin-right: 4px;" @click="saveModel">保存布局
        </el-button>
      </div>
      <div class="page-diagram" id="myDiagramDiv"></div>
      <div class="page-palette" id="myPaletteDiv"></div>
      <el-dialog title="添加设备" :visible.sync="dialogFormVisible" width="40%" class="addDeviceDialog">
        <el-form :rules="deviceRules"
                 ref="dataForm"
                 :model="temp"
                 label-width="100px"
                 :disabled="temp.virtual"
                 style='width: 80%; margin:0 auto;'>
          <el-form-item :label="$t('table.deviceName')" prop="name">
            <el-input v-model="temp.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('table.deviceIP')" prop="hostAddress">
            <el-input v-model="temp.hostAddress"></el-input>
          </el-form-item>
          <el-form-item :label="$t('table.devicePath')" prop="deployPath">
            <el-tooltip placement="top">
              <div slot="content">此路径为设备接收部署文件的路径。例如:<br/>Windows: C:/test<br/>Linux: /test<br/>Vxworks: /test</div>
              <el-input v-model="temp.deployPath" placeholder="例如：D:/test"></el-input>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('table.deviceDesc')" prop="description">
            <el-input v-model="temp.description"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button type="primary"
                   @click="createData"
                   style="float: right;"
                   :loading="creDevLoading">
          {{$t('table.confirm')}}
        </el-button>
        <el-button @click="dialogFormVisible = false" style="float: right;margin-right: 10px">{{$t('table.cancel')}}
        </el-button>
      </span>
      </el-dialog>
    </div>
  </keep-alive>
</template>

<script>
  import { getAllDevices, saveDevices } from '@/api/device'
  import go from 'gojs'

  const $ = go.GraphObject.make
  export default {
    name: 'classifyDevice',
    data() {
      const validateIP = (rule, value, callback) => {
        const exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        const reg = value.match(exp)

        if (value.length === 0) {
          callback(new Error('请输入IP！'))
        } else if (reg == null) {
          callback(new Error('IP地址不合法！'))
        } else {
          callback()
        }
      }
      const validatePath = (rule, value, callback) => {
        const pattern = /^([a-zA-Z]:(\\))([a-zA-Z]*)|(\/([a-zA-Z]+))*$/

        if (value.length === 0) {
          callback(new Error('请输入路径！'))
        } else if (!(value.match(pattern))) {
          callback(new Error('路径格式不正确!'))
        } else {
          callback()
        }
      }
      return {
        modelStore: null,
        proId: '',
        diagram: null,
        palette: null,
        deviceList: [],
        nodeList: [],
        dialogFormVisible: false,
        creDevLoading: false,
        temp: {
          name: '',
          hostAddress: '',
          deployPath: '',
          description: ''
        },
        deviceRules: {
          name: [{ required: true, message: '请输入设备名', trigger: 'blur' }],
          hostAddress: [{ required: true, trigger: 'blur', validator: validateIP }],
          deployPath: [{ required: true, trigger: 'blur', validator: validatePath }]
        }
      }
    },
    methods: {
      finishDrop(e, grp) {
        // if (!(grp instanceof go.Group) || grp.diagram === null) return
        const ok = grp.addMembers(grp.diagram.selection, true)
        if (!ok) grp.diagram.currentTool.doCancel()
      },
      highlightGroup(e, grp, show) {
        if (!grp) return
        e.handled = true
        const bottomObject = grp.findObject('bottom')

        if (show) {
          bottomObject.fill = 'rgba(128,255,255,0.2)'
        } else {
          bottomObject.fill = 'white'
        }
      },
      getNodeSideTemplate(curserType, alignType) {
        return $(go.Shape, {
          alignment: alignType,
          cursor: curserType,
          desiredSize: new go.Size(6, 6),
          fill: 'lightblue',
          stroke: 'deepskyblue'
        })
      },
      getNodeResizeAdornmentTemplate() {
        return $(
          go.Adornment,
          'Spot',
          { locationSpot: go.Spot.Right },
          $(go.Placeholder),
          this.getNodeSideTemplate('nw-resize', go.Spot.TopLeft),
          this.getNodeSideTemplate('n-resize', go.Spot.Top),
          this.getNodeSideTemplate('ne-resize', go.Spot.TopRight),
          this.getNodeSideTemplate('w-resize', go.Spot.Left),
          this.getNodeSideTemplate('e-resize', go.Spot.Right),
          this.getNodeSideTemplate('se-resize', go.Spot.BottomLeft),
          this.getNodeSideTemplate('s-resize', go.Spot.Bottom),
          this.getNodeSideTemplate('sw-resize', go.Spot.BottomRight)
        )
      },
      buildDomainNodeTemplate() {
        return $(
          go.Group,
          'Vertical',
          {
            // fromLinkable: true,
            // toLinkable: true,
            minSize: new go.Size(100, 200)
          },
          {
            resizable: true,
            resizeObjectName: 'bottom',
            resizeAdornmentTemplate: this.getNodeResizeAdornmentTemplate(),
            locationObjectName: 'SHAPE'
          },
          {
            background: 'transparent',
            ungroupable: true,
            computesBoundsAfterDrag: true,
            computesBoundsIncludingLocation: true,
            // highlight when dragging into the Group
            mouseDragEnter: (e, grp, prev) => {
              this.highlightGroup(e, grp, true)
            },
            mouseDragLeave: (e, grp, next) => {
              this.highlightGroup(e, grp, false)
            },
            // if it fails, cancel the tool, rolling back any changes
            mouseDrop: this.finishDrop,
            handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links
            doubleClick: function(e, obj) {
              e.diagram.commandHandler.editTextBlock()
            }
          },
          { defaultStretch: go.GraphObject.Horizontal },
          new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
            go.Point.stringify
          ),
          $(
            go.Panel,
            'Table',
            $(
              go.Shape, 'RoundedRectangle',
              {
                // fromLinkable: true,
                // toLinkable: true,
                row: 0,
                minSize: new go.Size(100, 200)
              },
              {
                name: 'bottom',
                fill: 'white',
                stroke: '#999',
                strokeWidth: 2
              },
              /* new go.Binding("desiredSize").makeTwoWay(go.Size.stringify) */
              new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(
                go.Size.stringify
              )
            ),
            $(
              go.TextBlock,
              {
                row: 1
              },
              {
                font: 'normal normal normal 10pt 宋体',
                editable: true,
                isUnderline: false,
                isStrikethrough: false,
                minSize: new go.Size(10, NaN),
                margin: 5,
                stroke: '#333',
                text: '区域'
              },
              new go.Binding('text', 'text').makeTwoWay()
            )
          )
        )
      },
      buildDeviceNodeTemplate(device) {
        return $(
          go.Node,
          'Spot', // the Shape automatically fits around the TextBlock
          {
            locationSpot: go.Spot.Center,
            resizeObjectName: 'PICTURE',
            deletable: false
          },
          new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
            go.Point.stringify
          ),
          $(
            go.Panel,
            'Vertical',
            $(
              go.Picture,
              {
                name: 'PICTURE',
                desiredSize: new go.Size(40, 40),
                cursor: 'pointer',
                source: 'static/svg/device.svg',
                fromLinkable: true,
                toLinkable: true
              },
              new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(
                go.Size.stringify
              )
            ),
            $(
              go.TextBlock,
              {
                font: 'normal normal normal 10pt 宋体',
                editable: false,
                isUnderline: false,
                isStrikethrough: false,
                minSize: new go.Size(10, NaN),
                margin: 5,
                stroke: '#333',
                text: device.name
              },
              new go.Binding('text', 'text').makeTwoWay()
            )
          )
        )
      },
      getGroupTemplateMap() {
        const nodeMap = new go.Map()
        nodeMap.add('Domain', this.buildDomainNodeTemplate())
        return nodeMap
      },
      getNodeTemplateMap() {
        const nodeMap = new go.Map()
        nodeMap.add('Device', this.buildDeviceNodeTemplate('device'))
        return nodeMap
      },
      addNode(device) {
        if (!this.diagram) {
          return
        } else {
          this.diagram.add( // add an unbound Node to the diagram at a random position
            this.buildDeviceNodeTemplate(device)
          )
        }
      },
      init() {
        this.nodeList = []
        getAllDevices(this.proId).then(res => {
          this.deviceList = res.data.data
          this.diagram = $(go.Diagram, 'myDiagramDiv',
            {
              'undoManager.isEnabled': true
            })
          let nodeData = []
          const initData = []
          if (this.modelStore) {
            nodeData = this.modelStore.nodeDataArray
          }
          for (let i = 0; i < this.deviceList.length; i++) {
            const device = this.deviceList[i]
            const ifExistItem = nodeData.find(item => {
              return item.key === device.id
            })
            if (!ifExistItem) {
              initData.push({
                category: 'Device',
                key: device.id,
                text: device.name
              })
            } else {
              for (let j = 0; j < nodeData.length; j++) {
                if (device.id === nodeData[j].key) {
                  nodeData[j].text = device.name
                  initData.push(nodeData[j])
                }
              }
            }
          }
          nodeData.forEach((item) => {
            if (item.category !== 'Device') {
              initData.push(item)
            }
          })
          this.diagram.groupTemplateMap.add('Domain', this.buildDomainNodeTemplate())
          this.diagram.nodeTemplateMap.add('Device', this.buildDeviceNodeTemplate('device'))
          this.diagram.model = new go.GraphLinksModel(initData)
        })
      },
      initPalette() {
        this.palette =
          $(go.Palette, 'myPaletteDiv',
            {
              groupTemplateMap: this.getGroupTemplateMap(),
              nodeTemplateMap: this.getNodeTemplateMap(),
              model: new go.GraphLinksModel([
                { category: 'Domain', text: '区域', isGroup: true }
              ])
            })
      },
      addDevice() {
        this.dialogFormVisible = true
        this.temp = {
          name: '',
          hostAddress: '',
          deployPath: '',
          description: ''
        }
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.creDevLoading = true
            const formData = new FormData()
            formData.append('name', this.temp.name)
            formData.append('hostAddress', this.temp.hostAddress)
            formData.append('deployPath', this.temp.deployPath)
            formData.append('description', this.temp.description)
            saveDevices(this.proId, formData).then((res) => {
              this.creDevLoading = false
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              const device = res.data.data
              const addData = {
                category: 'Device',
                key: device.id,
                text: device.name
              }
              this.diagram.model.nodeDataArray.push(addData)
              this.diagram.model.addNodeData(addData)
            }).catch((error) => {
              this.creDevLoading = false
              this.errorMessage = '操作失败！'
              if (error.response.data.message) {
                this.errorMessage = error.response.data.message
              }
              this.$notify({
                title: '创建设备失败',
                message: this.errorMessage,
                type: 'error',
                duration: 2000
              })
            })
          }
        })
      },
      saveModel() {
        const modelData = JSON.stringify(this.diagram.model.toJson())
        localStorage.setItem(this.proId, modelData)
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 2000
        })
      }
    },
    created() {
      this.proId = this.getCookie('projectId')
      const modelData = localStorage.getItem(this.proId)
      this.modelStore = JSON.parse(JSON.parse(modelData))
    },
    mounted() {
      this.initPalette()
      this.init()
    }
  }
</script>

<style lang="scss" scoped>
  .classify-container {
    position: absolute;
    width: 100%;
    top: 80px;
    bottom: 0;
    padding: 20px;

    .operate-btn {
      height: 30px;
    }

    .page-diagram {
      display: inline-block;
      width: calc(100% - 160px);
      height: calc(100% - 40px);
      background: #fff;
      border: solid 1px black;
      margin-top: 10px;
    }

    .page-palette {
      display: inline-block;
      width: 150px;
      height: calc(100% - 40px);
      margin-right: 2px;
      background-color: #fff;
      border: solid 1px black
    }
  }

</style>
