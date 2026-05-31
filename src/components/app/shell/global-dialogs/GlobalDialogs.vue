<!-- // /src/components/app/shell/global-dialogs/GlobalDialogs.vue -->

<script setup lang="ts">
import {
  ConfirmDialog,
  GroupDialog,
  ShortcutReferenceDialog,
} from "@/components/app/shell";
</script>

<template>
  <ShortcutReferenceDialog />
  <ConfirmDialog />
  <GroupDialog />
</template>
