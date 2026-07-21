<!-- // /src/components/app/shell/environment-badge/EnvironmentBadge.vue -->

<script setup lang="ts">
import { environment } from "@/lib/environment";
import { getDeploymentColors } from "@/utils/deployment-colors";

const deploymentColors = getDeploymentColors(
  environment.deployment.toLowerCase(),
);

const badgeClass = [
  // layout
  "flex items-center gap-1.5 px-2",

  // typography
  "text-xs",

  // appearance
  "rounded-sm border",
  "backdrop-blur-sm backdrop-saturate-150",
  "border-surface-floating-border shadow-floating",
];

const badgeStyle = {
  backgroundColor: deploymentColors.bg,
  color: deploymentColors.text,
  borderColor: "color-mix(in oklab, currentColor 30%, transparent)",
};

const dotClass = "rounded-full shrink-0";

const dotStyle = {
  backgroundColor: deploymentColors.dot,
};
</script>

<template>
  <div :class="badgeClass" :style="badgeStyle">
    <span
      :class="[dotClass, 'size-1.5 ring-1 ring-white/20']"
      :style="dotStyle"
    />
    <span class="flex items-center gap-1">
      <span>{{ environment.deployment }}</span>
      <span :class="[dotClass, 'size-1 bg-current']" />
      <span>v{{ environment.version }}</span>
    </span>
  </div>
</template>
