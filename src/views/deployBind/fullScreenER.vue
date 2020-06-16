<template>
  <div :class="className" :id="id" :style="{height:height,width:width,top:top}"></div>
</template>

<script>
  import echarts from 'echarts'
  import resize from '../../components/Charts/mixins/resize'
  import { deployNodeList, getNodeDetail } from '@/api/deployDesignNode'
  /* eslint-disable */
  export default {
    name: 'deploy-bind-er',
    mixins: [resize],
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      id: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '100%'
      },
      top: {
        type: String,
        default: '15px'
      }
    },
    data() {
      return {
        sourceDataList: [],
        chart: null,
        list: [],
        // currentNodeInfo: null,
        dataList: [],
        dataItem: {},
        linksList: [],
        linksItem: {},
        centerDevice: {},
        centerX: 300,
        centerY: 400,
        childX: 550,
        stepY: 200,
        title: '设备组件关系图',
        deployPlanId: '',
        deviceIcon: 'path://M723.626667 853.333333 614.4 853.333333l0-109.226667 112.64 0 0-71.68L71.68 672.426667 71.68 153.6l853.333333 0L925.013333 443.733333l58.026667 0c3.413333 0 10.24 0 13.653333 3.413333L996.693333 129.706667c0-27.306667-20.48-47.786667-47.786667-47.786667L47.786667 81.92C20.48 81.92 0 102.4 0 129.706667l0 566.613333c0 27.306667 20.48 47.786667 47.786667 47.786667l337.92 0L385.706667 853.333333 256 853.333333c-23.893333 0-44.373333 20.48-44.373333 44.373333 0 23.893333 20.48 44.373333 44.373333 44.373333l481.28 0c-6.826667-10.24-10.24-20.48-10.24-30.72L727.04 853.333333 723.626667 853.333333z M993.28 467.626667l-201.386667 0c-17.066667 0-30.72 13.653333-30.72 30.72l0 409.6c0 17.066667 13.653333 30.72 30.72 30.72l201.386667 0c17.066667 0 30.72-13.653333 30.72-30.72l0-409.6C1024 484.693333 1010.346667 467.626667 993.28 467.626667zM890.88 921.6c-6.826667 0-13.653333-6.826667-13.653333-13.653333 0-6.826667 6.826667-13.653333 13.653333-13.653333s13.653333 6.826667 13.653333 13.653333C904.533333 914.773333 897.706667 921.6 890.88 921.6zM1003.52 877.226667l-225.28 0 0-341.333333 225.28 0L1003.52 877.226667z',

    }
    },
    created() {
      this.deployPlanId = this.$route.params.id
    },
    mounted() {
      this.initChart()
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      this.chart.dispose()
      this.chart = null
    },
    methods: {
      getListData() {
        deployNodeList().then(() => {

        })
      },
      initChart() {
        this.chart = echarts.init(document.getElementById(this.id));

        this.chart.showLoading();
        let listQuery = {
            page: 0,
            size: 10,
            limit: 10
        }
        deployNodeList(this.deployPlanId, listQuery).then((res) => {
          let data = res.data.data.content
          this.dataList = {children: [], name:'总览图'}
          data.forEach((item) => {
            let listItem = {
              itemInfo: item,
              type: 'device',
              name: item.deviceEntity === null ? '未绑定设备' : item.deviceEntity.name,
              ipAddress: item.deviceEntity === null ? '--' : item.deviceEntity.hostAddress,
              symbol: this.deviceIcon,
              nodeId: item.id
            }
            this.dataList.children.push(listItem)
          })
          this.chart.hideLoading();

          /*echarts.util.each(this.dataList.children, function (datum, index) {
            index % 2 === 0 && (datum.collapsed = true);
          });*/

          this.initOption()
          let that = this
          this.chart.on('click', function(params) {
            console.log(params)
            if(params.data.collapsed === false) {
              return
            }
            let targetId = params.data.itemInfo.id
            // console.log(that.dataList)
            getNodeDetail(targetId).then((res) => {
              let addData = res.data.data
              addData.forEach((item) => {
                item.name = item.componentEntity.name
              })
              that.dataList.children.forEach((item)=> {
                if(item.nodeId === targetId) {
                  // console.log(item)
                  item.children = addData
                  item.collapsed = false
                  that.initOption()
                }
              })
            })
          });
        })
      },
      initOption() {
        this.chart.setOption({
          tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            formatter: function(item) {
              let res = item.name
              /*if(item.type === 'device') {
                console.log(item.ipAddress)
                res='名称：'+ item.name + 'IP:'+ item.ipAddress
              } else {
                res= item.name
              }*/
              return res;
            }
          },
          animationDurationUpdate: 300,
          animationEasingUpdate: 'quinticInOut',
          series: [
            {
              type: 'tree',
              roam: true,
              data: [this.dataList],
              top: '1%',
              left: '7%',
              bottom: '1%',
              right: '20%',
              symbolSize: 20,
              symbol: 'emptyCircle',
              symbolOffset: ['50%', 0],
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    textStyle: {
                      color: '#000',
                      fontSize: 14
                    }
                  },
                  lineStyle: {
                    color: '#aaa',
                    width: 1,
                    type: 'solid' // 'curve'|'broken'|'solid'|'dotted'|'dashed'
                  },
                  color: 'rgb(79, 97, 185)',
                  borderColor: 'rgb(79, 97, 185)'
                }
              },
              label: {
                normal: {
                  position: 'left',
                  verticalAlign: 'middle',
                  align: 'right',
                  fontSize: 9,
                }
              },
              leaves: {
                label: {
                  normal: {
                    position: 'right',
                    verticalAlign: 'middle',
                    align: 'left'
                  },
                }
              },

              expandAndCollapse: true,
              animationDuration: 550,
              animationDurationUpdate: 750
            }
          ]
        });
      },
      clickNode() {

      },
      initConfig() {
        // console.log(this.currentNodeInfo)
        if(this.list.length > 0) { // 绑定了组件
          // console.log(this.list[0])
          if(this.list[0].deploymentDesignNodeEntity.deviceEntity !== null) { // 绑定了设备和组件
            this.centerDevice = {
              name: this.list[0].deploymentDesignNodeEntity.deviceEntity.name,
              /*x: this.centerX,
              y: this.centerY,*/
              symbol: 'path://M723.626667 853.333333 614.4 853.333333l0-109.226667 112.64 0 0-71.68L71.68 672.426667 71.68 153.6l853.333333 0L925.013333 443.733333l58.026667 0c3.413333 0 10.24 0 13.653333 3.413333L996.693333 129.706667c0-27.306667-20.48-47.786667-47.786667-47.786667L47.786667 81.92C20.48 81.92 0 102.4 0 129.706667l0 566.613333c0 27.306667 20.48 47.786667 47.786667 47.786667l337.92 0L385.706667 853.333333 256 853.333333c-23.893333 0-44.373333 20.48-44.373333 44.373333 0 23.893333 20.48 44.373333 44.373333 44.373333l481.28 0c-6.826667-10.24-10.24-20.48-10.24-30.72L727.04 853.333333 723.626667 853.333333z M993.28 467.626667l-201.386667 0c-17.066667 0-30.72 13.653333-30.72 30.72l0 409.6c0 17.066667 13.653333 30.72 30.72 30.72l201.386667 0c17.066667 0 30.72-13.653333 30.72-30.72l0-409.6C1024 484.693333 1010.346667 467.626667 993.28 467.626667zM890.88 921.6c-6.826667 0-13.653333-6.826667-13.653333-13.653333 0-6.826667 6.826667-13.653333 13.653333-13.653333s13.653333 6.826667 13.653333 13.653333C904.533333 914.773333 897.706667 921.6 890.88 921.6zM1003.52 877.226667l-225.28 0 0-341.333333 225.28 0L1003.52 877.226667z',
              symbolSize: 40,
              itemStyle: {
                normal: {
                  // color: '#42b983',
                  color: 'rgb(55, 148, 255)',
                }
              },
              deviceInfo: this.list[0].deploymentDesignNodeEntity.deviceEntity
            }
          } else { // 未绑定设备， 绑定了组件
            this.centerDevice = {
              name: '暂未绑定设备',
              symbolSize: 40,
              symbol: 'circle',
              itemStyle: {
                normal: {
                  // color: '#42b983',
                  // color: 'rgb(55, 148, 255)',
                  color: '#ccc'
                }
              },
              deviceInfo: {}
            }
          }
        } else { // 未绑定组件
          if (this.currentNodeInfo.deviceEntity === null) { // 未绑定组件 未绑定设备
            this.centerDevice = {
              name: '暂未绑定设备与组件',
              symbol: 'circle',
              symbolSize: 40,
              itemStyle: {
                normal: {
                  // color: '#42b983',
                  // color: 'rgb(55, 148, 255)',
                  color: '#ccc'
                }
              },
              deviceInfo: {}
            }
          } else {
            let deviceAddress = this.currentNodeInfo.deviceEntity ? this.currentNodeInfo.deviceEntity.hostAddress + '暂未绑定组件' : '暂未绑定组件'
            this.centerDevice = { // 未绑定组件 绑定了设备
              name: deviceAddress,
              symbol: 'path://M723.626667 853.333333 614.4 853.333333l0-109.226667 112.64 0 0-71.68L71.68 672.426667 71.68 153.6l853.333333 0L925.013333 443.733333l58.026667 0c3.413333 0 10.24 0 13.653333 3.413333L996.693333 129.706667c0-27.306667-20.48-47.786667-47.786667-47.786667L47.786667 81.92C20.48 81.92 0 102.4 0 129.706667l0 566.613333c0 27.306667 20.48 47.786667 47.786667 47.786667l337.92 0L385.706667 853.333333 256 853.333333c-23.893333 0-44.373333 20.48-44.373333 44.373333 0 23.893333 20.48 44.373333 44.373333 44.373333l481.28 0c-6.826667-10.24-10.24-20.48-10.24-30.72L727.04 853.333333 723.626667 853.333333z M993.28 467.626667l-201.386667 0c-17.066667 0-30.72 13.653333-30.72 30.72l0 409.6c0 17.066667 13.653333 30.72 30.72 30.72l201.386667 0c17.066667 0 30.72-13.653333 30.72-30.72l0-409.6C1024 484.693333 1010.346667 467.626667 993.28 467.626667zM890.88 921.6c-6.826667 0-13.653333-6.826667-13.653333-13.653333 0-6.826667 6.826667-13.653333 13.653333-13.653333s13.653333 6.826667 13.653333 13.653333C904.533333 914.773333 897.706667 921.6 890.88 921.6zM1003.52 877.226667l-225.28 0 0-341.333333 225.28 0L1003.52 877.226667z',
              symbolSize: 40,
              itemStyle: {
                normal: {
                  // color: '#42b983',
                  color: 'rgb(55, 148, 255)'
                }
              },
              deviceInfo: this.currentNodeInfo.deviceEntity
            }
          }

        }

        this.dataList = []
        this.linksList = []
        this.dataList.push(this.centerDevice)
        for(let i=0;i<this.list.length;i++) {
          this.dataItem = {
            name: this.list[i].componentHistoryEntity.name,
            // name: this.list[i].componentEntity.name,
            /*x: this.childX,
            y: this.stepY*i,*/
            info: this.list[i],
            id: this.list[i].componentHistoryEntity.id
            // id: this.list[i].componentEntity.id
          }
          this.linksItem = {
            source: this.centerDevice.name,
            target: this.list[i].componentHistoryEntity.id,
            // target: this.list[i].componentEntity.id,
            // id: this.list[i].componentEntity.id
          }
          this.dataList.push(this.dataItem)
          this.linksList.push(this.linksItem)
        }
        /*console.log(this.dataList,'jjjjjj')
        console.log(this.linksList, 'lllll')*/
        if(this.linksList.length > 0) {
          this.title = '设备组件关系图'
        } else {
          this.title = '设备组件关系图(该节点暂无信息)'
        }
      },
      watchClick() {

      }
    },
    watch: {
      /*detaillist () {
        /!*console.log('我变啦！！')
        console.log(this.detaillist)*!/
        // alert('我变啦！')
        // console.log('detailList=========')
        // console.log(this.detaillist)
        this.list = this.detaillist
        this.initConfig()
        this.initChart()
      },*/
      /*currentNodeInfo () {
        this.list = this.detaillist
        this.initConfig()
        this.initChart()
      }*/
    }
  }
</script>
