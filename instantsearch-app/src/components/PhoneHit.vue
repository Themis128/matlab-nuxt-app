<template>
  <article>
    <img
      :src="imageUrl"
      :alt="modelName"
      style="
        width: 120px;
        height: 90px;
        object-fit: cover;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      "
      :onerror="`this.src='https://via.placeholder.com/120x90/667eea/ffffff?text=${encodeURIComponent(
        modelName.substring(0, 10)
      )}'; this.onerror=null;`"
    />
    <div>
      <h1>
        <ais-highlight :hit="hit" attribute="gsmarena.model_name" />
      </h1>
      <p><strong>Display:</strong> {{ displayType }}</p>
      <p><strong>Chipset:</strong> {{ chipset }}</p>
      <p><strong>IP Rating:</strong> {{ ipRating }}</p>
      <p>
        <strong>GSMArena:</strong>
        <a :href="url" target="_blank" style="color: #3b82f6">View Details</a>
      </p>
      <p style="font-size: 0.8rem; color: #6b7280">
        <strong>ID:</strong> {{ hit.objectID }}
      </p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  hit: {
    type: Object,
    required: true,
  },
});

const modelName = computed(
  () =>
    props.hit.gsmarena?.model_name || props.hit.model_name || 'Unknown Model'
);
const url = computed(() => props.hit.gsmarena?.url || '#');
const ipRating = computed(
  () => props.hit.gsmarena?.build?.ip_rating || 'Not specified'
);
const displayType = computed(() => {
  const type = props.hit.gsmarena?.display?.type || 'Not specified';
  return type.length > 50 ? `${type.substring(0, 50)}...` : type;
});
const chipset = computed(
  () => props.hit.gsmarena?.performance?.chipset || 'Not specified'
);

const imageUrl = computed(() => {
  // Create reliable inline SVG image (no external dependencies)
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="120" height="90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#4f46e5"/><text x="60" y="50" font-family="Arial" font-size="24" fill="white" text-anchor="middle">📱</text></svg>`
  )}`;
});
</script>

<style scoped>
article {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: white;
}

article img {
  flex-shrink: 0;
}

article div {
  flex: 1;
}

article h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

article p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
