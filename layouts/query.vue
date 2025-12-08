<template>
  <div class="flex min-h-screen flex-col bg-base-200">
    <!-- Header -->
    <header class="border-b border-base-300 bg-base-100">
      <div class="px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:chat-bubble-left-right" class="h-6 w-6 text-primary" />
            <div>
              <h1 class="text-xl font-bold text-base-content">Query Assistant</h1>
              <p class="text-sm opacity-70">
Ask questions about your devices and predictions
</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <DButton variant="ghost"
icon="heroicons:arrow-left" @click="navigateTo('/')">
              Back to Dashboard
            </DButton>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <!-- Chat Container -->
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
      <!-- Chat Messages -->
      <div ref="chatContainer" class="mb-4 flex-1 space-y-4 overflow-y-auto">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0"
class="py-12 text-center">
          <Icon name="heroicons:sparkles"
class="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 class="mb-2 text-xl font-semibold text-base-content">
Welcome to Query Assistant
</h2>
          <p class="mb-6 opacity-70">
            Ask me anything about your devices, predictions, or analytics
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            <DButton
              v-for="suggestion in quickSuggestions"
              :key="suggestion"
              variant="outline"
              size="sm"
              @click="sendMessage(suggestion)"
            >
              {{ suggestion }}
            </DButton>
          </div>
        </div>

        <!-- Messages -->
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex gap-3"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-3xl rounded-lg px-4 py-3"
            :class="
              message.role === 'user'
                ? 'bg-primary text-primary-content'
                : 'bg-base-100 text-base-content border border-base-300'
            "
          >
            <div class="flex items-start gap-2">
              <Icon
                :name="message.role === 'user' ? 'heroicons:user' : 'heroicons:sparkles'"
                class="mt-0.5 h-5 w-5 flex-shrink-0"
                :class="message.role === 'user' ? 'text-primary-content' : 'text-primary'"
              />
              <div class="flex-1">
                <div
v-if="message.role === 'assistant'" class="mb-1 font-medium">AI Assistant</div>
                <div class="whitespace-pre-wrap">
                  {{ message.content }}
                </div>
                <div v-if="message.timestamp"
class="mt-2 text-xs opacity-70">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoading"
class="flex justify-start">
          <div class="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
            <div class="flex items-center gap-2">
              <span class="loading loading-spinner loading-sm" />
              <span class="text-sm opacity-70">Thinking...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="border-t border-base-300 pt-4">
        <form class="flex gap-2" @submit.prevent="handleSubmit">
          <DInput
            v-model="inputMessage"
            placeholder="Ask a question about devices, predictions, or analytics..."
            class="flex-1"
            :disabled="isLoading"
          />
          <DButton
            type="submit"
            icon="heroicons:paper-airplane"
            size="lg"
            :loading="isLoading"
            :disabled="!inputMessage.trim()"
          >
            Send
          </DButton>
        </form>
        <p class="mt-2 text-center text-xs opacity-70">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const inputMessage = ref('');
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const chatContainer = ref<HTMLElement>();

const quickSuggestions = [
  'Show me device predictions',
  'What are the top devices?',
  'Compare model accuracy',
  'Explain the latest insights',
];

const sendMessage = async (message?: string) => {
  const userMessage = message || inputMessage.value.trim();
  if (!userMessage) return;

  // Add user message
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date(),
  });

  // Clear input
  inputMessage.value = '';
  isLoading.value = true;

  // Scroll to bottom
  await nextTick();
  scrollToBottom();

  // Simulate API call (replace with actual API)
  try {
    // TODO: Replace with actual API call to your backend
    const response = await $fetch<{ answer?: string; response?: string }>('/api/query', {
      method: 'POST',
      body: { query: userMessage },
    }).catch(() => {
      // Fallback response if API is not available
      return {
        answer: `I understand you're asking about "${userMessage}". This is a placeholder response. Connect your query API endpoint to get real answers about your devices, predictions, and analytics.`,
      };
    });

    // Add assistant response
    messages.value.push({
      role: 'assistant',
      content:
        response.answer ||
        (response as any).response ||
        'I received your query but could not generate a response.',
      timestamp: new Date(),
    });
  } catch {
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error processing your query. Please try again.',
      timestamp: new Date(),
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const handleSubmit = () => {
  sendMessage();
};

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

// Auto-scroll on new messages
watch(
  () => messages.value.length,
  () => {
    nextTick(() => scrollToBottom());
  }
);
</script>

<style scoped>
/* Smooth scrolling */
.overflow-y-auto {
  scroll-behavior: smooth;
}
</style>
