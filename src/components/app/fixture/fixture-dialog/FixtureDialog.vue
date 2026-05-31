<!-- // /src/components/app/fixture/fixture-dialog/FixtureDialog.vue -->

<script setup lang="ts">
import { ref, computed, watch } from "vue";

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

import { useConfirmDialog } from "@/composables/ui";
import { useProjectStore } from "@/stores/project";
import type { FixtureType, FixtureSubtype, Fixture } from "@/types/fixtures";
import type { WallKey } from "@/types/geometry";
import type { Room } from "@/types/project";

const props = defineProps<{
  open: boolean;
  room?: Room;
  fixture?: Fixture;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const store = useProjectStore();
const { fixtures } = store;

const FIXTURE_TYPES: FixtureType[] = [
  "door",
  "window",
  "fireplace",
  "toilet",
  "sink",
  "bathtub",
  "shower",
  "stairs",
];

const SUBTYPES: Partial<Record<FixtureType, FixtureSubtype[]>> = {
  door: ["standard", "french", "sliding", "pocket", "bifold"],
  window: ["standard", "bay", "casement", "sliding"],
  sink: ["standard", "pedestal", "double"],
  stairs: ["straight", "l-shaped", "u-shaped"],
};

const WALL_KEYS: WallKey[] = ["N", "S", "E", "W"];
const WALL_LABELS: Record<WallKey, string> = {
  N: "North",
  S: "South",
  E: "East",
  W: "West",
};

const type = ref<FixtureType | undefined>();
const subtype = ref<FixtureSubtype | undefined>();
const wall = ref<WallKey | undefined>();
const offsetFt = ref(2);
const offsetM = ref(0.6);
const facing = ref<"in" | "out" | undefined>();

const availableSubtypes = computed<FixtureSubtype[]>(() =>
  type.value ? (SUBTYPES[type.value] ?? []) : [],
);
const hasSubtypes = computed(() => availableSubtypes.value.length > 0);
const availableWalls = computed(() =>
  props.room
    ? WALL_KEYS.filter((w) => fixtures.wallAcceptsFixtures(props.room!, w))
    : [],
);

watch(type, (newType, oldType) => {
  if (!newType || newType === oldType) return;
  subtype.value = SUBTYPES[newType]?.[0];
});

watch(
  () => [props.open, props.fixture] as const,
  ([open, f]) => {
    if (!open) return;

    if (!f) {
      type.value = undefined;
      subtype.value = undefined;
      wall.value = undefined;
      offsetFt.value = 2;
      offsetM.value = 0.6;
      facing.value = undefined;
      return;
    }

    type.value = f.type;
    subtype.value = (f as { subtype?: FixtureSubtype }).subtype;
    wall.value = f.wall;
    offsetFt.value = Math.round(f.offsetCm / 30.48);
    offsetM.value = parseFloat((f.offsetCm / 100).toFixed(2));
    facing.value = f.facing;
  },
  { immediate: true },
);

function onSubmit() {
  if (!type.value || !wall.value || !props.room) return;

  const offsetCm =
    store.units === "imperial" ? offsetFt.value * 30.48 : offsetM.value * 100;

  const payload = {
    type: type.value,
    subtype: hasSubtypes.value ? subtype.value : undefined,
    wall: wall.value,
    offsetCm,
    facing: facing.value,
  };

  if (props.fixture) {
    fixtures.updateFixture(props.room, props.fixture.id, payload);
  } else {
    fixtures.addFixture(props.room, payload);
  }

  emit("update:open", false);
}

const { confirm } = useConfirmDialog();

async function onDelete() {
  if (!props.fixture || !props.room) return;
  const confirmed = await confirm({
    title: "Delete fixture?",
    description: "This fixture will be permanently removed.",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    variant: "destructive",
  });
  if (!confirmed) return;
  fixtures.removeFixture(props.room, props.fixture.id);
  emit("update:open", false);
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="w-100">
      <DialogHeader>
        <DialogTitle>{{
          fixture ? "Edit Fixture" : "Add Fixture"
        }}</DialogTitle>
      </DialogHeader>
      <DialogDescription class="sr-only">
        {{
          fixture
            ? "Edit the details of this fixture."
            : "Add a new fixture to the selected room."
        }}
      </DialogDescription>

      <div class="flex flex-col gap-4 py-2">
        <!-- Type -->
        <div class="flex flex-col gap-1.5">
          <Label id="label-fixture-type" for="fixture-type">Type</Label>

          <Select v-model="type">
            <SelectTrigger
              id="fixture-type"
              class="w-full"
              aria-labelledby="label-fixture-type"
            >
              <SelectValue placeholder="Select fixture type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem v-for="t in FIXTURE_TYPES" :key="t" :value="t">
                {{ t.charAt(0).toUpperCase() + t.slice(1) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Subtype -->
        <div v-if="hasSubtypes" class="flex flex-col gap-1.5">
          <Label id="label-fixture-subtype" for="fixture-subtype"
            >Subtype</Label
          >

          <Select v-model="subtype">
            <SelectTrigger
              id="fixture-subtype"
              class="w-full"
              aria-labelledby="label-fixture-subtype"
            >
              <SelectValue placeholder="Select subtype" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem v-for="s in availableSubtypes" :key="s" :value="s">
                {{ s.charAt(0).toUpperCase() + s.slice(1) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Wall -->
        <div class="flex flex-col gap-1.5">
          <Label id="label-fixture-wall" for="fixture-wall">Wall</Label>

          <Select v-model="wall">
            <SelectTrigger
              id="fixture-wall"
              class="w-full"
              aria-labelledby="label-fixture-wall"
            >
              <SelectValue placeholder="Select wall" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem v-for="w in availableWalls" :key="w" :value="w">
                {{ WALL_LABELS[w] }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Offset -->
        <div class="flex flex-col gap-1.5">
          <Label for="fixture-offset">
            Offset from corner ({{ store.units === "imperial" ? "ft" : "m" }})
          </Label>
          <Input
            v-if="store.units === 'imperial'"
            id="fixture-offset"
            v-model.number="offsetFt"
            type="number"
            min="0"
            step="1"
          />
          <Input
            v-else
            id="fixture-offset"
            v-model.number="offsetM"
            type="number"
            min="0"
            step="0.1"
          />
        </div>

        <!-- Facing -->
        <div class="flex flex-col gap-2">
          <Label>Facing</Label>

          <RadioGroup v-model="facing" class="flex gap-5">
            <div
              v-for="f in [undefined, 'in', 'out']"
              :key="String(f)"
              class="flex items-center gap-2"
            >
              <RadioGroupItem :id="`facing-${String(f)}`" :value="f" />

              <Label
                :for="`facing-${String(f)}`"
                class="cursor-pointer font-normal"
              >
                {{ f ?? "none" }}
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <DialogFooter class="flex items-center justify-between gap-2">
        <Button
          v-if="fixture"
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
          <Button size="sm" type="button" @click="onSubmit">
            {{ fixture ? "Save" : "Add Fixture" }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
