<template>
  <div class="q-pa-md">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input
        filled
        v-model="domains"
        type="textarea"
        label="请输入查询域名"
        hint="Name and surname"
        lazy-rules
        clearable
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />

      <div class="text-center">
        <q-btn label="查询" type="submit" color="primary" :loading="loading"/>
        <q-btn
          v-if="loading"
          label="取消"
          color="grey"
          @click="onCancel"
          class="q-ml-sm"
        />
        <q-btn
          label="域名生成器"
          color="primary"
          @click="domainGenerate = !domainGenerate"
          flat
          class="q-ml-sm"
        />
      </div>
    </q-form>

    <q-dialog v-model="domainGenerate">
      <DomainGenerate
        @generated="onGenerated"
        @cancelGenerate="domainGenerate = false"
      ></DomainGenerate>
    </q-dialog>

    <div>
      <WhoisTable :data="data"></WhoisTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DomainGenerate from 'components/DomainGenerate.vue';
import type { WhoisInfo, WhoisTask } from 'src/interfaces';

import WhoisTable from 'components/WhoisTable.vue';
import {  parseDomainStr, whoisQueryQueue } from 'src/utils/domain';
import { useQuasar } from 'quasar';

const $q = useQuasar()
const domains = ref<string>('');
const domainGenerate = ref<boolean>(false);
const data = ref<Array<WhoisInfo>>([]);
const currentTask = ref<WhoisTask|undefined>(undefined)
const whoisQueue = ref<whoisQueryQueue|null>(null)
const loading = ref<boolean>(false);

const processWhois = async (domainArr:string[]) => {
  loading.value = true
  const limit = await window.myApi.getSetting('backendQueryLimit').catch((e) => console.log(e));
  if (domainArr.length <= limit) {
    if (whoisQueue.value) {
      whoisQueue.value.stop()
    }
    whoisQueue.value = getWhoisQueue(domainArr)
    whoisQueue.value.run((info:WhoisInfo) => {
      data.value.push(info);
    }).then(()=> {
        $q.notify({
          position: 'top',
          message: `已完成共${domainArr.length}个域名的whois查询`,
          color: 'primary',
        })
    }).catch(e => {
      $q.notify({
        position: 'top',
        message: `查询终止:`+e.toString(),
        color: 'red',
      })
    }).finally(()=>{
      loading.value = false
    })
  } else {
    window.myApi.addWhoisTask(domainArr).then( res => {
      console.log("WhoisVue.addWhoisTask: ", res)
      if (whoisQueue.value) {
        whoisQueue.value.stop()
      }
      whoisQueue.value = getWhoisQueue(domainArr)
      whoisQueue.value.run((info:WhoisInfo) => {
        data.value.push(info);
      }).then(()=> {
        $q.notify({
          position: 'top',
          message: `已完成共${domainArr.length}个域名的whois查询`,
          color: 'primary',
        })
      }).catch(e => {
        $q.notify({
          position: 'top',
          message: `查询终止:`+e.toString(),
          color: 'red',
        })
      }).finally(()=>{
        loading.value = false
      })
    }).catch((e:Error)=> {
      $q.notify({
        position: 'top',
        message: `查询失败:`+e.toString(),
        color: 'red',
      })
      loading.value = false
    })
  }
}

const onSubmit = async () => {
  const domainArr = parseDomainStr(domains.value);
  if (domainArr.length == 0) {
    $q.notify({
      position: 'top',
      message: '请输入要查询的域名,一行一个，也可以逗号分隔',
      color: 'negative',
    })
    return;
  }
  data.value = []
  await processWhois(domainArr)
};

const onCancel = () => {
  if (whoisQueue.value) {
    whoisQueue.value.stop()
  }
  loading.value = false
}

const onGenerated = (data: string[]) => {
  domains.value = data.join('\n');
  domainGenerate.value = false;
};

function getWhoisQueue(domains:string[]):whoisQueryQueue {
  return new whoisQueryQueue(3, domains, (d:string)=>window.myApi.getWhoisInfo(d))
}

onMounted(async  () => {
  const lastWhoisTaskId = await window.myApi.getSetting('lastWhoisTaskId')
  console.log("WhoisVue.onMounted lastWhoisTaskId:", lastWhoisTaskId)
  if (lastWhoisTaskId) {
    const taskInfo = await window.myApi.getWhoisTask(lastWhoisTaskId);
    console.log("WhoisVue.onMounted lastWhoisTaskInfo:", taskInfo)
    if (taskInfo?.domains) {
      const domainArr =  taskInfo.domains.split(",");
      data.value = []
      domains.value = domainArr.join("\n")
      await processWhois(domainArr)
    }
  }
  console.log("WhoisVue.onMounted currentTask:", currentTask.value)
});
</script>
