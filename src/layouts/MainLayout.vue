<template>
  <q-layout view="hHh lpR fff">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          WhoisApp
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer  class="bg-white text-grey-8">
      <q-toolbar>
        <q-toolbar-title> 版本：V0.3.3，联系QQ:479531993
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup lang="ts">


</script>
