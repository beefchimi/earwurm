<script setup lang="ts">
// Until we can automate the type inference,
// this type needs to be kept in sync with
// all assets found in this folder.
export type SvgIconId =
  | 'bolt'
  | 'chevron-left'
  | 'chevron-right'
  | 'clone-disabled'
  | 'clone'
  | 'close'
  | 'diamonds'
  | 'forward'
  | 'loop'
  | 'metronome'
  | 'muted'
  | 'once'
  | 'pause'
  | 'pitch'
  | 'play'
  | 'reverse'
  | 'speed'
  | 'star'
  | 'unmuted';

export interface SvgIconProps {
  id: SvgIconId;
}

defineProps<SvgIconProps>();
</script>

<template>
  <svg class="svg-base" aria-hidden="true">
    <use :xlink:href="`#icon-${id}`" />
  </svg>
</template>
