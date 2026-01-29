<template>
  <div 
    :class="[
      'blob-morphing',
      'blob-' + getComplexityLevel()
    ]"
    :style="{
      width: '120px',
      height: '120px',
      animationDuration: `${speed}s`,
      background: getBlobGradient(),
      filter: `blur(${wobble / 15}px)`,
      opacity: 0.9
    }"
  />
</template>

<script setup>
const props = defineProps({
  complexity: {
    type: Number,
    default: 50
  },
  speed: {
    type: Number,
    default: 2
  },
  wobble: {
    type: Number,
    default: 30
  },
  shade: {
    type: Number,
    default: 2
  },
  team: {
    type: String,
    default: 'structure'
  }
})

function getComplexityLevel() {
  if (props.complexity < 25) {
    return 'simple'
  } else if (props.complexity < 50) {
    return 'moderate'
  } else if (props.complexity < 75) {
    return 'complex'
  } else {
    return 'extreme'
  }
}

function getTeamShades(teamId) {
  const shades = {
    structure: [
      '#d1fae5',
      '#6ee7b7',
      '#10b981',
      '#059669',
      '#047857',
    ],
    program: [
      '#dbeafe',
      '#93c5fd',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
    ],
    data: [
      '#fee2e2',
      '#fca5a5',
      '#ef4444',
      '#dc2626',
      '#b91c1c',
    ],
  }
  return shades[teamId] || shades.structure
}

function getBlobGradient() {
  const shades = getTeamShades(props.team)
  
  const color1 = shades[Math.max(0, props.shade - 1)]
  const color2 = shades[props.shade]
  const color3 = shades[Math.min(4, props.shade + 1)]
  
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`
}
</script>

<style scoped>
.blob-morphing {
  border-radius: 50%;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

/* Simple: Almost circular with minimal morphing */
.blob-simple {
  animation-name: morph-simple;
}

@keyframes morph-simple {
  0%, 100% {
    border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
  }
  25% {
    border-radius: 55% 45% 50% 50% / 50% 55% 45% 50%;
  }
  50% {
    border-radius: 50% 50% 45% 55% / 50% 50% 50% 50%;
  }
  75% {
    border-radius: 45% 55% 50% 50% / 55% 45% 50% 50%;
  }
}

/* Moderate: More organic with 4-6 distinct points */
.blob-moderate {
  animation-name: morph-moderate;
}

@keyframes morph-moderate {
  0%, 100% {
    border-radius: 60% 40% 55% 45% / 50% 55% 45% 50%;
  }
  20% {
    border-radius: 45% 55% 60% 40% / 55% 50% 50% 45%;
  }
  40% {
    border-radius: 55% 45% 40% 60% / 45% 60% 40% 55%;
  }
  60% {
    border-radius: 40% 60% 50% 50% / 60% 40% 55% 45%;
  }
  80% {
    border-radius: 50% 50% 45% 55% / 50% 55% 45% 60%;
  }
}

/* Complex: Very organic with 6-8 points */
.blob-complex {
  animation-name: morph-complex;
}

@keyframes morph-complex {
  0%, 100% {
    border-radius: 65% 35% 70% 30% / 40% 60% 35% 65%;
  }
  16% {
    border-radius: 35% 65% 40% 60% / 70% 30% 65% 35%;
  }
  33% {
    border-radius: 60% 40% 35% 65% / 30% 70% 40% 60%;
  }
  50% {
    border-radius: 40% 60% 65% 35% / 65% 35% 70% 30%;
  }
  66% {
    border-radius: 70% 30% 60% 40% / 35% 65% 30% 70%;
  }
  83% {
    border-radius: 30% 70% 40% 60% / 60% 40% 65% 35%;
  }
}

/* Extreme: Highly irregular with 8+ points */
.blob-extreme {
  animation-name: morph-extreme;
}

@keyframes morph-extreme {
  0%, 100% {
    border-radius: 73% 27% 80% 20% / 30% 75% 25% 70%;
  }
  12.5% {
    border-radius: 25% 75% 35% 65% / 80% 20% 70% 30%;
  }
  25% {
    border-radius: 70% 30% 25% 75% / 20% 80% 35% 65%;
  }
  37.5% {
    border-radius: 35% 65% 73% 27% / 75% 25% 80% 20%;
  }
  50% {
    border-radius: 80% 20% 65% 35% / 27% 73% 30% 70%;
  }
  62.5% {
    border-radius: 20% 80% 30% 70% / 65% 35% 75% 25%;
  }
  75% {
    border-radius: 75% 25% 70% 30% / 35% 65% 20% 80%;
  }
  87.5% {
    border-radius: 30% 70% 20% 80% / 73% 27% 65% 35%;
  }
}
</style>
