<template>
  <v-card
    variant="flat"
    class="flex flex-row px-8 w-fit items-center cursor-pointer border h-12 rounded-full transition-all duration-200 select-none gap-6"
    :class="[
      selected
        ? 'border-error'
        : 'bg-surface border-transparent hover:bg-on-surface/5',
      disabled ? 'opacity-70' : '',
    ]"
    :ripple="!disabled"
    @click="!disabled && $emit('click')"
  >
    <div :class="`text-${proficiencyColor} font-bold`">
      {{ proficiencyText }}
    </div>
    <div>{{ language.name }}</div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Proficiency } from '~~/graphql/generated/graphql';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  language: { name: string; proficiency: Proficiency };
  disabled?: boolean;
  selected?: boolean;
}>();

defineEmits(['click']);

const { t } = useI18n();

const proficiencyColor = computed(() => {
  const map: Record<Proficiency, string> = {
    [Proficiency.A1]: 'info',
    [Proficiency.A2]: 'info',
    [Proficiency.B1]: 'success',
    [Proficiency.B2]: 'success',
    [Proficiency.C1]: 'primary',
    [Proficiency.C2]: 'primary',
    [Proficiency.Native]: 'deep-purple',
  };
  return map[props.language.proficiency] || 'grey';
});

const proficiencyText = computed(() => {
  return t(`proficiency.${props.language.proficiency}`);
});
</script>
