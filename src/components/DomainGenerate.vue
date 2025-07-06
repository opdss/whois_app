<template>
  <q-card class="q-pa-md">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="formData.prefix"
        type="text"
        label="域名前缀规则"
        hint="不用输入后缀，直接勾选下面列出来的后缀就行"
        :rules="[(val) => (val && val.length > 0) || '请输入域名规则']"
      />

      <div class="q-gutter-sm">
        <q-checkbox
          v-for="(item, idx) in DomainSuffix"
          v-model="formData.suffix"
          :val="item"
          :key="idx"
          :label="item"
        />
      </div>
      <!--      <div class="q-px-md q-mt-none">-->
      <!--       选择生成的后缀-->
      <!--      </div>-->

      <div class="q-gutter-sm">
        <template v-for="(item, idx) in DomainChars" :key="idx">
          <q-btn dense square @click="selectPrefix(idx)" :label="item.title">
            <q-badge floating color="blue" rounded @click="selectPrefix(idx)">{{
              item.chars.length
            }}</q-badge>
          </q-btn>
        </template>
      </div>

      <div class="text-right q-gutter-md">
        <q-chip square v-if="total > 0" class="bg-white">
          <span v-if="total > maxNumber" class="text-red"
            >生成数量最多{{ maxNumber }}个，太多容易崩溃</span
          >
          <span v-if="total <= maxNumber">此组合将生成域名{{ total }}个</span>
        </q-chip>
        <q-btn label="取消" type="reset" />
        <q-btn label="确认生成" type="submit" :disable="total > maxNumber" color="primary" />
      </div>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { DomainSuffix, DomainChars } from 'src/utils/domain';
import { ref, reactive, watchEffect } from 'vue';

const maxNumber = 20000;
const total = ref(0);
const formData = reactive({
  suffix: ['app'],
  prefix: '',
});
const emit = defineEmits(['generated', 'cancelGenerate']);

function domainGenReg(prefix: string, suffix: string[]):string[] {
  let domain:string[] = [prefix];
  for (let i = 0; i < DomainChars.length; i++) {
    const domainChar = DomainChars[i];
    if (!domainChar) {
      continue
    }
    const s = '{' + domainChar.title + '}';
    const typeArr = domainChar.chars;
    while (prefix.indexOf(s) != -1) {
      const arr = [];
      prefix = prefix.replace(s, '');
      for (let j = 0; j < typeArr.length; j++) {
        const typeStr = typeArr[j] || "";
        for (let k = 0; k < domain.length; k++) {
          arr.push((domain[k]||"").replace(s, typeStr));
        }
      }
      domain = arr;
    }
  }
  if (domain.length > 0) {
    const arr = [];
    for (let i = 0; i < suffix.length; i++) {
      const suf = suffix[i];
      for (let j = 0; j < domain.length; j++) {
        arr.push(domain[j] + '.' + suf);
      }
    }
    return arr;
  }
  return domain;
}
const selectPrefix = (idx: number) => {
  if (total.value > maxNumber) {
    return;
  }
  const pre = formData.prefix;
  if (DomainChars[idx]) {
    const s = '{' + DomainChars[idx].title + '}';
    formData.prefix = pre + s;
  }
};

const onSubmit = () => {
  //生成结果
  emit('generated', domainGenReg(formData.prefix, formData.suffix));
};
const onReset = () => {
  //取消生成
  emit('cancelGenerate');
};
function findBracesPairs(str: string):Array<string>{
  // 匹配 {...}，内容可以包含除了大括号外的任何字符
  // 使用 [^{}] 表示匹配非大括号字符
  const regex = /\{[^{}]*\}/g;
  return str.match(regex) || [];
}

watchEffect(() => {
  const prefix = formData.prefix;
  const suffix = formData.suffix;
  const pres = findBracesPairs(prefix);
  let cc = suffix.length;
  if (prefix != '') {
    for (let i = 0; i < pres.length; i++) {
      for (let j = 0; j < DomainChars.length; j++) {
        const dc = DomainChars[j]
        if (!dc) {
          continue
        }
        if ('{' + dc.title + '}' == pres[i]) {
          cc *= dc.chars.length;
        }
      }
    }
  } else {
    cc = 0;
  }
  total.value = cc;
});
</script>
