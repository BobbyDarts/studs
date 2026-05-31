<!-- // /src/components/app/shell/group-dialog/GroupDialog.vue -->

<script setup lang="ts">
import { ref, watch } from "vue";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useGroupDialog } from "@/composables/ui";

const { open, options, onConfirm, onCancel } = useGroupDialog();

const name = ref("");

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = options.value?.initialName ?? "";
  }
});

const titles: Record<string, string> = {
  create: "Create Group",
  rename: "Rename Group",
  merge: "Merge Groups",
};

const descriptions: Record<string, string> = {
  create: "Name the new group for the selected rooms.",
  rename: "Enter a new name for this group.",
  merge: "Enter a name for the merged group.",
};

const confirmLabels: Record<string, string> = {
  create: "Create",
  rename: "Rename",
  merge: "Merge",
};

function onSubmit() {
  if (!name.value.trim()) return;
  onConfirm(name.value.trim());
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => !v && onCancel()">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ titles[options?.mode ?? "create"] }}</DialogTitle>
        <DialogDescription>
          {{ descriptions[options?.mode ?? "create"] }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-1.5 py-2">
        <Label for="group-name">Name</Label>
        <Input
          id="group-name"
          v-model="name"
          placeholder="e.g. Master Suite"
          autocomplete="off"
          @keydown.enter="onSubmit"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" @click="onCancel">Cancel</Button>
        <Button size="sm" :disabled="!name.trim()" @click="onSubmit">
          {{ confirmLabels[options?.mode ?? "create"] }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
