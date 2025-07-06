<template>
  <div class="q-pa-md">
    <q-table
      flat bordered
      title="域名信息"
      :rows="props.data"
      :columns="columns"
      row-key="domain"
      rows-per-page-label="每页数量"
      :pagination="initialPagination"
      :loading="loading"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      <template v-slot:top-right>
        <q-btn
          color="primary"
          icon-right="archive"
          label="导出csv"
          no-caps
          @click="exportCsv"
        />
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">

import { exportFile, useQuasar} from 'quasar'
import type {QTableColumn} from 'quasar'
import type { WhoisInfo } from 'src/interfaces';
import { WhoisInfoStatus } from 'src/interfaces';

const $q = useQuasar()

const initialPagination = {
  sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 20,
  // rowsNumber: xx if getting data from a server
}
interface Props {
  data?: Array<WhoisInfo>;
  loading?: boolean;
  fileName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: ():Array<WhoisInfo> => [],
  loading: false,
  fileName: "whois-table-export"
});

const columns:QTableColumn[]  = [
  {
    name: 'domain',
    label: '域名',
    field: 'domain',
    sortable : true,
  },{
    label: '查询结果',
    name: 'status',
    field: 'status',
    sortable : true,
    format: (val): string => {
      switch (val) {
        case WhoisInfoStatus.queryError:
          return '查询失败'
        case WhoisInfoStatus.registered:
          return '已注册'
        case WhoisInfoStatus.unregistered:
          return '未注册'
      }
      return '未知'
    }
  },{
    label: '注册状态',
    name: 'statusText',
    field: 'statusText',
    sortable : true,
  },{
    label: '注册日期',
    name: 'createTime',
    field: 'createTime',
    sortable : true,
  },{
    label: '过期时间',
    name: 'expireTime',
    field: 'expireTime',
    sortable : true,
  },{
    label: '更新时间',
    name: 'updateTime',
    field: 'updateTime',
    sortable : true,
  },{
    label: '注册商',
    name: 'registerName',
    field: 'registerName',
    sortable : true,
  },{
    label: '注册国家',
    name: 'registerCountry',
    field: 'registerCountry',
    sortable : true,
  },{
    label: '注册省市',
    name: 'registerStateProvince',
    field: 'registerStateProvince',
    sortable : true,
  },{
    label: '联系人',
    name: 'concatPerson',
    field: 'concatPerson',
    sortable : true,
  },{
    label: '联系人邮箱',
    name: 'concatEmail',
    field: 'concatEmail',
    sortable : true,
  },
  {  label: 'DNS服务器',
    name: 'dnsServer',
    field: 'dnsServer',
  },
  {  label: '最后查询时间',
    name: 'lastQueryTime',
    field: 'lastQueryTime',
  }
]

function wrapCsvValue (val:string, formatFn ?: QTableColumn['format'], row?: WhoisInfo) {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val
  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  return `"${formatted}"`
}

const exportCsv  = () =>  {
  if (props.data.length == 0) {
    $q.notify({
      position: 'top',
      message: '没有可导出的相关数据',
      color: 'warning',
      icon: 'warning'
    })
    return
  }
  // naive encoding to csv format
  const content = [columns.map(col => wrapCsvValue(col.label))].concat(
    props.data.map(row => columns.map(col => {
      wrapCsvValue(
        typeof col.field === 'function'
          ? col.field(row)
          : (row[(col.field === void 0 ? col.name : col.field) as keyof WhoisInfo]),
        col.format,
        row
      )
    }).join(','))
  ).join('\r\n')

  const status = exportFile(
    `${props.fileName}.csv`,
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      position: 'top',
      message: '文件下载失败...',
      color: 'negative',
      icon: 'warning'
    })
  }
}
</script>
