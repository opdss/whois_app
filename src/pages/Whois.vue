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
        <q-btn label="查询" type="submit" color="primary" />
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
import { parseDomainStr } from 'src/utils/domain';
import {createWhoisInfo} from 'src/utils/domain';
import { sleep } from 'src/utils/utils';

const domains = ref<string>('');
const domainGenerate = ref<boolean>(false);
const data = ref<Array<WhoisInfo>>([]);
const currentTask = ref<WhoisTask|undefined>(undefined)

const processWhois = async (domainArr:string[]) => {
  const limit = await window.myApi.getSetting('backendQueryLimit').catch((e) => console.log(e));
  if (domainArr.length <= limit) {
    let total = 1
    for (let i=0;i<domainArr.length;i++) {
      if (total%30 == 0) {
        sleep(3)
      }
      const domain = domainArr[i] || ""
      await window.myApi
        .getWhoisInfo(domain)
        .then((info) => {
          if (!info?.fromCache) {
            total++
          }
          data.value.push(info);
        })
        .catch((err) => {
          console.log("onSubmit(window.myApi.getWhoisInfo):", err)
          total++
          data.value.push(createWhoisInfo(domain, null));
        });
    }
  } else {
    window.myApi.addWhoisTask(domainArr).then( async res => {
      console.log(res)
      for (let i=0;i<domainArr.length;i++) {
        const domain = domainArr[i] || ""
        await window.myApi
          .getWhoisInfo(domain)
          .then((info) => {
            data.value.push(info);
          })
          .catch((err) => {
            console.log("onSubmit(window.myApi.getWhoisInfo):", err)
            data.value.push(createWhoisInfo(domain, null));
          });
      }
    }).catch(err=> {
      console.log("onSubmit(window.myApi.addWhoisTask):err->", err)
    })
  }
}

const onSubmit = async () => {
  const domainArr = parseDomainStr(domains.value);
  if (domainArr.length == 0) {
    return;
  }
  data.value = []
  await processWhois(domainArr)
};

const onGenerated = (data: string[]) => {
  domains.value = data.join('\n');
  domainGenerate.value = false;
};

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
