<script setup>
import { ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import DietLogTab from '../components/tabs/DietLogTab.vue'
import WorkoutLogTab from '../components/tabs/WorkoutLogTab.vue'
import RunningLogTab from '../components/tabs/RunningLogTab.vue'

// Character images
import tomaImg from '@/assets/images/toma.png'
import belleImg from '@/assets/images/belle.png'
import chieImg from '@/assets/images/chie.png'

// Active tab state
const activeTab = ref('diet')

// Tab configuration
const tabs = [
  {
    id: 'diet',
    name: 'Diet Log',
    character: 'Toma',
    image: tomaImg,
    color: 'pastel-red'
  },
  {
    id: 'workout',
    name: 'Workout Log',
    character: 'Belle',
    image: belleImg,
    color: 'pastel-yellow'
  },
  {
    id: 'running',
    name: 'Running Log',
    character: 'Chie',
    image: chieImg,
    color: 'pastel-blue'
  }
]

const setActiveTab = (tabId) => {
  activeTab.value = tabId
}
</script>

<template>
  <MainLayout>
    <template #default>
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-soft-black mb-4">Activity Log</h1>
        <p class="text-lg text-gray-500">Track your diet, workouts, and runs with your fitness companions</p>
      </div>

      <!-- Character Tab Navigation -->
      <div class="grid grid-cols-3 gap-6 mb-12">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="character-tab cursor-pointer transition-all duration-300 rounded-3xl p-6 border-2 flex flex-col items-center"
          :class="[
            activeTab === tab.id 
              ? 'bg-white shadow-2xl border-' + tab.color + ' scale-105 transform' 
              : 'bg-gray-50 hover:bg-white border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
          ]"
          @click="setActiveTab(tab.id)"
        >
          <!-- Character Image -->
          <div class="relative mb-4">
            <div 
              class="w-32 h-32 rounded-full overflow-hidden ring-4 transition-all duration-300"
              :class="activeTab === tab.id ? 'ring-' + tab.color : 'ring-gray-300'"
            >
              <img 
                :src="tab.image" 
                :alt="tab.character"
                class="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
              />
            </div>
            <!-- Active indicator -->
            <div 
              v-if="activeTab === tab.id"
              class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg"
              :class="'from-' + tab.color + ' to-' + tab.color + '/60'"
            >
              <span class="text-white text-xl">✓</span>
            </div>
          </div>
          
          <!-- Character Name -->
          <h3 
            class="text-xl font-bold mb-1 transition-colors"
            :class="activeTab === tab.id ? 'text-' + tab.color : 'text-gray-600'"
          >
            {{ tab.character }}
          </h3>
          <p class="text-sm text-gray-500 font-semibold">{{ tab.name }}</p>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="bg-white rounded-3xl shadow-soft p-8 border border-gray-100 min-h-[600px]">
        <!-- Animated tab transition -->
        <transition name="fade" mode="out-in">
          <component :is="activeTab === 'diet' ? DietLogTab : activeTab === 'workout' ? WorkoutLogTab : RunningLogTab" />
        </transition>
      </div>
    </template>
  </MainLayout>
</template>

<style scoped>
.character-tab {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.character-tab:hover {
  transform: translateY(-4px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
