<script setup lang="ts">
import {clx} from 'beeftools';
import {
  MotionFadeScale,
  SquareAction,
  type SquareActionEmits,
  type SquareActionProps,
  SvgIcon,
  type SvgIconId,
} from '@/primitives';

// TODO: Would be ideal to replace `iconPressed` with a
// transition that simply switches between `icon` prop changes.
export interface IconActionProps extends SquareActionProps {
  icon: SvgIconId;
  iconPressed?: SvgIconId;
  label?: string;
  filledLabel?: boolean;
  fullWidth?: boolean;
  pressedStyle?: boolean;
}

export type IconActionEmits = Pick<SquareActionEmits, 'action'>;

defineProps<IconActionProps>();
defineEmits<IconActionEmits>();
</script>

<template>
  <SquareAction
    :classes="
      clx('IconAction', {
        hasLabel: label?.length,
        disabled,
        filledLabel,
        fullWidth,
        pressed,
        pressedStyle,
      })
    "
    :a11y="a11y"
    :url="url"
    :external="external"
    :disabled="disabled"
    :pressed="pressed ? true : undefined"
    @action="(event) => $emit('action', event)"
  >
    <div class="IconFrame">
      <MotionFadeScale>
        <div
          v-if="!iconPressed || (iconPressed && !pressed)"
          class="Icon icon-wrapper"
        >
          <SvgIcon :id="icon" />
        </div>

        <div v-if="iconPressed && pressed" class="Icon icon-wrapper">
          <SvgIcon :id="iconPressed" />
        </div>
      </MotionFadeScale>
    </div>

    <div v-if="label?.length" class="LabelWrapper">
      <p class="Label">
        {{ label }}
      </p>
    </div>
  </SquareAction>
</template>

<style scoped>
.IconAction {
  --label-border-color: currentColor;

  &.disabled {
    > .LabelWrapper .Label {
      text-decoration: line-through var(--app-border-width);
    }
  }

  &[aria-pressed] {
    > .LabelWrapper {
      /* TODO: Add styles. */
    }
  }
}

.hasLabel {
  /* These styles override <SquareAction /> */
  display: flex;
  width: auto;

  &.fullWidth {
    width: 100%;
  }
}

.filledLabel {
  > .LabelWrapper {
    --label-border-color: transparent;
    color: var(--color-secondary);
    background-color: var(--color-primary);
  }

  &:focus-visible,
  &:hover {
    > .LabelWrapper {
      background-color: var(--color-interact);
    }
  }

  &:active {
    > .LabelWrapper {
      background-color: var(--color-interact-dark);
    }
  }
}

.pressed.pressedStyle {
  background-color: var(--color-primary);

  /*
    In order to keep the `box-shadow` and the `svg > fill` separate,
    we need to overwrite and re-apply some styles to <IconFrame />.
  */
  > .IconFrame {
    color: var(--color-secondary);
  }

  > .LabelWrapper {
    color: var(--color-primary);
    background-color: var(--color-secondary);
  }

  &:hover,
  &:focus-visible {
    background-color: var(--color-interact);

    > .LabelWrapper {
      color: var(--color-interact);
    }
  }

  &:active {
    background-color: var(--color-interact-dark);

    > .LabelWrapper {
      color: var(--color-interact-dark);
    }
  }
}

.IconFrame {
  display: grid;
  place-content: center;
  place-items: center;
  text-align: center;
  flex: 0 0 auto;
  width: var(--row-height);
  height: var(--row-height);
  /* Needed for aria-pressed styling */
  transition: color var(--duration-normal) var(--easing-cubic);
}

.Icon {
  grid-area: 1 / 1;
  width: var(--icon-size);
  height: var(--icon-size);
}

.LabelWrapper {
  display: grid;
  align-content: center;
  flex: 1 1 auto;
  margin-left: calc(var(--app-border-width) * -1);
  padding-left: var(--action-padding);
  padding-right: var(--action-padding);
  height: 100%;
  text-align: center;
  color: currentColor;
  background-color: var(--color-secondary);
  box-shadow: inset 0 0 0 var(--app-border-width) var(--label-border-color);
  transition-property: color, background-color, box-shadow;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.Label {
  @apply interaction-disable;
  @apply truncate;
  display: block;
  font-size: 1.6rem;
  white-space: nowrap;
}
</style>
