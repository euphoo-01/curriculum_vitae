<template>
  <v-card
    variant="flat"
    class="flex flex-row px-8 w-fit items-center cursor-pointer border h-12 rounded-full transition-all duration-200 select-none"
    :class="[
      selected
        ? 'border-error'
        : 'bg-surface border-transparent hover:bg-on-surface/5',
      disabled ? 'opacity-70' : '',
    ]"
    :ripple="!disabled"
    @click="!disabled && $emit('click')"
  >
    <v-progress-linear
      :model-value="progressValue"
      :color="masteryColor"
      bg-color="secondary"
      bg-opacity="1"
      height="4"
      rounded
      class="mr-4 w-[100px] shrink-0"
    ></v-progress-linear>

    <div>{{ skill.name }}</div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Mastery } from '~~/graphql/generated/graphql';

const props = defineProps<{
  skill: { name: string; mastery: Mastery };
  disabled?: boolean;
  selected?: boolean;
}>();

defineEmits(['click']);

const progressValue = computed(() => {
  const map: Record<Mastery, number> = {
    [Mastery.Novice]: 20,
    [Mastery.Advanced]: 40,
    [Mastery.Competent]: 60,
    [Mastery.Proficient]: 80,
    [Mastery.Expert]: 100,
  };
  return map[props.skill.mastery] || 0;
});

const masteryColor = computed(() => {
  const map: Record<Mastery, string> = {
    [Mastery.Novice]: 'info',
    [Mastery.Advanced]: 'success',
    [Mastery.Competent]: 'warning',
    [Mastery.Proficient]: 'primary',
    [Mastery.Expert]: 'deep-purple',
  };
  return map[props.skill.mastery] || 'grey';
});
</script>
