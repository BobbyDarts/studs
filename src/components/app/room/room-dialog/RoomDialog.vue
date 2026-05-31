<!-- // /src/components/app/room/room-dialog/RoomDialog.vue -->

<script setup lang="ts">
import { ref, watch } from "vue";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { useConfirmDialog } from "@/composables/ui";
import { useProjectStore } from "@/stores/project";
import type { WallKey } from "@/types/geometry";
import type { Room, RoomType, RoomWalls } from "@/types/project";

const props = defineProps<{
  open: boolean;
  room?: Room;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const store = useProjectStore();
const { units } = store;

const name = ref("");
const type = ref<RoomType | undefined>();
const widthFt = ref(10);
const depthFt = ref(10);
const widthM = ref(3);
const depthM = ref(3);
const walls = ref<RoomWalls>({
  N: "solid",
  S: "solid",
  E: "solid",
  W: "solid",
});

const ROOM_TYPES: RoomType[] = [
  "bedroom",
  "bathroom",
  "kitchen",
  "living",
  "dining",
  "garage",
  "hallway",
  "other",
];

const WALL_KEYS: WallKey[] = ["N", "S", "E", "W"];
const WALL_LABELS: Record<WallKey, string> = {
  N: "North",
  S: "South",
  E: "East",
  W: "West",
};

const BOUNDARY_DESCRIPTIONS: Record<string, string> = {
  solid: "A rendered wall — fixtures can be placed on it",
  open: "No wall — open concept, no fixtures can be placed here",
  virtual:
    "Invisible boundary — fixtures can be placed but nothing is rendered",
};

watch(
  () => props.room,
  (room) => {
    if (!room) {
      name.value = "";
      type.value = undefined;
      widthFt.value = 10;
      depthFt.value = 10;
      widthM.value = 3;
      depthM.value = 3;
      walls.value = { N: "solid", S: "solid", E: "solid", W: "solid" };
      return;
    }
    name.value = room.name;
    type.value = room.type;
    walls.value = { ...room.walls };
    if (units === "imperial") {
      widthFt.value = Math.round(room.widthCm / 30.48);
      depthFt.value = Math.round(room.depthCm / 30.48);
    } else {
      widthM.value = parseFloat((room.widthCm / 100).toFixed(2));
      depthM.value = parseFloat((room.depthCm / 100).toFixed(2));
    }
  },
  { immediate: true },
);

function toCm(value: number): number {
  return units === "imperial" ? value * 30.48 : value * 100;
}

function onSubmit() {
  if (!name.value.trim() || !type.value) return;

  const widthCm = toCm(units === "imperial" ? widthFt.value : widthM.value);
  const depthCm = toCm(units === "imperial" ? depthFt.value : depthM.value);

  const payload = {
    name: name.value,
    type: type.value,
    widthCm,
    depthCm,
    walls: { ...walls.value },
  };

  if (props.room) {
    store.rooms.updateRoom(props.room.id, payload);
  } else {
    store.rooms.addRoom(payload);
  }

  emit("update:open", false);
}

const { confirm } = useConfirmDialog();

async function onDelete() {
  if (!props.room) return;
  const confirmed = await confirm({
    title: "Delete room?",
    description: `"${props.room.name}" and all its fixtures will be permanently removed.`,
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    variant: "destructive",
  });
  if (!confirmed) return;
  store.rooms.removeRoom(props.room.id);
  emit("update:open", false);
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="w-105">
      <DialogHeader>
        <DialogTitle>{{ room ? "Edit Room" : "Add Room" }}</DialogTitle>
      </DialogHeader>
      <DialogDescription class="sr-only">
        {{
          room
            ? "Edit the details of this room."
            : "Add a new room to the floorplan."
        }}
      </DialogDescription>

      <div class="flex flex-col gap-4 py-2">
        <!-- Name -->
        <div class="flex flex-col gap-1.5">
          <Label for="room-name">Name</Label>
          <Input
            id="room-name"
            v-model="name"
            placeholder="e.g. Primary Bedroom"
            autocomplete="off"
          />
        </div>

        <!-- Type -->
        <div class="flex flex-col gap-1.5">
          <Label for="room-type">Type</Label>

          <Select v-model="type">
            <SelectTrigger class="w-full" aria-labelledby="label-room-type">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem v-for="t in ROOM_TYPES" :key="t" :value="t">
                {{ t.charAt(0).toUpperCase() + t.slice(1) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Dimensions -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <Label for="room-width"
              >Width ({{ units === "imperial" ? "ft" : "m" }})</Label
            >
            <Input
              v-if="units === 'imperial'"
              id="room-width"
              v-model.number="widthFt"
              type="number"
              min="1"
              step="1"
            />
            <Input
              v-else
              id="room-width"
              v-model.number="widthM"
              type="number"
              min="1"
              step="1"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="room-depth"
              >Depth ({{ units === "imperial" ? "ft" : "m" }})</Label
            >
            <Input
              v-if="units === 'imperial'"
              id="room-depth"
              v-model.number="depthFt"
              type="number"
              min="1"
              step="1"
            />
            <Input
              v-else
              id="room-depth"
              v-model.number="depthM"
              type="number"
              min="1"
              step="1"
            />
          </div>
        </div>

        <!-- Wall boundaries -->
        <TooltipProvider>
          <div class="flex flex-col gap-2">
            <Label>Wall boundaries</Label>

            <div class="flex flex-col gap-3">
              <div
                v-for="wall in WALL_KEYS"
                :key="wall"
                class="grid grid-cols-[60px_1fr] items-center gap-3"
              >
                <span class="text-xs text-muted-foreground">
                  {{ WALL_LABELS[wall] }}
                </span>

                <RadioGroup v-model="walls[wall]" class="flex gap-4">
                  <Tooltip
                    v-for="boundary in ['solid', 'open', 'virtual']"
                    :key="boundary"
                  >
                    <TooltipTrigger as-child>
                      <div class="flex items-center gap-2">
                        <RadioGroupItem
                          :id="`${wall}-${boundary}`"
                          :value="boundary"
                        />
                        <Label
                          :for="`${wall}-${boundary}`"
                          class="cursor-pointer text-xs font-normal"
                        >
                          {{ boundary }}
                        </Label>
                      </div>
                    </TooltipTrigger>

                    <TooltipContent>
                      {{ BOUNDARY_DESCRIPTIONS[boundary] }}
                    </TooltipContent>
                  </Tooltip>
                </RadioGroup>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>

      <DialogFooter class="flex items-center justify-between gap-2">
        <Button
          v-if="room"
          variant="destructive"
          size="sm"
          type="button"
          @click="onDelete"
        >
          Delete
        </Button>
        <div class="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            type="button"
            @click="emit('update:open', false)"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            type="button"
            :disabled="!name.trim() || !type"
            @click="onSubmit"
          >
            {{ room ? "Save" : "Add Room" }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
